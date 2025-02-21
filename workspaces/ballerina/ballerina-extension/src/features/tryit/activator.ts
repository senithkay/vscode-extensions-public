import { commands, window, workspace, FileSystemWatcher, Disposable } from "vscode";
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { BallerinaExtension, ExtendedLangClient } from "src/core";
import { URI } from "vscode-uri";
import Handlebars from "handlebars";
import { findRunningBallerinaProcesses } from "./utils";
import { BallerinaProjectComponents, OpenAPISpec } from "@wso2-enterprise/ballerina-core";

let langClient: ExtendedLangClient | undefined;
let errorLogWatcher: FileSystemWatcher | undefined;

const TRYIT_TEMPLATE = `/*
### Try Service: "{{info.title}}" (http://localhost:{{port}}{{trim basePath}})
{{info.description}}
*/

{{#each paths}}
{{#each this}}
/*
#### {{uppercase @key}} {{@../key}}

{{#if parameters}}
{{#with (groupParams parameters)}}
{{#if path}}
**Path Parameters:**
{{#each path}}
- \`{{name}}\` [{{schema.type}}]{{#if description}} - {{description}}{{/if}}{{#if required}} (Required){{/if}}
{{/each}}
{{/if}}

{{#if query}}
**Query Parameters:**
{{#each query}}
- \`{{name}}\` [{{schema.type}}]{{#if description}} - {{description}}{{/if}}{{#if required}} (Required){{/if}}
{{/each}}
{{/if}}

{{#if header}}
**Header Parameters:**
{{#each header}}
- \`{{name}}\` [{{schema.type}}]{{#if description}} - {{description}}{{/if}}{{#if required}} (Required){{/if}}
{{/each}}
{{/if}}
{{/with}}
{{/if}}
*/
###
{{uppercase @key}} http://localhost:{{../../port}}{{trim ../../basePath}}{{{@../key}}}{{queryParams parameters}}{{#if parameters}}{{headerParams parameters}}{{/if}}
{{#if requestBody}}Content-Type: {{getContentType requestBody}}

{{generateRequestBody requestBody}}
{{/if}}

{{/each}}
{{/each}}`;

const HTTPYAC_CONFIG_TEMPLATE = `
const fs = require('fs');
const path = require('path');

// Define the log file path relative to the config file location
const LOG_FILE_PATH = path.join(__dirname, 'httpyac_errors.log');

// Helper function to format error groups
const formatErrorGroup = (title, params) => {
  if (params.length === 0) return '';
  return \`\${title}:\\n\${params.map(p => \`  - \${p}\`).join('\\n')}\\n\`;
};

module.exports = {
  configureHooks: function (api) {
    api.hooks.onRequest.addHook('validatePlaceholders', function (request) {
      const missingParams = {
        path: [],
        query: [],
        header: []
      };

      // Check URL path parameters
      const url = new URL(request.url);
      const decodedPath = decodeURIComponent(url.pathname);
      const pathParamRegex = /[{]([^{}]+)[}]/g;
      const pathMatches = [...decodedPath.matchAll(pathParamRegex)];
      
      pathMatches.forEach(match => {
        missingParams.path.push(match[1]);
      });

      // Check query parameters
      for (const [key, value] of url.searchParams.entries()) {
        if (value === '{?}') {
          missingParams.query.push(key);
        }
      }

      // Check headers
      for (const [key, value] of Object.entries(request.headers || {})) {
        if (value === '{?}') {
          missingParams.header.push(key);
        }
      }

      // Check if any parameters are missing
      const hasMissingParams = Object.values(missingParams)
        .some(group => group.length > 0);

      if (hasMissingParams) {
        const errorMessage = [
          \`Request to "\${request.url}" has missing required parameters:\\n\`,
          formatErrorGroup('Path Parameters', missingParams.path),
          formatErrorGroup('Query Parameters', missingParams.query),
          formatErrorGroup('Header Parameters', missingParams.header),
          '\\nPlease provide values for these parameters before sending the request.'
        ].filter(Boolean).join('\\n');

        // Write to log file
        fs.writeFileSync(LOG_FILE_PATH, errorMessage, 'utf8');
      }
    });
  }
};`;

