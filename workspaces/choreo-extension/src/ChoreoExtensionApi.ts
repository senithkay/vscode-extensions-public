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
import { Disposable, EventEmitter, workspace, WorkspaceFolder, Uri } from 'vscode';
import { ext } from "./extensionVariables";

import {
    IProjectManager,
    Organization,
    Project,
    ChoreoLoginStatus,
    WorkspaceConfig,
    Component,
    ChoreoComponentType,
    UserInfo,
    ChoreoWorkspaceMetaData,
    EndpointData,
} from "@wso2-enterprise/choreo-core";
import { ComponentModel } from "@wso2-enterprise/ballerina-languageclient";
import { exchangeAuthToken } from "./auth/auth";
import { existsSync, readFileSync } from 'fs';
import { ProjectRegistry } from './registry/project-registry';

import { getLogger } from './logger/logger';

import * as path from "path";
import { enrichDeploymentData, makeURLSafe } from "./utils";
import { AxiosResponse } from 'axios';
import { STATUS_INITIALIZING, STATUS_LOGGED_IN, STATUS_LOGGED_OUT, STATUS_LOGGING_IN, USER_INFO_KEY } from './constants';

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    isChoreoProject(): Promise<boolean>;
    getChoreoProject(): Promise<Project | undefined>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
    deleteComponent(projectId: string, componentPath: string): Promise<void>;
    getConsoleUrl(): Promise<string>;
}

export class ChoreoExtensionApi {
    private _userInfo: UserInfo | undefined;
    private _status: ChoreoLoginStatus;

    private _selectedProjectId: string | undefined;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


    private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

    private _onChoreoProjectChanged = new EventEmitter<string | undefined>();
    public onChoreoProjectChanged = this._onChoreoProjectChanged.event;

    private _onRefreshComponentList = new EventEmitter();
    public onRefreshComponentList = this._onRefreshComponentList.event;

    constructor() {
        this._status = STATUS_INITIALIZING;
    }

    public get userInfo(): UserInfo | undefined {
        // retrieve the user info from the global state
        if (!this._userInfo) {
            const userInfo = ext.context.globalState.get<UserInfo>(USER_INFO_KEY);
            if (userInfo) {
                getLogger().debug("User info retrieved from global state");
                this._userInfo = userInfo;
            } else {
                getLogger().debug("User info not found in global state");
            }   
        }
        return this._userInfo;
    }

    public set userInfo(value: UserInfo | undefined) {
        // update the user info in the global state
        if (value) {
            ext.context.globalState.update(USER_INFO_KEY, value);
        } else {
            ext.context.globalState.update(USER_INFO_KEY, undefined);
        }
        this._userInfo = value;
    }

    public get status(): ChoreoLoginStatus {
        return this._status;
    }

    public set status(value: ChoreoLoginStatus) {
        this._status = value;
        this._onStatusChanged.fire(value);
    }

    public set selectedProjectId(selectedProjectId: string) {
        this._selectedProjectId = selectedProjectId;
        this._onChoreoProjectChanged.fire(selectedProjectId);
    }

    public refreshComponentList() {
        this._onRefreshComponentList.fire(null);
    }

    public projectUpdated() {
        this._onChoreoProjectChanged.fire(this._selectedProjectId);
    }

    public async signInWithAuthCode(authCode: string): Promise<void> {
        getLogger().debug("Signin with auth code triggered from ChoreoExtensionApi");
        return exchangeAuthToken(authCode);
    }

    public getOrgById(orgId: number): Organization | undefined {
        if (this.userInfo) {
            return this.userInfo.organizations.find(org => org.id.toString() === orgId.toString());
        }
        return undefined;
    }

    public getOrgByHandle(orgHandle: string): Organization | undefined {
        if (this.userInfo) {
            return this.userInfo.organizations.find(org => org.handle === orgHandle);
        }
        return undefined;
    }
    
    public async waitForLogin(): Promise<boolean> {
        switch (this._status) {
            case STATUS_LOGGED_IN:
                return true;
            case STATUS_LOGGED_OUT:
                return false;
            case STATUS_INITIALIZING:
            case STATUS_LOGGING_IN:
                return new Promise<boolean>(resolve => {
                    const subscription: Disposable = this.onStatusChanged(() => {
                        subscription.dispose();
                        resolve(this.waitForLogin());
                    });
                    ext.context.subscriptions.push(subscription);
                });
            default:
                const status: never = this._status;
                throw new Error(`Unexpected status '${status}'`);
        }
    }

