/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { exec } from "child_process";
import { window, commands, workspace, Uri } from "vscode";
import * as fs from 'fs';
import path from "path";
import { CreateComponentRequest, CreateComponentResponse, DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { StateMachine, history, openView, updateView } from "../stateMachine";

export const README_FILE = "readme.md";

export function openBIProject() {
    window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Open BI Project' })
        .then(uri => {
            if (uri && uri[0]) {
                commands.executeCommand('vscode.openFolder', uri[0]);
            }
        });
}

export function createBIProject(name: string, isService: boolean) {
    window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Select Project Location' })
        .then(uri => {
            if (uri && uri[0]) {
                const projectLocation = uri[0].fsPath;

                const command = isService ? `bal new -t service ${name}` : `bal new ${name}`;
                const options = { cwd: projectLocation };

                exec(command, options, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error creating BI project: ${error.message}`);
                        return;
                    }

                    console.log(`BI project created successfully at ${projectLocation}`);
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);

                    // Update Ballerina.toml file in the created project folder
                    const tomlFilePath = `${projectLocation}/${name}/Ballerina.toml`;
                    hackToUpdateBallerinaToml(tomlFilePath);

                    if (isService) {
                        const filePath = `${projectLocation}/${name}/service.bal`;
                        hackToUpdateService(filePath);
                    } else {
                        const filePath = `${projectLocation}/${name}/main.bal`;
                        hackToUpdateMain(filePath);
                    }

                    const newProjectUri = Uri.joinPath(uri[0], name);
                    commands.executeCommand('vscode.openFolder', newProjectUri);

                });
            }
        });
}

export function createBIProjectPure(name: string, projectPath: string) {
    const projectLocation = projectPath;

    const projectRoot = path.join(projectLocation, name);
    // Create project root directory
    if (!fs.existsSync(projectRoot)) {
        fs.mkdirSync(projectRoot);
    }

    const EMPTY = "\n";

    const ballerinaTomlContent = `
[package]
org = "wso2"
name = "${name}"
version = "0.1.0"

bi = true  
`;

    // Create Ballerina.toml file
    const ballerinaTomlPath = path.join(projectRoot, 'Ballerina.toml');
    fs.writeFileSync(ballerinaTomlPath, ballerinaTomlContent.trim());

    // Create connections.bal file
    const connectionsBalPath = path.join(projectRoot, 'connections.bal');
    fs.writeFileSync(connectionsBalPath, EMPTY);

    // Create types.bal file
    const typesBalPath = path.join(projectRoot, 'types.bal');
    fs.writeFileSync(typesBalPath, EMPTY);

    // Create datamappings.bal file
    const datamappingsBalPath = path.join(projectRoot, 'data_mappings.bal');
    fs.writeFileSync(datamappingsBalPath, EMPTY);

    console.log(`BI project created successfully at ${projectRoot}`);
    commands.executeCommand('vscode.openFolder', Uri.parse(projectRoot));
}


export async function createBIService(params: CreateComponentRequest): Promise<CreateComponentResponse> {
    return new Promise(async (resolve) => {
        if (params.serviceType.specPath) {
            // Call LS to create the service and get the serviceFile URI and the position of the serviceDeclaration.
            const projectDir = path.join(StateMachine.context().projectUri);
            try {
                const response = await StateMachine.langClient().generateServiceFromOAS({
                    openApiContractPath: params.serviceType.specPath,
                    projectPath: projectDir,
                    port: Number(params.serviceType.port)
                });
                if (response.service) {
                    const serviceFile = path.join(projectDir, response.service.fileName);
                    openView(EVENT_TYPE.OPEN_VIEW,
                        {
                            documentUri: serviceFile,
                            position: {
                                startLine: response.service.startLine.line,
                                startColumn: response.service.startLine.offset,
                                endLine: response.service.endLine.line,
                                endColumn: response.service.endLine.offset,
                            }
                        });
                }
                if (response.errorMsg) {
                    resolve({ response: false, error: response.errorMsg });
                }
            } catch (error) {
                console.log(error);
                resolve({ response: false, error: error as string });
            }

        } else {
            const serviceFile = await handleServiceCreation(params);
            openView(EVENT_TYPE.OPEN_VIEW, { documentUri: serviceFile, position: { startLine: 2, startColumn: 0, endLine: 13, endColumn: 1 } });
        }
        history.clear();
        commands.executeCommand("BI.project-explorer.refresh");
        resolve({ response: true, error: "" });
    });
}

export async function createBITask(params: CreateComponentRequest): Promise<CreateComponentResponse> {
    return new Promise(async (resolve) => {
        const taskFile = await handleTaskCreation(params);
        openView(EVENT_TYPE.OPEN_VIEW, { documentUri: taskFile, position: { startLine: 5, startColumn: 0, endLine: 11, endColumn: 1 } });
        history.clear();
        commands.executeCommand("BI.project-explorer.refresh");
        resolve({ response: true, error: "" });
    });
}

export async function handleServiceCreation(params: CreateComponentRequest) {
    if (!params.serviceType.path.startsWith('/')) {
        params.serviceType.path = `/${params.serviceType.path}`;
    }
    const balContent = `import ballerina/http;

service ${params.serviceType.path} on new http:Listener(${params.serviceType.port}) {

    function init() returns error? {}

    resource function get greeting() returns json|http:InternalServerError {
        do {
           
        } on fail error e {
            return http:INTERNAL_SERVER_ERROR;
        }
    }
}
`;
    const projectDir = path.join(StateMachine.context().projectUri);
    // Create foo.bal file within services directory
    const serviceFile = path.join(projectDir, `${params.serviceType.name}.bal`);
    fs.writeFileSync(serviceFile, balContent.trim());
    console.log('Service Created.', `${params.serviceType.name}.bal`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return serviceFile;
}

// <---------- Task Source Generation START-------->
export async function handleTaskCreation(params: CreateComponentRequest) {
    const displayAnnotation = `@display {
    label: "${params.taskType.name}",
    triggerType: "${params.taskType.triggerType}",
    cron: "${params.taskType.cron}"
}`;
    let funcSignature = "public function main() returns error? {";
    if (params.taskType.argName) {
        funcSignature = `public function main(${params.taskType.argType} ${params.taskType.argName}) returns error? {`;
    }
    const balContent = `${displayAnnotation}
${funcSignature}
    do {

    } on fail error e {
        return e;
    }
}
`;
    const projectDir = path.join(StateMachine.context().projectUri);
    // Create foo.bal file within services directory
    const taskFile = path.join(projectDir, `main.bal`);
    fs.writeFileSync(taskFile, balContent.trim());
    console.log('Task Created.', `main.bal`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return taskFile;
}
// <---------- Task Source Generation END-------->

export function sanitizeName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Replace invalid characters with underscores
}

// ------------------- HACKS TO MANIPULATE PROJECT FILES ---------------->
function hackToUpdateBallerinaToml(filePath: string) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading Ballerina.toml file: ${err.message}`);
            return;
        }

        // Append "bi=true" to the Ballerina.toml content
        const updatedContent = `${data.trim()}\nbi = true\n`;

        // Write the updated content back to the Ballerina.toml file
        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
            if (err) {
                console.error(`Error updating Ballerina.toml file: ${err.message}`);
            } else {
                console.log('Ballerina.toml file updated successfully');
            }
        });
    });
}

function hackToUpdateService(filePath: string) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading Ballerina.toml file: ${err.message}`);
            return;
        }

        // Append "bi=true" to the Ballerina.toml content
        const newContent = `import ballerina/http;

        service /hello on new http:Listener(9090) {
            resource function get greeting(string name) returns string|error {
                
            }
        }
        `;

        // Write the updated content back to the Ballerina.toml file
        fs.writeFile(filePath, newContent, 'utf8', (err) => {
            if (err) {
                console.error(`Error updating Ballerina.toml file: ${err.message}`);
            } else {
                console.log('Ballerina.toml file updated successfully');
            }
        });
    });
}

function hackToUpdateMain(filePath: string) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading Ballerina.toml file: ${err.message}`);
            return;
        }

        // Append "bi=true" to the Ballerina.toml content
        const newContent = `public function main() {

        }
        `;

        // Write the updated content back to the Ballerina.toml file
        fs.writeFile(filePath, newContent, 'utf8', (err) => {
            if (err) {
                console.error(`Error updating Ballerina.toml file: ${err.message}`);
            } else {
                console.log('Ballerina.toml file updated successfully');
            }
        });
    });
}
