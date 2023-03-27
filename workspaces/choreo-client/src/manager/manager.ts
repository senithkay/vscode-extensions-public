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

import {
    ChoreoComponentCreationParams, ChoreoServiceComponentType, Component, IProjectManager,
    Project, WorkspaceConfig, WorkspaceComponentMetadata, IsRepoClonedRequestParams, RepoCloneRequestParams
} from "@wso2-enterprise/choreo-core";
import { log } from "console";
import { randomUUID } from "crypto";
import child_process from "child_process";
import { existsSync, readFile, writeFile, unlink, readFileSync, mkdirSync, writeFileSync } from "fs";
import path, { basename, dirname, join } from "path";
import { commands, workspace } from "vscode";

interface CmdResponse {
    error: boolean;
    message: string;
}

export class ChoreoProjectManager implements IProjectManager {

    async createLocalComponent(args: ChoreoComponentCreationParams): Promise<boolean> {
        const { displayType, name, org, repositoryInfo } = args;
        if (workspace.workspaceFile) {
            const workspaceFilePath = workspace.workspaceFile.fsPath;
            const projectRoot = workspaceFilePath.slice(0, workspaceFilePath.lastIndexOf(path.sep));
            const pkgRoot = join(join(join(projectRoot, 'repos'), repositoryInfo.org), repositoryInfo.repo);

            const pkgPath = join(pkgRoot, repositoryInfo.subPath);
            const resp: CmdResponse = await ChoreoProjectManager._createBallerinaPackage(pkgPath, displayType);
            if (!resp.error) {
                ChoreoProjectManager._processTomlFiles(pkgPath, org.name);
                ChoreoProjectManager._addDisplayAnnotation(pkgPath, displayType, name);
                return await ChoreoProjectManager._addToWorkspace(workspaceFilePath, args);
            } else {
                throw new Error(resp.message);
            }
        } else {
            throw new Error("Error: Could not detect a project workspace.");
        }
    }

    getProjectDetails(): Promise<Project> {
        throw new Error("choreo getProjectDetails method not implemented.");
    }

    getProjectRoot(): Promise<string | undefined> {
        throw new Error("choreo getProjectRoot method not implemented.");
    }

    private static _createBallerinaPackage(pkgPath: string, componentType: ChoreoServiceComponentType)
        : Promise<CmdResponse> {
        const pkgRoot = dirname(pkgPath);
        if (!existsSync(pkgRoot)) {
            mkdirSync(pkgRoot, { recursive: true });
        }
        const cmd =
            `bal new "${basename(pkgPath)}" -t architecturecomponents/${ChoreoProjectManager._getTemplateComponent(componentType)}:1.1.0`;
        return new Promise(function (resolve) {
            child_process.exec(`${cmd}`, { cwd: pkgRoot }, async (err, stdout, stderror) => {
                if (err) {
                    log(`error: ${err}`);
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

    private static _getTemplateComponent(componentType: ChoreoServiceComponentType): string {
        switch (componentType) {
            case ChoreoServiceComponentType.GRAPHQL:
                return 'GraphQLComponent';
            case ChoreoServiceComponentType.GRPC_API:
                return 'GRPCComponent';
            case ChoreoServiceComponentType.WEBSOCKET_API:
                return 'WebSocketComponent';
            default:
                return 'HTTPComponent';
        }
    }

    private static _processTomlFiles(pkgPath: string, orgName: string) {
        // Remove Dependencies.toml
        unlink(join(pkgPath, 'Dependencies.toml'), (err) => {
            if (err) {
                log("Error: Could not delete Dependencies.toml.");
            }
        });

        // Update org and version in Ballerina.toml
        const balOrgName = orgName.split(/[^a-zA-Z0-9_]/g).reduce((composedName: string, subname: string) =>
            composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
        const balTomlPath = join(pkgPath, 'Ballerina.toml');
        readFile(balTomlPath, 'utf-8', function (err, contents) {
            if (err) {
                log("Error: Could not read Ballerina.toml.");
                return;
            }
            let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = "${balOrgName}"`);
            replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "1.0.0"`);
            writeFile(balTomlPath, replaced, 'utf-8', (err) => {
                if (err) {
                    log("Error: Could not configure Ballerina.toml.");
                }
            });
        });
    }

    private static _addDisplayAnnotation(pkgPath: string, type: ChoreoServiceComponentType, name: string) {
        const serviceId = `${name}-${randomUUID()}`;
        const serviceFilePath = join(pkgPath, 'service.bal');
        readFile(serviceFilePath, 'utf-8', (err, contents) => {
            if (err) {
                log("Error: Could not read service.bal file.");
                return;
            }
            const replaced = ChoreoProjectManager._getAnnotatedContent(contents, name, serviceId, type);
            writeFile(serviceFilePath, replaced, 'utf-8', function (err) {
                if (err) {
                    log("Error: Could not annotate component.");
                }
            });
        });
    }

    private static _addToWorkspace(workspaceFilePath: string, args: ChoreoComponentCreationParams): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const { org, repositoryInfo, name, displayType, description, projectId, accessibility } = args;

            readFile(workspaceFilePath, 'utf-8', function (err, contents) {
                if (err) {
                    reject(new Error("Error: Could not read workspace file."));
                }
                const content: WorkspaceConfig = JSON.parse(contents);
                content.folders.push({
                    path: join(join(join('repos', repositoryInfo.org), repositoryInfo.repo), repositoryInfo.subPath),
                    name: name,
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

                writeFile(workspaceFilePath, JSON.stringify(content, null, 4), 'utf-8', function (err) {
                    if (err) {
                        reject(new Error("Error: Could not add component to project workspace."));
                    } else {
                        resolve(true);
                    }
                });
            });
        })
    }

    public getComponentMetadata(workspaceFilePath: string): WorkspaceComponentMetadata[] {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceConfig = JSON.parse(contents.toString());
        const componentMetadata: WorkspaceComponentMetadata[] = [];
        content.folders.forEach(folder => {
            if (folder.metadata !== undefined) {
                componentMetadata.push(folder.metadata);
            }
        });
        return componentMetadata;
    }

    public getLocalComponents(workspaceFilePath: string): Component[] {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceConfig = JSON.parse(contents.toString());
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

    public async isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean> {
        const { repository, workspaceFilePath } = params;
        const projectDir = path.dirname(workspaceFilePath);
        return existsSync(join(projectDir, 'repos', repository));
    }

    public async cloneRepo(params: RepoCloneRequestParams): Promise<boolean> {
       return commands.executeCommand('wso2.choreo.project.repo.clone', params);
    }

    private static _getAnnotatedContent(content: string, name: string, serviceId: string, type: ChoreoServiceComponentType)
        : string {
        let preText: string;
        if (type !== ChoreoServiceComponentType.GRPC_API) {
            preText = 'service / on new';
        } else {
            preText = 'service "HelloWorld" on new';
        }

        const processedText = `@display {\n\tlabel: "${name}",\n\tid: "${serviceId}"\n}\n${preText}`;
        return content.replace(preText, processedText);
    }

    removeLocalComponent(workspaceFilePath: string, component: WorkspaceComponentMetadata): void {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceConfig = JSON.parse(contents.toString());
        const index = content.folders.findIndex(folder => folder.metadata?.displayName === component.displayName);
        if (index > -1) {
            content.folders[index].metadata = undefined;
            writeFileSync(workspaceFilePath, JSON.stringify(content, null, 4));
        }
    }
}
