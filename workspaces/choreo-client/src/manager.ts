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

import { ChoreoServiceComponentType, ComponentAccessibility, IProjectManager, Organization, Project, Component } from "@wso2-enterprise/choreo-core";
import { log } from "console";
import { randomUUID } from "crypto";
import child_process from "child_process";
import { readFile, writeFile, unlink, readFileSync } from "fs";
import path, { join } from "path";

export interface ComponentCreationParams {
    org: Organization;
    projectId: string;
    displayType: ChoreoServiceComponentType;
    name: string;
    description: string;
    accessibility: ComponentAccessibility;
    workspaceFilePath: string;
}

interface WorkspaceFileContent {
    folders: Folder[]
}

interface Folder {
    path: string;
    name?: string;
    metadata?: ComponentMetadata;
}

interface ComponentMetadata {
    org: {
        id: number;
        handle: string;
    };
    displayName: string;
    displayType: ChoreoServiceComponentType;
    description: string;
    projectId: string;
    accessibility: ComponentAccessibility;
}

export class ChoreoProjectManager implements IProjectManager {
    createComponent(_addComponentDetails: unknown): Promise<string> {
        return ChoreoProjectManager._createComponent(_addComponentDetails as ComponentCreationParams);
    }
    getProjectDetails(): Promise<Project> {
        throw new Error("choreo getProjectDetails method not implemented.");
    }
    getProjectRoot(): Promise<string | undefined> {
        throw new Error("choreo getProjectRoot method not implemented.");
    }
    private static _createComponent(args: ComponentCreationParams): Promise<string> {
        return new Promise((resolve, reject) => {
            const { displayType, name, org, workspaceFilePath } = args;
            const projectRoot = workspaceFilePath.slice(0, workspaceFilePath.lastIndexOf(path.sep));

            // TODO: Sanitize for URL-safety. Current implementation just checks for Ballerina package name req.
            const pkgName = name.split(/[^a-zA-Z0-9_.]/g).reduce((composedName: string, subname: string) =>
                composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
            const balOrgName = org.name.split(/[^a-zA-Z0-9_]/g).reduce((composedName: string, subname: string) =>
                composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');

            ChoreoProjectManager._runCommand('pwd', projectRoot).then(() => {
                ChoreoProjectManager._runCommand(`bal new ${pkgName} -t architecturecomponents/${ChoreoProjectManager._getTemplateComponent(displayType)}:1.1.0`,
                    projectRoot).then(() => {
                        const pkgRoot = join(projectRoot, pkgName);
                        const serviceId = `${pkgName}-${randomUUID()}`;

                        unlink(join(pkgRoot, 'Dependencies.toml'), (err) => {
                            if (err) {
                                log("Error: Could not delete Dependencies.toml.");
                            }
                        });

                        const balTomlPath = join(pkgRoot, 'Ballerina.toml');
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

                        const serviceFilePath = join(pkgRoot, 'service.bal');
                        readFile(serviceFilePath, 'utf-8', (err, contents) => {
                            if (err) {
                                log("Error: Could not read service.bal file.");
                                return;
                            }
                            const replaced = ChoreoProjectManager._getAnnotatedContent(contents, pkgName, serviceId, displayType);
                            writeFile(serviceFilePath, replaced, 'utf-8', function () {
                                log("Successfully added service annotations.");
                            });
                        });

                        ChoreoProjectManager._addToWorkspace(pkgName, workspaceFilePath, args);
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

    private static _addToWorkspace(packageName: string, workspaceFilePath: string, args: ComponentCreationParams) {
        readFile(workspaceFilePath, 'utf-8', function (err, contents) {
            if (err) {
                log("Error: Could not read workspace file");
                return;
            }
            const content: WorkspaceFileContent = JSON.parse(contents);
            content.folders.push({
                path: packageName,
                metadata: {
                    org: {
                        id: args.org.id,
                        handle: args.org.handle
                    },
                    displayName: args.name,
                    displayType: args.displayType,
                    description: args.description,
                    projectId: args.projectId,
                    accessibility: args.accessibility
                }
            });

            writeFile(workspaceFilePath, JSON.stringify(content, null, 4), 'utf-8', function () {
                log(`Successfully created component ${packageName}.`);
            });
        });
    }

    public static getLocalComponents(workspaceFilePath: string): Component[] {
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
}