export function activateTryItCommand(ballerinaExtInstance: BallerinaExtension) {
    langClient = ballerinaExtInstance.langClient as ExtendedLangClient;
    // Register try it command handler
    const disposable = commands.registerCommand(PALETTE_COMMANDS.TRY_IT, async (withNotice: boolean = false) => {
        await openTryItView(withNotice, ballerinaExtInstance);
    });
    
    // Clean up when deactivated
    return Disposable.from(disposable, {
        dispose: disposeErrorWatcher
    });
}

async function openTryItView(withNotice: boolean = false, ballerinaExtInstance: BallerinaExtension) {
    if (!langClient) {
        vscode.window.showErrorMessage('Ballerina Language Server is not connected');
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Please open a workspace first');
        return;
    }

    const services = await getAvailableServices(workspaceRoot);

    if (!services || services.length === 0) {
        vscode.window.showInformationMessage('No services found in the project');
        return;
    }

    if (withNotice) {
        const selection = await vscode.window.showInformationMessage(
            `${services.length} service${services.length === 1 ? '' : 's'} found in the integration. Test with Try It Client?`,
            "Test",
            "Cancel"
        );

        if (selection !== "Test") {
            return;
        }
    }

    // If there's more than one service, show the quick pick
    let selectedService: ServiceInfo;
    if (services.length > 1) {
        const quickPickItems = services.map(service => ({
            label: service.name,
            description: path.basename(service.filePath),
            service
        }));

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a service to try out',
            title: 'Available Services'
        });

        if (!selected) {
            return;
        }
        selectedService = selected.service;
    } else {
        selectedService = services[0];
    }

    const targetDir = path.join(workspaceRoot, 'target');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const fileName = path.parse(selectedService.filePath).name;
    const tryitFileName = `tryit.${fileName}.http`;
    const tryitFilePath = path.join(targetDir, tryitFileName);
    const configFilePath = path.join(targetDir, 'httpyac.config.js');

    const content = await generateTryItFileContent(workspaceRoot, selectedService);
    if (!content) {
        vscode.window.showErrorMessage('Failed to generate Try It content');
        return;
    }

    fs.writeFileSync(tryitFilePath, content);
    fs.writeFileSync(configFilePath, HTTPYAC_CONFIG_TEMPLATE);


    // Open the file as a notebook document
    const tryitFileUri = vscode.Uri.file(tryitFilePath);
    await vscode.commands.executeCommand('vscode.openWith', tryitFileUri, 'http');

    // Setup the error log watcher
    setupErrorLogWatcher(targetDir);
}

async function getAvailableServices(projectDir: string): Promise<ServiceInfo[]> {
    if (!langClient) {
        return [];
    }

    const components: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
        documentIdentifiers: [{ uri: URI.file(projectDir).toString() }]
    });

    const services = components.packages
        ?.flatMap(pkg => pkg.modules)
        .flatMap(module => module.services)
        .filter(service => service !== undefined)
        .map(service => ({
            name: service.name,
            filePath: service.filePath
        }));

    return services || [];
}

async function generateTryItFileContent(projectDir: string, service: ServiceInfo): Promise<string | undefined> {
    try {
        // Get OpenAPI definition
        const openapiSpec = await getOpenAPIDefinition(langClient, service);
        if (!openapiSpec) {
            return undefined;
        }

        // Get service port
        const selectedPort = await getServicePort(projectDir, service, openapiSpec);
        if (!selectedPort) {
            vscode.window.showErrorMessage('Failed to get the service port for the service');
        }

        // Register Handlebars helpers
        registerHandlebarsHelpers(openapiSpec);

        // Generate content using template
        const compiledTemplate = Handlebars.compile(TRYIT_TEMPLATE);
        return compiledTemplate({
            ...openapiSpec,
            port: selectedPort.toString(),
            basePath: service.name,
            serviceName: service.name
        });
    } catch (error) {
        vscode.window.showErrorMessage('An unexpected error occurred while generating the try-it file');
        return undefined;
    }
}

