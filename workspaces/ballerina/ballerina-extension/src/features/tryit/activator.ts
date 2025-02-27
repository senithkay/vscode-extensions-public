import { commands, window, workspace, FileSystemWatcher, Disposable } from "vscode";
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { BallerinaExtension } from "src/core";
import Handlebars from "handlebars";
import { clientManager, findRunningBallerinaProcesses, handleError } from "./utils";
import { BIDesignModelResponse, OpenAPISpec } from "@wso2-enterprise/ballerina-core";

let errorLogWatcher: FileSystemWatcher | undefined;

const TRYIT_TEMPLATE = `/*
### {{#if isResourceMode}}Try Resource: "{{resourcePath}}"{{else}}Try Service: "{{serviceName}}" (http://localhost:{{port}}{{trim basePath}}){{/if}}
{{info.description}}
*/

{{#each paths}}
{{#each this}}
/*
{{#unless ../../isResourceMode}}#### {{uppercase @key}} {{@../key}}{{/unless}}

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
    try {
        clientManager.setClient(ballerinaExtInstance.langClient);

        // Register try it command handler
        const disposable = commands.registerCommand(PALETTE_COMMANDS.TRY_IT, async (withNotice: boolean = false, resourceMetadata?: ResourceMetadata) => {
            try {
                await openTryItView(withNotice, resourceMetadata);
            } catch (error) {
                handleError(error, "Opening Try It view failed");
            }
        });

        return Disposable.from(disposable, {
            dispose: disposeErrorWatcher
        });
    } catch (error) {
        handleError(error, "Activating Try It command");
    }
}

async function openTryItView(withNotice: boolean = false, resourceMetadata?: ResourceMetadata) {
    try {
        if (!clientManager.hasClient()) {
            throw new Error('Ballerina Language Server is not connected');
        }

        const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
        if (!workspaceRoot) {
            throw new Error('Please open a workspace first');
        }

        const services: ServiceInfo[] = await getAvailableServices(workspaceRoot);
        if (!services || services.length === 0) {
            vscode.window.showInformationMessage('No HTTP services found in the project');
            return;
        }

        if (withNotice && !resourceMetadata) {
            const selection = await vscode.window.showInformationMessage(
                `${services.length} service${services.length === 1 ? '' : 's'} found in the integration. Test with Try It Client?`,
                "Test",
                "Cancel"
            );

            if (selection !== "Test") {
                return;
            }
        }

        let selectedService: ServiceInfo;
        // If in resource try it mode, find the service containing the resource path
        if (resourceMetadata?.pathValue) {
            const matchingService = await findServiceForResource(services, resourceMetadata);
            if (!matchingService) {
                vscode.window.showErrorMessage(`Could not find a service containing the resource path: ${resourceMetadata.pathValue}`);
                return;
            }

            selectedService = matchingService;
        } else if (services.length > 1) {
            const quickPickItems = services.map(service => ({
                label: `'${service.basePath}' on ${service.listener}`,
                description: `HTTP Service`,
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

        const tryitFileName = `tryit.http`;
        const tryitFilePath = path.join(targetDir, tryitFileName);
        const configFilePath = path.join(targetDir, 'httpyac.config.js');

        const content = await generateTryItFileContent(workspaceRoot, selectedService, resourceMetadata);
        if (!content) {
            return;
        }

        fs.writeFileSync(tryitFilePath, content);
        fs.writeFileSync(configFilePath, HTTPYAC_CONFIG_TEMPLATE);

        const tryitFileUri = vscode.Uri.file(tryitFilePath);
        await openInSplitView(tryitFileUri, 'http');

        // Setup the error log watcher
        setupErrorLogWatcher(targetDir);
    } catch (error) {
        handleError(error, "Opening Try It view");
    }
}

// Generic utility function for opening files in split view
async function openInSplitView(fileUri: vscode.Uri, editorType: string = 'default') {
    try {
        // Ensure we have a two-column layout
        await vscode.commands.executeCommand('workbench.action.editorLayoutTwoColumns');

        // Focus right editor group explicitly
        await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup');

        // Open the file with specified editor type in the current (right) group
        if (editorType === 'default') {
            await vscode.commands.executeCommand('vscode.open', fileUri);
        } else {
            await vscode.commands.executeCommand('vscode.openWith', fileUri, editorType);
        }

        // Focus left editor group to return to the original editor
        await vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup');
    } catch (error) {
        handleError(error, "Opening file in split view");
    }
}

async function findServiceForResource(services: ServiceInfo[], resourceMetadata: ResourceMetadata): Promise<ServiceInfo | undefined> {
    try {
        // Normalize path values for comparison
        const targetPath = resourceMetadata.pathValue?.trim();
        if (!targetPath) {
            return undefined;
        }

        // check all services' OpenAPI specs to see which one contains the path
        // TODO: Optimize this by checking only the relevant service once we have the lang server support for that
        for (const service of services) {
            try {
                const openapiSpec: OAISpec = await getOpenAPIDefinition(service);
                const matchingPaths = Object.keys(openapiSpec.paths || {}).filter((specPath) => {
                    return comparePathPatterns(specPath, targetPath);

                });

                if (matchingPaths.length > 0) {
                    return service;
                }
            } catch (error) {
                continue;
            }
        }

        return undefined;
    } catch (error) {
        handleError(error, "Finding service for resource", false);
        return undefined;
    }
}

async function getAvailableServices(projectDir: string): Promise<ServiceInfo[]> {
    try {
        const langClient = clientManager.getClient();

        const response: BIDesignModelResponse = await langClient.getDesignModel({
            projectPath: projectDir
        }).catch((error: any) => {
            throw new Error(`Failed to get design model: ${error.message || 'Unknown error'}`);
        });

        const services = response.designModel.services
            .filter(service => service.type.toLowerCase().includes('http'))
            .map(service => ({
                name: service.displayName || service.absolutePath.startsWith('/') ? service.absolutePath.trim().substring(1) : service.absolutePath.trim(),
                basePath: service.absolutePath.trim(),
                filePath: service.location.filePath,
                listener: service.attachedListeners.map(listener => response.designModel.listeners.find(l => l.uuid === listener)?.symbol).join(', ')
            }));

        return services || [];
    } catch (error) {
        handleError(error, "Getting available services", false);
        return [];
    }
}

async function generateTryItFileContent(projectDir: string, service: ServiceInfo, resourceMetadata?: ResourceMetadata): Promise<string | undefined> {
    try {
        // Get OpenAPI definition
        const openapiSpec = await getOpenAPIDefinition(service);

        // Get service port
        const selectedPort = await getServicePort(projectDir, service, openapiSpec);

        // Register Handlebars helpers
        registerHandlebarsHelpers(openapiSpec);

        let isResourceMode = false;
        let resourcePath = '';
        // Filter paths based on resourceMetadata if provided
        if (resourceMetadata?.pathValue) {
            const originalPaths = openapiSpec.paths;
            const filteredPaths: Record<string, Record<string, Operation>> = {};

            let matchingPath = '';
            for (const path in originalPaths) {
                const pathMatches = comparePathPatterns(path, resourceMetadata.pathValue);
                if (pathMatches) {
                    matchingPath = path;
                    break;
                }
            }

            if (matchingPath && originalPaths[matchingPath]) {
                // Set resource mode flag and path
                isResourceMode = true;
                resourcePath = matchingPath;

                if (resourceMetadata.methodValue) {
                    const method = resourceMetadata.methodValue.toLowerCase();
                    if (originalPaths[matchingPath][method]) {
                        // Create entry with only the specified method
                        filteredPaths[matchingPath] = {
                            [method]: {
                                ...originalPaths[matchingPath][method],
                                // Add a custom property to indicate this is the selected resource
                                description: originalPaths[matchingPath][method].description
                                    ? `${originalPaths[matchingPath][method].description} (Selected Resource)`
                                    : '(Selected Resource)'
                            }
                        };
                    } else {
                        // Method not found in matching path
                        vscode.window.showWarningMessage(
                            `Method ${resourceMetadata.methodValue} not found for path ${matchingPath}. Showing all methods for this path.`
                        );
                        filteredPaths[matchingPath] = originalPaths[matchingPath];
                    }
                } else {
                    filteredPaths[matchingPath] = originalPaths[matchingPath];
                }

                openapiSpec.paths = filteredPaths;
            } else {
                // Path not found in OpenAPI spec
                vscode.window.showWarningMessage(
                    `Path ${resourceMetadata.pathValue} not found in service ${service.name || service.basePath}. Showing all resources.`
                );
            }
        }

        // Generate content using template
        const templateData = {
            ...openapiSpec,
            port: selectedPort.toString(),
            basePath: service.basePath,
            serviceName: service.name || 'Default',
            isResourceMode: isResourceMode,
            resourcePath: resourcePath
        };

        const compiledTemplate = Handlebars.compile(TRYIT_TEMPLATE);
        return compiledTemplate(templateData);
    } catch (error) {
        handleError(error, "Try It client initialization failed");
        return undefined;
    }
}


// Helper function to compare path patterns, considering path parameters
function comparePathPatterns(specPath: string, targetPath: string): boolean {
    const specSegments = specPath.split('/').filter(Boolean);
    const targetSegments = targetPath.split('/').filter(Boolean);

    if (specSegments.length !== targetSegments.length) {
        return false;
    }

    // Compare segments, allowing for path parameters
    for (let i = 0; i < specSegments.length; i++) {
        const specSeg = specSegments[i];
        const targetSeg = sanitizeBallerinaPathSegment(targetSegments[i]);

        // TODO - improve path parameter matching with exact type comparison
        if (specSeg.startsWith('{') && specSeg.endsWith('}')) {
            continue;
        }

        if (specSeg !== targetSeg) {
            return false;
        }
    }

    return true;
}

async function getOpenAPIDefinition(service: ServiceInfo): Promise<OAISpec> {
    try {
        const langClient = clientManager.getClient();

        const openapiDefinitions: OpenAPISpec | 'NOT_SUPPORTED_TYPE' = await langClient.convertToOpenAPI({
            documentFilePath: service.filePath
        });

        if (openapiDefinitions === 'NOT_SUPPORTED_TYPE') {
            throw new Error(`OpenAPI spec generation failed for the service with base path: '${service.basePath}'`);
        }

        const matchingDefinition = (openapiDefinitions as OpenAPISpec).content.filter(content =>
            content.serviceName.toLowerCase() === service?.name.toLowerCase()
            || (content.spec?.servers[0]?.url.endsWith(service.basePath) && service?.name === '')
            || (content.spec?.servers[0]?.url == undefined && service?.name === '' // TODO: Update the condition after fixing the issue in the OpenAPI tool
            ));

        if (matchingDefinition.length === 0) {
            throw new Error(`Failed to find matching OpenAPI definition: No service matches the base path '${service.basePath}' ${service.name !== '' ? `and service name '${service.name}'` : ''}`);
        }

        if (matchingDefinition.length > 1) {
            throw new Error(`Ambiguous service reference: Multiple matching OpenAPI definitions found for ${service.name !== '' ? `service '${service.name}'` : `base path '${service.basePath}'`}`);
        }

        return matchingDefinition[0].spec as OAISpec;
    } catch (error) {
        handleError(error, "Getting OpenAPI definition", false);
        throw error; // Re-throw to be caught by the caller
    }
}

async function getServicePort(projectDir: string, service: ServiceInfo, openapiSpec: OAISpec): Promise<number> {
    try {
        // Try to get default port from OpenAPI spec first
        let portInSpec: number;
        const portInSpecStr = openapiSpec.servers?.[0]?.variables?.port?.default;
        if (portInSpecStr) {
            const parsedPort = parseInt(portInSpecStr);
            portInSpec = isNaN(parsedPort) ? parsedPort : undefined;
        }

        const balProcesses = await findRunningBallerinaProcesses(projectDir)
            .catch(error => {
                throw new Error(`Failed to find running Ballerina processes: ${error.message}`);
            });

        if (!balProcesses?.length) {
            throw new Error('No running Ballerina processes found. Please run your service first.');
        }

        const uniquePorts: number[] = [...new Set(balProcesses.flatMap(process => process.ports))];
        if (portInSpec && uniquePorts.includes(portInSpec)) {
            return portInSpec;
        }

        if (uniquePorts.length === 0) {
            throw new Error('No service ports found in running Ballerina processes');
        }

        if (uniquePorts.length === 1) {
            return uniquePorts[0];
        }

        // If multiple ports, prompt user to select one
        const portItems = uniquePorts.map(port => ({
            label: `Port ${port}`, port
        }));

        const selected = await vscode.window.showQuickPick(portItems, {
            placeHolder: `Port auto-detection failed due to multiple service ports. Pick the correct port for the service '${service.name || service.basePath}' to continue`,
        });

        if (!selected) {
            throw new Error('No port selected for the service');
        }

        return selected.port;
    } catch (error) {
        handleError(error, "Getting service port", false);
        throw error;
    }
}

function registerHandlebarsHelpers(openapiSpec: OAISpec): void {
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

    if (!Handlebars.helpers.not) {
        Handlebars.registerHelper('not', function (value) {
            return !value;
        });
    }

    if (!Handlebars.helpers.uppercase) {
        Handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
    }
    
    if (!Handlebars.helpers.trim) {
        Handlebars.registerHelper('trim', (str?: string) => str ? str.trim() : '');
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

function sanitizeBallerinaPathSegment(pathSegment: string): string {
    let sanitized = pathSegment.trim();
    // Remove escaped characters
    sanitized = sanitized.replace(/\\/g, '');
    // Remove leading single quote if present
    if (sanitized.startsWith("'")) {
        sanitized = sanitized.substring(1);
    }
    return sanitized;
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
    name?: string;
    basePath: string;
    filePath: string;
    listener: string;
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

interface ResourceMetadata {
    methodValue?: string;
    pathValue?: string;
}
