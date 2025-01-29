import { commands } from "vscode";
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { BallerinaExtension, ExtendedLangClient } from "src/core";
import { URI } from "vscode-uri";
import Handlebars from "handlebars";
import { findRunningBallerinaProcesses } from "./utils";
import { BallerinaProjectComponents, OpenAPISpec, NOT_SUPPORTED_TYPE } from "@wso2-enterprise/ballerina-core";

let langClient: ExtendedLangClient | undefined;

export function activateTryItCommand(ballerinaExtInstance: BallerinaExtension) {
    langClient = ballerinaExtInstance.langClient as ExtendedLangClient;
    // register try it command handler
    commands.registerCommand(PALETTE_COMMANDS.TRY_IT, async (withNotice: boolean = false) => {
        await openTryItView(withNotice, ballerinaExtInstance);
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

    const content = await generateTryItFileContent(workspaceRoot, selectedService);
    if (!content) {
        vscode.window.showErrorMessage('Failed to generate Try It content');
        return;
    }

    fs.writeFileSync(tryitFilePath, content);

    // Open the file as a notebook document
    const tryitFileUri = vscode.Uri.file(tryitFilePath);
    await vscode.commands.executeCommand('vscode.openWith', tryitFileUri, 'http');
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
    if (!langClient) {
        return undefined;
    }

    // Get the openapi definitions from LS for the selected service
    const openapiDefinitions: OpenAPISpec | NOT_SUPPORTED_TYPE = await langClient.convertToOpenAPI({
        documentFilePath: service.filePath
    });

    if (openapiDefinitions === 'NOT_SUPPORTED_TYPE') {
        vscode.window.showErrorMessage('OpenAPI generation is not supported for the selected service');
        return undefined;
    }

    const balProcesses = await findRunningBallerinaProcesses(projectDir);
    if (!balProcesses || balProcesses.length === 0) {
        vscode.window.showErrorMessage('No running Ballerina processes found. Please start your service first.');
        return undefined;
    }

    const allPorts = balProcesses.flatMap(process => process.ports);
    const uniquePorts = [...new Set(allPorts)];

    let selectedPort: number;
    if (uniquePorts.length > 1) {
        const portItems = uniquePorts.map(port => ({
            label: `Port ${port}`,
            port
        }));

        const selected = await vscode.window.showQuickPick(portItems, {
            placeHolder: `Multiple ports detected. Please select the port configured for the service "${service.name}"`,
            title: 'Available Ports'
        });

        if (!selected) {
            return undefined;
        }

        selectedPort = selected.port;
    } else if (uniquePorts.length === 1) {
        selectedPort = uniquePorts[0];
    } else {
        vscode.window.showErrorMessage('No ports found in the running Ballerina processes');
        return undefined;
    }

    // Find the matching OpenAPI definition based on file path
    const matchingDefinition = (openapiDefinitions as OpenAPISpec).content.find(content =>
        path.basename(content.file) === path.basename(service.filePath)
    );

    if (!matchingDefinition) {
        vscode.window.showErrorMessage(`No matching OpenAPI definition found for service: ${service.name}`);
        return undefined;
    }

    const openapiSpec = matchingDefinition.spec as OAISpec;

    if (!Handlebars.helpers.uppercase) {
        Handlebars.registerHelper('uppercase', function (str) {
            return str.toUpperCase();
        });
    }
    if (!Handlebars.helpers.trim) {
        Handlebars.registerHelper('trim', function (str) {
            return str ? str.trim() : '';
        });
    }

    const template = `/*
### Try Service : "{{info.title}}" ({{../../serviceName}})
{{info.description}}
*/

{{#each paths}}
{{#each this}}
/*
**{{uppercase @key}} {{@../key}}**

{{#if parameters}}
\`\`\`
Parameters:
{{#each parameters}}
- {{name}} ({{in}}){{#if required}} [Required]{{/if}}{{#if description}}: {{description}}{{/if}}
{{/each}}
{{/if}}
\`\`\`
*/
###
{{uppercase @key}} http://localhost:{{../../port}}{{trim ../../basePath}}{{@../key}}
{{#if requestBody}}
Content-Type: application/json

{
    // Add request body here
}
{{/if}}

{{/each}}
{{/each}}`;

    // Compile and execute the template with the matching OpenAPI spec
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({
        ...openapiSpec,
        port: selectedPort.toString(),
        basePath: service.name,
        serviceName: service.name
    });
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
    type: string;
    properties?: Record<string, Property>;
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