async function getOpenAPIDefinition(langClient: any, service: ServiceInfo): Promise<OAISpec | undefined> {
    if (!langClient) {
        vscode.window.showErrorMessage('Language client is not initialized');
        return undefined;
    }

    const openapiDefinitions: OpenAPISpec | 'NOT_SUPPORTED_TYPE' = await langClient.convertToOpenAPI({
        documentFilePath: service.filePath
    });

    if (openapiDefinitions === 'NOT_SUPPORTED_TYPE') {
        vscode.window.showErrorMessage('OpenAPI spec generation failed for the selected service');
        return undefined;
    }

    const matchingDefinition = (openapiDefinitions as OpenAPISpec).content.find(content =>
        path.basename(content.file) === path.basename(service.filePath)
    );

    if (!matchingDefinition) {
        vscode.window.showErrorMessage(`No matching OpenAPI definition found for service: ${service.name}`);
        return undefined;
    }

    return matchingDefinition.spec as OAISpec;
}

async function getServicePort(projectDir: string, service: ServiceInfo, openapiSpec: OAISpec): Promise<number | undefined> {
    // Try to get default port from OpenAPI spec first
    const defaultPort = openapiSpec.servers?.[0]?.variables?.port?.default;
    if (defaultPort) {
        const parsedPort = parseInt(defaultPort);
        if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
            return parsedPort;
        }
    }

    const balProcesses = await findRunningBallerinaProcesses(projectDir);
    if (!balProcesses?.length) {
        vscode.window.showErrorMessage('No running Ballerina processes found. Please start your service first.');
        return undefined;
    }

    const uniquePorts = [...new Set(balProcesses.flatMap(process => process.ports))];

    if (uniquePorts.length === 0) {
        vscode.window.showErrorMessage('No ports found in the running Ballerina processes');
        return undefined;
    }

    if (uniquePorts.length === 1) {
        return uniquePorts[0];
    }

    // If multiple ports, prompt user to select one
    const portItems = uniquePorts.map(port => ({
        label: `Port ${port}`, port
    }));

    const selected = await vscode.window.showQuickPick(portItems, {
        placeHolder: `Multiple ports detected. Please select the port configured for the service "${service.name}"`,
        title: 'Available Ports'
    });

    return selected?.port;
}

function registerHandlebarsHelpers(openapiSpec: OAISpec): void {
    if (!Handlebars.helpers.uppercase) {
        Handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
    }
    if (!Handlebars.helpers.trim) {
        Handlebars.registerHelper('trim', (str?: string) => str ? str.trim() : '');
    }

    // handlebar helper to process query parameters
    if (!Handlebars.helpers.queryParams) {
        Handlebars.registerHelper('queryParams', function (parameters) {
            if (!parameters || !parameters.length) {
                return '';
            }

            const queryParams = parameters
                .filter(param => param.in === 'query')
                .map(param => {
                    const value = param.schema?.default || `{?}`;
                    return `${param.name}=${value}`;
                })
                .join('&');

            return new Handlebars.SafeString(queryParams && queryParams.length > 0 ? `?${queryParams}` : '');
        });
    }

    // handlebar helper to process header parameters
    if (!Handlebars.helpers.headerParams) {
        Handlebars.registerHelper('headerParams', function (parameters) {
            if (!parameters || !parameters.length) {
                return '';
            }

            const headerParams = parameters
                .filter(param => param.in === 'header')
                .map(param => {
                    const value = param.schema?.default || `{?}`;
                    return `${param.name}: ${value}`;
                })
                .join('\n');

            return new Handlebars.SafeString(headerParams ? `\n${headerParams}` : '');
        });

        // Helper to group parameters by type (path, query, header)
        if (!Handlebars.helpers.groupParams) {
            Handlebars.registerHelper('groupParams', function (parameters) {
                if (!parameters || !parameters.length) {
                    return {};
                }

                return parameters.reduce((acc: any, param) => {
                    if (!acc[param.in]) {
                        acc[param.in] = [];
                    }
                    acc[param.in].push(param);
                    return acc;
                }, {});
            });
        }
    }

    if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', (value1, value2) => value1 === value2);
    }

    // Helper to get the content type from request body
    if (!Handlebars.helpers.getContentType) {
        Handlebars.registerHelper('getContentType', (requestBody) => {
            const contentTypes = Object.keys(requestBody.content);
            return contentTypes[0] || 'application/json';
        });
    }

    // Helper to generate schema description
    if (!Handlebars.helpers.generateSchemaDescription) {
        Handlebars.registerHelper('generateSchemaDescription', function (requestBody) {
            const contentType = Object.keys(requestBody.content)[0];
            const schema = requestBody.content[contentType].schema;
            // Pass the full OpenAPI spec context to resolve references
            return generateSchemaDoc(schema, 0, openapiSpec);
        });
    }

    // Helper to generate request body
    if (!Handlebars.helpers.generateRequestBody) {
        Handlebars.registerHelper('generateRequestBody', function (requestBody) {
            return new Handlebars.SafeString(generateRequestBody(requestBody, openapiSpec));
        });
    }
}

