import { commands } from "vscode";
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { BallerinaExtension, ExtendedLangClient } from "src/core";
import { URI } from "vscode-uri";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { forEach } from "lodash";
import Handlebars from "handlebars";
import { findRunningBallerinaServices } from "./utils";

let langClient: ExtendedLangClient | undefined;

export function activateTryItCommand(ballerinaExtInstance: BallerinaExtension) {
    langClient = ballerinaExtInstance.langClient as ExtendedLangClient;
    // register try it command handler
    commands.registerCommand(PALETTE_COMMANDS.TRY_IT, async (withNotice: boolean = false) => {
        await openTryItView(withNotice, ballerinaExtInstance);
    });
}

interface ServiceInfo {
    name: string;
    filePath: string;
}

async function openTryItView(withNotice: boolean = false, ballerinaExtInstance: BallerinaExtension) {
    if (!langClient) {
        vscode.window.showErrorMessage('Ballerina Language Server is not connected');
        return;
    }

    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Please open a workspace first');
        return;
    }

    // Get all available services
    const services = await getAvailableServices(workspaceRoot);
    
    if (!services || services.length === 0) {
        vscode.window.showInformationMessage('No services found in the project');
        return;
    }

    // If withNotice is true, show the initial prompt
    if (withNotice) {
        const selection = await vscode.window.showInformationMessage(
            `Found ${services.length} service(s) in the integration. Do you want to open Try It?`,
            "Yes",
            "No"
        );

        if (selection !== "Yes") {
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

         // User cancelled the selection
        if (!selected) {
            return;
        }
        selectedService = selected.service;
    } else {
        selectedService = services[0];
    }

    // Create target directory if it doesn't exist
    const targetDir = path.join(workspaceRoot, 'target');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    // Create tryit.http file with service name
    const tryitFileName = `tryit.${selectedService.name}.http`;
    const tryitFilePath = path.join(targetDir, tryitFileName);

    const content = await generateTryItFileContent(workspaceRoot, selectedService);
    if (!content) {
        vscode.window.showErrorMessage('Failed to generate Try It content');
        return;
    }

    // Create tryit.http file
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
    const openapiDefinitions = await langClient.convertToOpenAPI({
        documentFilePath: service.filePath
    });

    const runningServices = await findRunningBallerinaServices(projectDir);
    const serviceInstance = runningServices.find(s => s.serviceName === service.name);
    
    if (!serviceInstance) {
        vscode.window.showWarningMessage(`Service ${service.name} is not running. Some features might not work correctly.`);
        return undefined;
    }

    // @ts-ignore
    const content: Content = openapiDefinitions.content[0] as OpenAPISpec;

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

    // Register helpers if not already registered
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

    // Compile and execute the template with the OpenAPI spec
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({
        ...content.spec,
        port: serviceInstance.port.toString(),
        basePath: service.name,
        serviceName: service.name
    });
}

interface Content {
    file: string;
    serviceName: string;
    spec: OpenAPISpec;
}


interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        description?: string;
        version: string;
        contact?: {
            name?: string;
            url?: string;
            email?: string;
        };
        license?: {
            name: string;
            url?: string;
        };
    };
    servers?: {
        url: string;
        description?: string;
        variables?: {
            [key: string]: {
                default: string;
                description?: string;
                enum?: string[];
            }
        }
    }[];
    paths: {
        [path: string]: {
            [method: string]: {
                summary?: string;
                description?: string;
                parameters?: {
                    name: string;
                    in: string;
                    description?: string;
                    required?: boolean;
                    schema?: {
                        type: string;
                    }
                }[];
                requestBody?: {
                    description?: string;
                    content: {
                        [contentType: string]: {
                            schema: {
                                type: string;
                                properties?: {
                                    [property: string]: {
                                        type: string;
                                        description?: string;
                                    }
                                }
                            }
                        }
                    }
                };
                responses: {
                    [statusCode: string]: {
                        description: string;
                        content?: {
                            [contentType: string]: {
                                schema: {
                                    type: string;
                                    properties?: {
                                        [property: string]: {
                                            type: string;
                                            description?: string;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    components?: {
        schemas?: {
            [key: string]: {
                type: string;
                properties?: {
                    [key: string]: {
                        type: string;
                        description?: string;
                    }
                }
            }
        }
    };
}

