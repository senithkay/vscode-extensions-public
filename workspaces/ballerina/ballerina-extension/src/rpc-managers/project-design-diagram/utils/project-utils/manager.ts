/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaTriggerResponse, BallerinaTriggersResponse } from "@wso2-enterprise/ballerina-languageclient";
import { ProgressLocation, window, workspace } from "vscode";
import { randomUUID } from "crypto";
import path, { join } from "path";
import { addToWorkspace } from "../../../../utils/project-utils";
import {
    addDisplayAnnotation, buildWebhookTemplate, createBallerinaPackage, processTomlFiles, runCommand, writeWebhookTemplate
} from "../component-utils";

export interface Project {
    createdData: string;
    handler: string;
    id: string;
    name: string;
    orgId: string;
    region: string;
    version: string;
    description: string;
    repository?: string;
    credentialId?: string;
    branch?: string;
    gitOrganization?: string;
    gitProvider?: string;
}

interface IProjectManager {
    createLocalComponent(componentDetails: any | BallerinaComponentCreationParams): Promise<string|boolean>;
    createLocalBalComponentFromExistingSource(componentDetails: any): Promise<string|boolean>;
    getProjectDetails(): Promise<Project>;
    getProjectRoot(): Promise<string | undefined>;
    getLocalComponents(workspaceFilePath: string): any[];
    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean>;
    getRepoPath(repository: string): Promise<string>;
    isComponentNameAvailable(componentName: string): Promise<boolean>;
    cloneRepo(params: RepoCloneRequestParams): Promise<boolean>;
    getBalVersion(): Promise<string>;
}

interface IsRepoClonedRequestParams {
    repository: string;
    branch: string;
    workspaceFilePath: string;
    gitProvider?: string;
}

export type RepoCloneRequestParams = IsRepoClonedRequestParams;


export interface BallerinaComponentCreationParams {
    name: string;
    version: string;
    org: string;
    package: string;
    directory: string;
    type: BallerinaComponentTypes;
    trigger?: TriggerDetails;
}

export enum BallerinaComponentTypes {
    REST_API = 'restAPI',
    GRAPHQL = 'graphql',
    MAIN = 'main',
    WEBHOOK = 'webhook',
    GRPC_API = 'grpcAPI',
    WEBSOCKET_API = 'websocketAPI'
}

export interface TriggerDetails {
    id: string;
    services?: string[];
}

export class BallerinaProjectManager implements IProjectManager {
    isComponentNameAvailable(componentName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    createLocalBalComponentFromExistingSource(componentDetails: any): Promise<string | boolean> {
        throw new Error("Method not implemented.");
    }
    getRepoPath(repository: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    fetchTriggers(): Promise<BallerinaTriggersResponse> {
        throw new Error("Method not implemented.");
    }
    fetchTrigger(param: string): Promise<BallerinaTriggerResponse> {
        throw new Error("Method not implemented.");
    }
    getBalVersion(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async createLocalComponent(params: BallerinaComponentCreationParams): Promise<string> {
        return new Promise((resolve) => {
            const { directory: parentDirPath, package: packageName, name, version, org: orgName, type, trigger } = params;
            let serviceId: string = "";

            window.withProgress({
                location: ProgressLocation.Window,
                title: "Creating component...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: `Starting to create the component...` });

                const createPkgResponse = await createBallerinaPackage(packageName, parentDirPath, type);
                if (!createPkgResponse.error) {
                    progress.report({ increment: 40, message: `Created the package ${packageName} in the workspace folder` });
                    const pkgPath: string = join(parentDirPath, packageName);

                    // Update TOML files
                    const didProcessFail = processTomlFiles(pkgPath, orgName, version);
                    if (didProcessFail === true) {
                        progress.report({ increment: 50, message: `An error occurred while configuring TOML files` });
                    } else {
                        progress.report({ increment: 50, message: `Configured TOML files successfully` });
                        progress.report({ increment: 60, message: `Configured version ${version} in package ${packageName}` });
                    }

                    if (type === BallerinaComponentTypes.WEBHOOK && trigger) {
                        const webhookTemplate: string = await buildWebhookTemplate(pkgPath, trigger);
                        if (webhookTemplate) {
                            writeWebhookTemplate(pkgPath, webhookTemplate);
                            await runCommand(`bal format`, pkgPath);
                        } else {
                            throw new Error("Error: Could not create Webhook template.");
                        }
                    } else if (type === BallerinaComponentTypes.GRAPHQL || type === BallerinaComponentTypes.REST_API) {
                        // Add Display annotation
                        serviceId = `${name}-${randomUUID()}`;
                        const didAnnotationFail = addDisplayAnnotation(pkgPath, name, serviceId, type);
                        if (didAnnotationFail === true) {
                            progress.report({ increment: 70, message: `An error occurred while annotating the service` });
                        } else {
                            progress.report({ increment: 80, message: `Added service annotation successfully` });
                        }
                    }

                    addToWorkspace(pkgPath);
                    progress.report({ increment: 100, message: `Added the service to the current workspace` });
                } else {
                    window.showErrorMessage(`Error while creating package: ${createPkgResponse.message}`);
                }
                return resolve(serviceId);
            });
        });
    }

    getProjectDetails(): Promise<Project> {
        throw new Error("ballerina getProjectDetails not implemented.");
    }

    async getProjectRoot(): Promise<string | undefined> {
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders?.length > 0) {
            let parentCandidate = path.parse(workspaceFolders[0].uri.fsPath).dir;
            workspaceFolders.forEach((workspaceFolder) => {
                const relative = path.relative(parentCandidate, workspaceFolder.uri.fsPath);
                const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
                if (!isSubdir) {
                    const parsedPath = path.parse(workspaceFolder.uri.fsPath);
                    if (parsedPath.dir !== parentCandidate) {
                        parentCandidate = path.parse(parentCandidate).dir;
                    }
                }
            });
            return parentCandidate;
        }
        return undefined;
    }

    getLocalComponents(workspaceFilePath: string): any[] {
        return [];
    }

    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    cloneRepo(params: IsRepoClonedRequestParams): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