function generateSchemaDoc(schema: Schema, depth: number, context: OAISpec): string {
    const indent = '  '.repeat(depth);

    // Handle schema reference
    if ('$ref' in schema) {
        const resolvedSchema = resolveSchemaRef(schema.$ref, context);
        if (!resolvedSchema) {
            return "";
        }
        return generateSchemaDoc(resolvedSchema, depth, context);
    }

    if (schema.type === 'object' && schema.properties) {
        let doc = `${indent}${schema.type}\n`;
        for (const [propName, prop] of Object.entries(schema.properties)) {
            const propSchema = '$ref' in prop ? resolveSchemaRef(prop.$ref, context) || prop : prop;
            const format = propSchema.format ? `(${propSchema.format})` : '';
            const description = propSchema.description ? ` - ${propSchema.description}` : '';
            doc += `${indent}- ${propName}: ${propSchema.type}${format}${description}\n`;

            if (propSchema.type === 'object' && 'properties' in propSchema) {
                doc += generateSchemaDoc(propSchema, depth + 1, context);
            } else if (propSchema.type === 'array' && 'items' in propSchema) {
                const itemsSchema = '$ref' in propSchema.items
                    ? resolveSchemaRef(propSchema.items.$ref, context) || propSchema.items
                    : propSchema.items;
                doc += `${indent}  items: ${generateSchemaDoc(itemsSchema as Schema, depth + 1, context).trimStart()}`;
            }

            // Add enum values if present
            if (propSchema.enum) {
                doc += `${indent}  enum: [${propSchema.enum.join(', ')}]\n`;
            }
        }
        return doc;
    } else if (schema.type === 'array') {
        let doc = `array\n`;
        if (schema.type === 'array' && 'items' in schema) {
            const itemsSchema = '$ref' in schema.items
                ? resolveSchemaRef(schema.items.$ref, context) || schema.items
                : schema.items;
            doc += `${indent}items: ${generateSchemaDoc(itemsSchema as Schema, depth + 1, context).trimStart()}`;
        }
        return doc;
    }

    return `${schema.type}${schema.format ? ` (${schema.format})` : ''}`;
}

// Helper to get content type and generate appropriate payload
function generateRequestBody(requestBody: RequestBody, context: OAISpec): string {
    const contentType = Object.keys(requestBody.content)[0];
    const schema = requestBody.content[contentType].schema;
    const schemaDoc = generateSchemaDoc(schema, 1, context);
    const isJson = contentType === 'application/json';

    // Generate the comment block with schema documentation using line comments
    const commentLines = [
        `# ${getCommentText(contentType)}`
    ];
    if (schemaDoc.trim()) {
        commentLines.push(
            '#',
            '# Expected schema:',
            ...schemaDoc.split('\n').map(line => line.trim() ? `# ${line}` : '')
        );
    }

    // For JSON, generate sample data. For other types, return empty string
    const payload = isJson ? JSON.stringify(generateSampleValue(schema, context), null, 2) : '';
    return `${commentLines.join('\n')}\n${payload}`;
}

function getCommentText(contentType: string): string {
    switch (contentType) {
        case 'application/json':
            return 'Modify the JSON payload as needed';
        case 'application/x-www-form-urlencoded':
            return 'Complete the form URL-encoded payload';
        case 'multipart/form-data':
            return 'Complete the multipart form data payload';
        case 'text/plain':
            return 'Enter your text content here';
        default:
            return `Complete the payload for content type: ${contentType}`;
    }
}

