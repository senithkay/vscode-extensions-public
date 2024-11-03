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
import { ComponentRequest, CreateComponentResponse, createFunctionSignature, DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, NodePosition, STModification, SyntaxTreeResponse } from "@wso2-enterprise/ballerina-core";
import { StateMachine, history, openView, updateView } from "../stateMachine";
import { applyModifications, modifyFileContent } from "./modification";
import { ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";

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

    name = sanitizeName(name);
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

    const launchJsonContent = `
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Ballerina Run/Debug",
            "type": "ballerina",
            "request": "launch",
            "programArgs": [],
            "commandOptions": [],
            "env": {}
        },
        {
            "name": "Ballerina Test",
            "type": "ballerina",
            "request": "launch",
            "debugTests": true,
            "programArgs": [],
            "commandOptions": [],
            "env": {}
        },
        {
            "name": "Ballerina Remote",
            "type": "ballerina",
            "request": "attach",
            "debuggeeHost": "127.0.0.1",
            "debuggeePort": "5005"
        }
    ]
}
`;

    // Create Ballerina.toml file
    const ballerinaTomlPath = path.join(projectRoot, 'Ballerina.toml');
    fs.writeFileSync(ballerinaTomlPath, ballerinaTomlContent.trim());

    // Create connections.bal file
    const connectionsBalPath = path.join(projectRoot, 'connections.bal');
    fs.writeFileSync(connectionsBalPath, EMPTY);

    // Create config.bal file
    const configurationsBalPath = path.join(projectRoot, 'config.bal');
    fs.writeFileSync(configurationsBalPath, EMPTY);

    // Create types.bal file
    const typesBalPath = path.join(projectRoot, 'types.bal');
    fs.writeFileSync(typesBalPath, EMPTY);

    // Create datamappings.bal file
    const datamappingsBalPath = path.join(projectRoot, 'data_mappings.bal');
    fs.writeFileSync(datamappingsBalPath, EMPTY);

    // Create a .vscode folder
    const vscodeDir = path.join(projectRoot, '.vscode');
    if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir);
    }

    // Create launch.json file
    const launchPath = path.join(vscodeDir, 'launch.json');
    fs.writeFileSync(launchPath, launchJsonContent.trim());

    // Create settings.json file
    const settingsPath = path.join(vscodeDir, 'settings.json');

    console.log(`BI project created successfully at ${projectRoot}`);
    commands.executeCommand('vscode.openFolder', Uri.parse(projectRoot));
}


export async function createBIService(params: ComponentRequest): Promise<CreateComponentResponse> {
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
            openView(EVENT_TYPE.OPEN_VIEW, { documentUri: serviceFile, position: { startLine: 3, startColumn: 0, endLine: 15, endColumn: 1 } });
        }
        history.clear();
        commands.executeCommand("BI.project-explorer.refresh");
        resolve({ response: true, error: "" });
    });
}

export async function createBIAutomation(params: ComponentRequest): Promise<CreateComponentResponse> {
    return new Promise(async (resolve) => {
        const functionFile = await handleAutomationCreation(params);
        openView(EVENT_TYPE.OPEN_VIEW, { documentUri: functionFile, position: { startLine: 4, startColumn: 0, endLine: 10, endColumn: 1 } });
        history.clear();
        commands.executeCommand("BI.project-explorer.refresh");
        resolve({ response: true, error: "" });
    });
}

export async function createBIFunction(params: ComponentRequest): Promise<CreateComponentResponse> {
    return new Promise(async (resolve) => {
        const projectDir = path.join(StateMachine.context().projectUri);
        const targetFile = path.join(projectDir, `functions.bal`);
        if (!fs.existsSync(targetFile)) {
            fs.writeFileSync(targetFile, '');
        }
        const response = await handleFunctionCreation(targetFile, params);
        await modifyFileContent({ filePath: targetFile, content: response.source });
        const modulePart: ModulePart = response.syntaxTree as ModulePart;
        let targetPosition: NodePosition = response.syntaxTree?.position;
        modulePart.members.forEach(member => {
            if (STKindChecker.isFunctionDefinition(member) && member.functionName.value === params.functionType.name.trim()) {
                targetPosition = member.position;
            }
        });
        openView(EVENT_TYPE.OPEN_VIEW, { documentUri: targetFile, position: targetPosition });
        history.clear();
        commands.executeCommand("BI.project-explorer.refresh");
        resolve({ response: true, error: "" });
    });
}

export async function handleServiceCreation(params: ComponentRequest) {
    if (!params.serviceType.path.startsWith('/')) {
        params.serviceType.path = `/${params.serviceType.path}`;
    }
    const balContent = `import ballerina/http;
import ballerina/log;

service ${params.serviceType.path} on new http:Listener(${params.serviceType.port}) {

    function init() returns error? {}

    resource function get greeting() returns json|http:InternalServerError {
        do {
           
        } on fail error e {
            log:printError("Error: ", 'error = e);
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
export async function handleAutomationCreation(params: ComponentRequest) {
    const displayAnnotation = `@display {
    label: "${params.functionType.name}",
    cron: "${params.functionType.cron}"
}`;
    let paramList = '';
    const paramLength = params.functionType.parameters.length;
    if (paramLength > 0) {
        params.functionType.parameters.forEach((param, index) => {
            let paramValue = param.defaultValue ? `${param.type} ${param.name} = ${param.defaultValue}, ` : `${param.type} ${param.name}, `;
            if (paramLength === index + 1) {
                paramValue = param.defaultValue ? `${param.type} ${param.name} = ${param.defaultValue}` : `${param.type} ${param.name}`;
            }
            paramList += paramValue;
        });
    }
    let funcSignature = `public function main(${paramList}) returns error? {`;
    const balContent = `import ballerina/log;

${displayAnnotation}
${funcSignature}
    do {

    } on fail error e {
        log:printError("Error: ", 'error = e);
        return e;
    }
}
`;
    const projectDir = path.join(StateMachine.context().projectUri);
    // Create foo.bal file within services directory
    const taskFile = path.join(projectDir, `automation.bal`);
    fs.writeFileSync(taskFile, balContent.trim());
    console.log('Task Created.', `automation.bal`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return taskFile;
}
// <---------- Task Source Generation END-------->

// <---------- Function Source Generation START-------->
export async function handleFunctionCreation(targetFile: string, params: ComponentRequest): Promise<SyntaxTreeResponse> {
    const modifications: STModification[] = [];
    const parametersStr = params.functionType.parameters
        .map((item) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ''}`)
        .join(",");

    const returnTypeStr = `returns ${!params.functionType.returnType ? 'error?' : `${params.functionType.returnType}|error?`}`;

    const expBody = `{
    do {

    } on fail error e {
        return e;
    }
}`;

    const document = await workspace.openTextDocument(Uri.file(targetFile));
    const lastPosition = document.lineAt(document.lineCount - 1).range.end;

    const targetPosition: NodePosition = {
        startLine: lastPosition.line,
        startColumn: 0,
        endLine: lastPosition.line,
        endColumn: 0
    };
    modifications.push(
        createFunctionSignature(
            "",
            params.functionType.name,
            parametersStr,
            returnTypeStr,
            targetPosition,
            false,
            false,
            expBody
        )
    );

    const res = await applyModifications(targetFile, modifications) as SyntaxTreeResponse;
    return res;
}
// <---------- Function Source Generation END-------->

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
