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
import { CreateComponentRequest, DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { StateMachine, history, openView, updateView } from "../stateMachine";

export const README_FILE = "readme.md";

export function openEggplantProject() {
    window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Open Eggplant Project' })
        .then(uri => {
            if (uri && uri[0]) {
                commands.executeCommand('vscode.openFolder', uri[0]);
            }
        });
}

export function createEggplantProject(name: string, isService: boolean) {
    window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Select Project Location' })
        .then(uri => {
            if (uri && uri[0]) {
                const projectLocation = uri[0].fsPath;

                const command = isService ? `bal new -t service ${name}` : `bal new ${name}`;
                const options = { cwd: projectLocation };

                exec(command, options, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error creating Eggplant project: ${error.message}`);
                        return;
                    }

                    console.log(`Eggplant project created successfully at ${projectLocation}`);
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

export function createEggplantProjectPure(name: string, projectPath: string) {
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

eggplant = true  
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

    console.log(`Eggplant project created successfully at ${projectRoot}`);
    commands.executeCommand('vscode.openFolder', Uri.parse(projectRoot));
}


export async function createEggplantService(params: CreateComponentRequest) {
    const serviceFile = await handleServiceCreation(params);
    history.clear();
    openView(EVENT_TYPE.OPEN_VIEW, { documentUri: serviceFile, position: { startLine: 2, startColumn: 0, endLine: 13, endColumn: 1 } });
    commands.executeCommand("Eggplant.project-explorer.refresh");
}

export async function handleServiceCreation(params: CreateComponentRequest) {
    if (!params.path.startsWith('/')) {
        params.path = `/${params.path}`;
    }
    const fooBalContent = `import ballerina/http;

service ${params.path} on new http:Listener(${params.port}) {

    function init() returns error? {}

    resource function get greeting() returns json|http:InternalServerError {
        do {
           
        } on fail error e {
            return http:INTERNAL_SERVER_ERROR;
        }
    }
}
`;
    const servicesDir = path.join(StateMachine.context().projectUri);
    // Create foo.bal file within services directory
    const serviceFile = path.join(servicesDir, `${params.name}.bal`);
    fs.writeFileSync(serviceFile, fooBalContent.trim());
    console.log('Service Created.', `${params.name}.bal`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return serviceFile;
}

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

        // Append "eggplant=true" to the Ballerina.toml content
        const updatedContent = `${data.trim()}\neggplant = true\n`;

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

        // Append "eggplant=true" to the Ballerina.toml content
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

        // Append "eggplant=true" to the Ballerina.toml content
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
