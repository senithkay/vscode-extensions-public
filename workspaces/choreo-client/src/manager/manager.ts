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
    ChoreoComponentCreationParams, ChoreoComponentType, Component, IProjectManager,
    Project, WorkspaceConfig, WorkspaceComponentMetadata, IsRepoClonedRequestParams, RepoCloneRequestParams
} from "@wso2-enterprise/choreo-core";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { basename, dirname, join } from "path";
import { commands, workspace } from "vscode";
import { BallerinaTriggerResponse, BallerinaTriggersResponse } from "@wso2-enterprise/ballerina-languageclient";
import { BAL_FORMAT_SERVICE_CMD, buildWebhookTemplate, getBallerinaExtensionInstance, writeWebhookTemplate } from "./utils/webhook-utils";
import { addDisplayAnnotation, addToWorkspace, createBallerinaPackage, processTomlFiles, runCommand } from "./utils/component-creation-utils";

interface CmdResponse {
    error: boolean;
    message: string;
}

export class ChoreoProjectManager implements IProjectManager {

    async createLocalComponentFromExistingSource(componentDetails: ChoreoComponentCreationParams): Promise<string | boolean> {
        if (workspace.workspaceFile) {
            return await addToWorkspace(workspace.workspaceFile.fsPath, componentDetails);
        } else {
            throw new Error("Error: Could not detect a project workspace.");
        }
    }

    private balVersion: string | undefined;

    async createLocalComponent(args: ChoreoComponentCreationParams): Promise<boolean> {
        const { displayType, org, repositoryInfo, trigger } = args;
        if (workspace.workspaceFile) {
            const workspaceFilePath = workspace.workspaceFile.fsPath;
            const projectRoot = workspaceFilePath.slice(0, workspaceFilePath.lastIndexOf(path.sep));
            const repoRoot = join(join(join(projectRoot, 'repos'), repositoryInfo.org), repositoryInfo.repo);

            const pkgPath = join(repoRoot, repositoryInfo.subPath);
            const resp: CmdResponse = await createBallerinaPackage(basename(pkgPath), dirname(pkgPath), displayType);
            if (!resp.error) {
                processTomlFiles(pkgPath, org.name);
                if (displayType === ChoreoComponentType.Webhook && trigger && trigger.id) {
                    const webhookTemplate: string = await buildWebhookTemplate(pkgPath, trigger, await this.getBalVersion());
                    if (webhookTemplate) {
                        writeWebhookTemplate(pkgPath, webhookTemplate);
                        await runCommand(BAL_FORMAT_SERVICE_CMD, pkgPath);
                    } else {
                        throw new Error("Error: Could not create Webhook template.");
                    }
                }
                if (displayType === ChoreoComponentType.GraphQL
                    || displayType === ChoreoComponentType.Service
                    || displayType === ChoreoComponentType.Proxy) {
                    addDisplayAnnotation(pkgPath, displayType);
                }
                return await addToWorkspace(workspaceFilePath, args);
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
                    repository: {
                        branch: folder.metadata.repository.branchApp,
                        branchApp: folder.metadata.repository.branchApp,
                        isUserManage: true,
                        nameApp: folder.metadata.repository.nameApp,
                        nameConfig: "",
                        organizationApp: folder.metadata.repository.orgApp,
                        organizationConfig:"",
                        appSubPath: folder.metadata.repository.appSubPath
                    },
                    apiVersions: []
                });
            }
        });
        return components;
    }

    public async isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean> {
        const { repository, workspaceFilePath } = params;
        const projectDir = path.dirname(workspaceFilePath);
        // TODO: check if the repo is cloned in the correct branch using params.branch
        // We need to handle the case where the repo is cloned in a different branch
        return existsSync(join(projectDir, 'repos', repository));
    }

    public async getRepoPath(repository: string): Promise<string> {
        if (workspace.workspaceFile) {
            const projectDir = path.dirname(workspace.workspaceFile.fsPath);
            return join(projectDir, 'repos', repository);
        }
        return "";
    }

    public async cloneRepo(params: RepoCloneRequestParams): Promise<boolean> {
       return commands.executeCommand('wso2.choreo.project.repo.clone', params);
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

    async fetchTriggers(): Promise<BallerinaTriggersResponse | undefined> {
        const ballerinaExtInstance = await getBallerinaExtensionInstance();
        if (ballerinaExtInstance && ballerinaExtInstance.langClient) {
            return ballerinaExtInstance.langClient.getTriggers({ query: "" });
        }
        return undefined;
    }

    async fetchTrigger(triggerId: string): Promise<BallerinaTriggerResponse | undefined> {
        const ballerinaExtInstance = await getBallerinaExtensionInstance();
        if (ballerinaExtInstance && ballerinaExtInstance.langClient) {
            return ballerinaExtInstance.langClient.getTrigger({ id: triggerId });
        }
        return undefined;
    }

    async getBalVersion(): Promise<string> {
        if (!this.balVersion) {
            const cmdResponse = await runCommand("bal -v");
            if (cmdResponse.error) {
                this.balVersion = "2201.3.2";
            } else {
                this.balVersion = cmdResponse.message.split(" ")[1];
            }
        }
        return this.balVersion;
    }
}
