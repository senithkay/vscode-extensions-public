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
        openTryItView(withNotice, ballerinaExtInstance);
    });
}

async function openTryItView(withNotice: boolean = false, ballerinaExtInstance: BallerinaExtension) {
    if (!langClient) {
        vscode.window.showErrorMessage('Ballerina Language Server is not connected');
        return;
    }

    if (withNotice) {
        const selection = await vscode.window.showInformationMessage(
            "The integration has services. Do you want to open the Try It ?",
            "Yes",
            "No"
        );

        if (selection !== "Yes") {
            return;
        }
    }

    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Please open a workspace first');
        return;
    }

    // Create target directory if it doesn't exist
    const targetDir = path.join(workspaceRoot, 'target');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    // Create tryit.http file path
    const tryitFilePath = path.join(targetDir, 'tryit.http');


    const content: string = await generateTryItFileContent(workspaceRoot);
    // Create empty tryit.http file
    fs.writeFileSync(tryitFilePath, content);

    // Open the file in VS Code editor
    // Open the file as a notebook document
    const tryitFileUri = vscode.Uri.file(tryitFilePath);
    await vscode.commands.executeCommand('vscode.openWith', tryitFileUri, 'http');
}

async function generateTryItFileContent(projectDir: string): Promise<string | undefined> {
    // Get access to language server
    if (!langClient) {
        return undefined;
    }
    // Get the component list
    const components: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
        documentIdentifiers: [{ uri: URI.file(projectDir).toString() }]
    });

    // Iterate and extract the services 
    const services = components.packages
        ?.flatMap(pkg => pkg.modules)
        .flatMap(module => module.services);

    if (!services || services.length === 0) {
        return undefined;
    }

    const service = services[0];
    // Get the openapi definitions from LS
    const openapiDefinitions = await langClient.convertToOpenAPI({
        documentFilePath: services[0].filePath
    });

    const runningServices = await findRunningBallerinaServices(projectDir);
    const port = runningServices[0].port;

    // @ts-ignore
    const content: Content = openapiDefinitions.content[0] as OpenAPISpec;

    const template = `/*
### Try Service : "{{info.title}}"  
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

    // Register a helper to convert text to uppercase
    Handlebars.registerHelper('uppercase', function (str) {
        return str.toUpperCase();
    });
    // Register a helper to trim whitespace
    Handlebars.registerHelper('trim', function (str) {
        return str.trim();
    });
    // Compile and execute the template with the OpenAPI spec
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({ ...content.spec, port: port.toString(), basePath: service.name });
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

