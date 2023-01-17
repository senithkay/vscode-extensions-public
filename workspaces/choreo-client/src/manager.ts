/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { ChoreoServiceComponentType, ComponentAccessibility, IProjectManager, Project, Component, ChoreoComponentCreationParams } from "@wso2-enterprise/choreo-core";
import { log } from "console";
import { randomUUID } from "crypto";
import child_process from "child_process";
import { existsSync, readFile, writeFile, unlink, readFileSync, mkdirSync, writeFileSync } from "fs";
import path, { join } from "path";

interface WorkspaceFileContent {
    folders: Folder[]
}

interface Folder {
    path: string;
    name?: string;
    metadata?: ComponentMetadata;
}

export interface ComponentMetadata {
    org: {
        id: number;
        handle: string;
    };
    displayName: string;
    displayType: ChoreoServiceComponentType;
    description: string;
    projectId: string;
    accessibility: ComponentAccessibility;
    repository: {
        orgApp: string;
        nameApp: string;
        branchApp: string;
        appSubPath: string;
    };
}

export class ChoreoProjectManager implements IProjectManager {
    createComponent(params: ChoreoComponentCreationParams): Promise<string> {
        return ChoreoProjectManager._createComponent(params);
    }
    getProjectDetails(): Promise<Project> {
        throw new Error("choreo getProjectDetails method not implemented.");
    }
    getProjectRoot(): Promise<string | undefined> {
        throw new Error("choreo getProjectRoot method not implemented.");
    }
    private static _createComponent(args: ChoreoComponentCreationParams): Promise<string> {
        return new Promise((resolve, reject) => {
            const { displayType, org, workspaceFilePath, repositoryInfo } = args;
            const projectRoot = workspaceFilePath.slice(0, workspaceFilePath.lastIndexOf(path.sep));

            const balOrgName = org.name.split(/[^a-zA-Z0-9_]/g).reduce((composedName: string, subname: string) =>
                composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
            const pkgRoot = join(join(join(projectRoot, 'repos'), repositoryInfo.org), repositoryInfo.repo);

            if (!existsSync(pkgRoot)) {
                mkdirSync(pkgRoot);
            }

            ChoreoProjectManager._runCommand('pwd', pkgRoot).then(() => {
                ChoreoProjectManager._runCommand(`bal new ${repositoryInfo.subPath} -t architecturecomponents/${ChoreoProjectManager._getTemplateComponent(displayType)}:1.1.0`,
                    pkgRoot).then(() => {
                        const pkgPath = join(pkgRoot, repositoryInfo.subPath);
                        const serviceId = `${repositoryInfo.subPath}-${randomUUID()}`;

                        unlink(join(pkgPath, 'Dependencies.toml'), (err) => {
                            if (err) {
                                log("Error: Could not delete Dependencies.toml.");
                            }
                        });

                        const balTomlPath = join(pkgPath, 'Ballerina.toml');
                        readFile(balTomlPath, 'utf-8', function (err, contents) {
                            if (err) {
                                log("Error: Could not read toml.");
                                return;
                            }
                            let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = "${balOrgName}"`);
                            replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "1.0.0"`);
                            writeFile(balTomlPath, replaced, 'utf-8', () => {
                                log("Successfully configured Ballerina toml.");
                            });
                        });

                        const serviceFilePath = join(pkgPath, 'service.bal');
                        readFile(serviceFilePath, 'utf-8', (err, contents) => {
                            if (err) {
                                log("Error: Could not read service.bal file.");
                                return;
                            }
                            const replaced = ChoreoProjectManager._getAnnotatedContent(contents, repositoryInfo.subPath, serviceId, displayType);
                            writeFile(serviceFilePath, replaced, 'utf-8', function () {
                                log("Successfully added service annotations.");
                            });
                        });

                        ChoreoProjectManager._addToWorkspace(workspaceFilePath, args);
                        return resolve(serviceId);
                    }).catch((error) => {
                        reject(error);
                    });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    private static _getTemplateComponent(componentType: ChoreoServiceComponentType): string {
        switch (componentType) {
            case ChoreoServiceComponentType.GQL_API:
                return 'GraphQLComponent';
            case ChoreoServiceComponentType.GRPC_API:
                return 'GRPCComponent';
            case ChoreoServiceComponentType.WEBSOCKET_API:
                return 'WebSocketComponent';
            default:
                return 'HTTPComponent';
        }
    }

    private static _runCommand(command: string, pathToRun: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            child_process.exec(`${command}`, { cwd: pathToRun }, async (err) => {
                if (err) {
                    log(`error: ${err}`);
                    reject(err);
                } else {
                    resolve("OK");
                }
            });
        });
    }

    private static _addToWorkspace(workspaceFilePath: string, args: ChoreoComponentCreationParams) {
        const { org, repositoryInfo, name, displayType, description, projectId, accessibility } = args;

        readFile(workspaceFilePath, 'utf-8', function (err, contents) {
            if (err) {
                log("Error: Could not read workspace file");
                return;
            }
            const content: WorkspaceFileContent = JSON.parse(contents);
            content.folders.push({
                path: join(join(join('repos', repositoryInfo.org), repositoryInfo.repo), repositoryInfo.subPath),
                metadata: {
                    org: {
                        id: org.id,
                        handle: org.handle
                    },
                    displayName: name,
                    displayType: displayType,
                    description: description,
                    projectId: projectId,
                    accessibility: accessibility,
                    repository: {
                        appSubPath: repositoryInfo.subPath,
                        orgApp: repositoryInfo.org,
                        nameApp: repositoryInfo.repo,
                        branchApp: repositoryInfo.branch
                    }
                }
            });

            writeFile(workspaceFilePath, JSON.stringify(content, null, 4), 'utf-8', function () {
                log(`Successfully created component ${repositoryInfo.subPath}.`);
            });
        });
    }

    public getComponentMetadata(workspaceFilePath: string): ComponentMetadata[] {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceFileContent = JSON.parse(contents.toString());
        const componentMetadata: ComponentMetadata[] = [];
        content.folders.forEach(folder => {
            if (folder.metadata !== undefined) {
                componentMetadata.push(folder.metadata);
            }
        });
        return componentMetadata;
    }

    public getLocalComponents(workspaceFilePath: string): Component[] {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceFileContent = JSON.parse(contents.toString());
        const components: Component[] = [];
        content.folders.forEach((folder) => {
            if (folder.metadata !== undefined) {
                components.push({
                    name: folder.metadata.displayName,
                    description: folder.metadata.description,
                    displayType: folder.metadata.displayType,
                    orgHandler: folder.metadata.org.handle,
                    projectId: folder.metadata.projectId,
                    accessibility: folder.metadata.accessibility,
                    local: true,
                    id: "",
                    handler: folder.metadata.displayName,
                    displayName: folder.metadata.displayName,
                    version: "1.0.0",// TODO: get version from main form
                    createdAt: undefined,
                    repository: undefined,
                    apiVersions: []
                });
            }
        });
        return components;
    }

    private static _getAnnotatedContent(content: string, packageName: string, serviceId: string, type: ChoreoServiceComponentType)
        : string {
        let preText: string;
        if (type !== ChoreoServiceComponentType.GRPC_API) {
            preText = 'service / on new';
        } else {
            preText = 'service "HelloWorld" on new';
        }

        const processedText = `@display {\n\tlabel: "${packageName}",\n\tid: "${serviceId}"\n}\n${preText}`;
        return content.replace(preText, processedText);
    }

    removeLocalComponent(workspaceFilePath: string, component: ComponentMetadata): void {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceFileContent = JSON.parse(contents.toString());
        const index = content.folders.findIndex(folder => folder.metadata?.displayName === component.displayName);
        if (index > -1) {
            content.folders[index].metadata = undefined;
            writeFileSync(workspaceFilePath, JSON.stringify(content, null, 4));
        }
    }
}