function generateSampleValue(schema: Schema, context: OAISpec): any {
    // Handle schema reference
    if (schema.$ref) {
        const resolvedSchema = resolveSchemaRef(schema.$ref, context);
        if (!resolvedSchema) {
            return { error: `Reference not found: ${schema.$ref}` };
        }
        return generateSampleValue(resolvedSchema, context);
    }

    if (!schema.type) {
        return {};
    }

    switch (schema.type) {
        case 'object':
            if (!schema.properties) {
                return {};
            }
            const obj: Record<string, any> = {};
            for (const [propName, prop] of Object.entries(schema.properties)) {
                // Handle property references
                const propSchema = '$ref' in prop ? resolveSchemaRef(prop.$ref, context) || prop : prop;
                obj[propName] = generateSampleValue(propSchema as Schema, context);
            }
            return obj;

        case 'array':
            if (!schema.items) {
                return [];
            }
            // Handle array item references
            const itemsSchema = '$ref' in schema.items ? resolveSchemaRef(schema.items.$ref, context) || schema.items : schema.items;
            return [generateSampleValue(itemsSchema as Schema, context)];
        case 'string':
            if (schema.enum && schema.enum.length > 0) {
                return schema.enum[0];
            }
            if (schema.format) {
                switch (schema.format) {
                    case 'date':
                        return "2024-02-06";
                    case 'date-time':
                        return "2024-02-06T12:00:00Z";
                    case 'email':
                        return "user@example.com";
                    case 'uuid':
                        return "123e4567-e89b-12d3-a456-426614174000";
                    default:
                        return "{?}";
                }
            }
            return schema.default || "{?}";
        case 'integer':
        case 'number':
            return schema.default || 0;
        case 'boolean':
            return schema.default || false;
        case 'null':
            return null;
        default:
            return undefined;
    }
}

function resolveSchemaRef(ref: string, context: OAISpec): Schema | undefined {
    if (!ref.startsWith('#/')) {
        // Currently only supporting local references
        return undefined;
    }

    const parts = ref.substring(2).split('/');
    let current: any = context;

    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }

    return current as Schema;
}

// Function to setup error log watching
function setupErrorLogWatcher(targetDir: string) {
    const errorLogPath = path.join(targetDir, 'httpyac_errors.log');

    // Dispose existing watcher if any
    disposeErrorWatcher();

    if (!fs.existsSync(errorLogPath)) {
        fs.writeFileSync(errorLogPath, '');
    }

    // Setup the file watcher Watch for changes in the error log file
    errorLogWatcher = workspace.createFileSystemWatcher(errorLogPath);
    errorLogWatcher.onDidChange(() => {
        try {
            const content = fs.readFileSync(errorLogPath, 'utf-8');
            if (content.trim()) {
                // Show a notification with "Show Details" button
                window.showWarningMessage(
                    'The request contains missing required parameters. Please provide values for the placeholders before sending the request.',
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        // Show the full error in an output channel
                        const outputChannel = window.createOutputChannel('Kola Tryit - Log');
                        outputChannel.appendLine(content.trim());
                        outputChannel.show();
                    }
                });
            }
        } catch (error) {
            console.error('Error reading error log file:', error);
        }
    });
}

// cleanup function for the watcher
function disposeErrorWatcher() {
    if (errorLogWatcher) {
        errorLogWatcher.dispose();
        errorLogWatcher = undefined;
    }
}

// Service information interface
interface ServiceInfo {
    name: string;
    filePath: string;
}

// Main OpenAPI specification interface
interface OAISpec {
    openapi: string;
    info: Info;
    servers?: Server[];
    paths: Record<string, Record<string, Operation>>;
    components?: Components;
}

interface Contact {
    name?: string;
    url?: string;
    email?: string;
}

interface License {
    name: string;
    url?: string;
}

interface Info {
    title: string;
    description?: string;
    version: string;
    contact?: Contact;
    license?: License;
}

interface Schema {
    $ref?: string;
    type?: string;
    properties?: Record<string, Schema>;
    items?: Schema;
    description?: string;
    format?: string;
    default?: any;
    enum?: any[];
}

interface Server {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariable>;
}

interface ServerVariable {
    default: string;
    description?: string;
    enum?: string[];
}

interface Property {
    type: string;
    description?: string;
}

interface Operation {
    summary?: string;
    description?: string;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
}

interface Parameter {
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    schema?: Schema;
}

interface Content {
    schema: Schema;
}

interface RequestBody {
    description?: string;
    content: Record<string, Content>;
}

interface Response {
    description: string;
    content?: Record<string, Content>;
}

interface Components {
    schemas?: Record<string, Schema>;
}
