/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { commands, window, workspace } from "vscode";
import { existsSync, readFile, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import _ from "lodash";
import child_process from "child_process";
import { compile } from "handlebars";
import { ChoreoServiceComponentType, Project } from "@wso2-enterprise/choreo-core";
import { ExtendedLangClient } from "../../core";
import { getLangClient, terminateActivation } from "../activator";
import { CommandResponse, ComponentModel, DEFAULT_SERVICE_TEMPLATE_SUFFIX, DIAGNOSTICS_WARNING, ERROR_MESSAGE, GRAPHQL_SERVICE_TEMPLATE_SUFFIX, triggerSource } from "../resources";
import { getChoreoExtAPI } from "../../choreo-features/activate";
import { BallerinaTriggerResponse } from "@wso2-enterprise/ballerina-languageclient";

export function getComponentModel(langClient: ExtendedLangClient): Promise<Map<string, ComponentModel>> {
    return new Promise((resolve, reject) => {
        let ballerinaFiles: string[] = [];
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders !== undefined) {
            workspaceFolders.forEach(folder => {
                const isBalProject = existsSync(join(folder.uri.fsPath, "Ballerina.toml"));
                if (isBalProject) {
                    ballerinaFiles.push(join(folder.uri.fsPath, "Ballerina.toml"));
                }
            });
        } else {
            workspace.textDocuments.forEach(file => {
                ballerinaFiles.push(file.uri.fsPath);
            });
        }

        langClient.getPackageComponentModels({
            documentUris: ballerinaFiles
        }).then(async (response) => {
            let packageModels: Map<string, ComponentModel> = new Map(Object.entries(response.componentModels));
            for (let [_key, packageModel] of packageModels) {
                if (packageModel.hasCompilationErrors) {
                    window.showInformationMessage(DIAGNOSTICS_WARNING);
                    break;
                }
            }

            const choreoExt = await getChoreoExtAPI();
            if (choreoExt) {
                packageModels = await choreoExt.enrichChoreoMetadata(packageModels);
            }
            resolve(response.componentModels);
        }).catch((error) => {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        });
    });
}

export async function checkIsChoreoProject(): Promise<boolean> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.isChoreoProject();
    }
    return false;
}

export async function getActiveChoreoProject(): Promise<Project> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.getChoreoProject();
    }
    return undefined;
}

export async function showChoreoProjectOverview(project: Project | undefined): Promise<void> {
    if (project && await getChoreoExtAPI()) {
        return commands.executeCommand('wso2.choreo.project.overview', project);
    }
    window.showErrorMessage('Error while loading Choreo project overview.');
}

export function processTomlFiles(pkgRoot: string, orgName: string, version: string): boolean {
    let didFail: boolean;

    // Remove Dependencies.toml
    const dependenciesTomlPath = join(pkgRoot, 'Dependencies.toml');
    if (existsSync(dependenciesTomlPath)) {
        unlinkSync(dependenciesTomlPath);
    }

    // Update org and version in Ballerina.toml   
    const balToml: string = join(pkgRoot, 'Ballerina.toml');
    readFile(balToml, 'utf-8', function (err, contents) {
        if (err) {
            didFail = true;
            return;
        }
        let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = \"${orgName}\"`);
        replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "${version}"`);
        writeFileSync(balToml, replaced);
    });
    return didFail;
}

export function getAnnotatedContent(content: string, label: string, serviceId: string): string {
    const preText = 'service / on new';
    const processedText = `@display {\n\tlabel: "${label}",\n\tid: "${serviceId}"\n}\n${preText}`;
    return content.replace(preText, processedText);
}

export function addDisplayAnnotation(pkgPath: string, label: string, id: string, type: ChoreoServiceComponentType): boolean {
    let didFail: boolean;
    const serviceFileName = type === ChoreoServiceComponentType.GRAPHQL ? 'sample.bal' : 'service.bal';
    const serviceFilePath = join(pkgPath, serviceFileName);
    readFile(serviceFilePath, 'utf-8', (err, contents) => {
        if (err) {
            didFail = true;
            return;
        }
        const replaced = getAnnotatedContent(contents, label, id);
        writeFileSync(serviceFilePath, replaced);
    });
    return didFail;
}

export function createBallerinaPackage(name: string, pkgRoot: string, type: ChoreoServiceComponentType): Promise<CommandResponse> {
    const cmd = `bal new "${name}" ${getBalCommandSuffix(type)}`;
    return runCommand(cmd, pkgRoot);
}

export function getBalCommandSuffix(componentType: ChoreoServiceComponentType): string {
    switch (componentType) {
        case ChoreoServiceComponentType.GRAPHQL:
            return GRAPHQL_SERVICE_TEMPLATE_SUFFIX;
        case ChoreoServiceComponentType.REST_API:
        case ChoreoServiceComponentType.PROXY:
        case ChoreoServiceComponentType.WEBHOOK:
            return DEFAULT_SERVICE_TEMPLATE_SUFFIX;
        default:
            return '';
    }
}

export async function runCommand(cmd: string, cwd?: string): Promise<CommandResponse> {
    return new Promise(function (resolve) {
        child_process.exec(`${cmd}`, { cwd: cwd }, async (err, stdout, stderror) => {
            if (err) {
                resolve({
                    error: true,
                    message: stderror
                });
            } else {
                resolve({
                    error: false,
                    message: stdout
                });
            }
        });
    });
}

export async function buildWebhookTemplate(pkgPath: string, triggerId: string): Promise<string> {
    const langClient: ExtendedLangClient = getLangClient();
    const template = compile(triggerSource);
    const triggerData: BallerinaTriggerResponse | {} = await langClient.getTrigger({ id: triggerId });
    if ('serviceTypes' in triggerData && triggerData.serviceTypes.length) {
        const moduleName = triggerData.moduleName;
        const cmdResponse: CommandResponse = await runCommand(`bal pull ballerinax/${moduleName}`, pkgPath);
        if (!cmdResponse.error || cmdResponse.message.includes('package already exists')) {
            return template({
                ...triggerData,
                triggerType: moduleName.slice(moduleName.lastIndexOf('.') + 1)
            });
        }
    }
    return "";
}

export function writeWebhookTemplate(pkgPath: string, template: string): boolean {
    let didFail: boolean;
    const serviceFilePath = join(pkgPath, "service.bal");
    readFile(serviceFilePath, 'utf-8', (err) => {
        if (err) {
            didFail = true;
            return;
        }
        writeFileSync(serviceFilePath, template);
    });
    return didFail;
}