    public isChoreoProject(): boolean {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && existsSync(workspaceFile.fsPath)) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            return workspaceConfig && workspaceConfig.metadata?.choreo?.projectID !== undefined;
        }
        return false;
    }

    public getChoreoProjectId(): string|undefined {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && this.isChoreoProject()) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID;
            return projectID;
        }
    }

    public getOrgIdOfCurrentProject(): number|undefined {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && this.isChoreoProject()) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const orgId = workspaceConfig.metadata?.choreo?.orgId;
            return orgId;
        }
    }

    public getChoreoWorkspaceMetadata(): ChoreoWorkspaceMetaData {
        return {
            projectID: this.getChoreoProjectId(),
            orgId: this.getOrgIdOfCurrentProject()
        };
    }

    public async getChoreoProject(): Promise<Project | undefined> {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID,
                orgId = workspaceConfig.metadata?.choreo?.orgId;
            if (projectID && orgId) {
                const org = this.getOrgById(orgId);
                if (!org) {
                    throw new Error(`Organization with id ${orgId} not found for current user`);
                }
                return ProjectRegistry.getInstance().getProject(projectID, orgId, org.handle);
            }
        }
    }

    public async getConsoleUrl(): Promise<string> {
        return ProjectRegistry.getInstance().getConsoleUrl();
    }

    public async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        const org = this.getOrgById(orgId);
        if (!org) {
            throw new Error(`Organization with id ${orgId} not found for current user`);
        }
        return ProjectRegistry.getInstance().getProject(projectId, orgId, org.handle);
    }

    public getProjectManager(projectId: string): Promise<IProjectManager | undefined> {
        return Promise.resolve(undefined);
    }

    public async getPerformanceForecastData(orgId: number, orgHandle: string, data: string): Promise<AxiosResponse> {
        return ProjectRegistry.getInstance().getPerformanceForecast(orgId, orgHandle, data);
    }

    public async getSwaggerExamples(orgId: number, orgHandle: string, spec: any): Promise<AxiosResponse> {
        return ProjectRegistry.getInstance().getSwaggerExamples(orgId, orgHandle, spec);
    }

    public async enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined> {
        const choreoProject = await this.getChoreoProject();
        if (choreoProject) {
            const { id: projectID, orgId } = choreoProject;
            const organization = this.getOrgById(parseInt(orgId));
            if (!organization) {
                throw new Error(`Organization with id ${orgId} not found under user ${this.userInfo?.displayName}`);
            }
            const workspaceFileLocation = ProjectRegistry.getInstance().getProjectLocation(projectID);
            if (workspaceFileLocation) {
                const workspaceFileConfig: WorkspaceConfig = JSON.parse(readFileSync(workspaceFileLocation).toString());
                // Remove workspace file from path
                const projectRoot = workspaceFileLocation.slice(0, workspaceFileLocation.lastIndexOf(path.sep));

                if (workspaceFileConfig?.folders && projectRoot) {
                    const choreoComponents = await ProjectRegistry.getInstance().fetchComponentsFromCache(projectID,
                        organization.id,
                        organization.handle, organization.uuid);

                    for (const choreoComponent of choreoComponents || []) {
                        const { name, displayType, id, accessibility, apiVersions, local } = choreoComponent;
                        const wsConfig = workspaceFileConfig.folders.find(component =>
                            component.name === name || makeURLSafe(component.name) === name
                        );
                        if (wsConfig && wsConfig.path) {
                            const componentPath: string = path.join(projectRoot, wsConfig.path);
                            for (const localModel of model.values()) {
                                if (localModel.functionEntryPoint?.elementLocation?.filePath.includes(componentPath) &&
                                    (displayType === ChoreoComponentType.ScheduledTask.toString() || displayType === ChoreoComponentType.ManualTrigger.toString())) {
                                        localModel.functionEntryPoint.type = displayType as any;
                                }
                                const response = await enrichDeploymentData(orgId, id,
                                    new Map(Object.entries(localModel.services)), apiVersions, componentPath
                                );
                                if (response) {
                                    break;
                                }
                            }
                        }
                    };
                }
            }
        }
        return Promise.resolve(model);
    }

    public async deleteComponent(projectId: string, componentPath: string) {
        const choreoProject = await this.getChoreoProject();
        if (choreoProject) {
            const { orgId } = choreoProject;
            const organization = this.getOrgById(parseInt(orgId));
            if (!organization) {
                throw new Error(`Organization with id ${orgId} not found under user ${this.userInfo?.displayName}`);
            }
            const {  handle, id, uuid } = organization;
            const components: Component[] = await ProjectRegistry.getInstance().getComponents(projectId, id, handle, uuid);
            const folder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(componentPath));
            const toDelete = components.find(component =>
                folder?.name && (component.name === folder.name || component.name === makeURLSafe(folder.name))
            );
            if (toDelete) {
                await ProjectRegistry.getInstance().deleteComponent(toDelete, id, handle, projectId);
            }
        }
    }
}
