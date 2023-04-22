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
import { Disposable, EventEmitter, workspace } from 'vscode';
import { ext } from "./extensionVariables";

import {
    IProjectManager,
    Organization,
    Project,
    ChoreoLoginStatus,
    WorkspaceConfig,
    ComponentModel,
    Component,
    ChoreoComponentType
} from "@wso2-enterprise/choreo-core";
import { exchangeAuthToken } from "./auth/auth";
import { readFileSync } from 'fs';
import { ProjectRegistry } from './registry/project-registry';

import { getLogger } from './logger/logger';

import * as path from "path";
import { enrichDeploymentData } from "./utils";
import { AxiosResponse } from 'axios';
import { SELECTED_ORG_ID_KEY, STATUS_INITIALIZING, STATUS_LOGGED_IN, STATUS_LOGGED_OUT, STATUS_LOGGING_IN } from './constants';

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    isChoreoProject(): Promise<boolean>;
    getChoreoProject(): Promise<Project | undefined>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
    deleteComponent(projectId: string, componentPath: string): Promise<void>;
}

export class ChoreoExtensionApi {
    // TODO move this to ext namespace
    public userName: string | undefined;

    private _status: ChoreoLoginStatus;
    private _selectedOrg: Organization | undefined;
    private _selectedProjectId: string | undefined;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


    private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

    private _onChoreoProjectChanged = new EventEmitter<string | undefined>();
    public onChoreoProjectChanged = this._onChoreoProjectChanged.event;

    constructor() {
        this._status = STATUS_INITIALIZING;
    }

    public get status(): ChoreoLoginStatus {
        return this._status;
    }
    public set status(value: ChoreoLoginStatus) {
        this._status = value;
        this._onStatusChanged.fire(value);
    }

    public get selectedOrg(): Organization | undefined {
        return this._selectedOrg;
    }

    public set selectedOrg(selectedOrg: Organization | undefined) {
        this._selectedOrg = selectedOrg;
        // In case this is a signout, where the selected org is undefined, we don't want to update the global state
        // If user logs in again, we can use the last selected org from the global state
        if (selectedOrg) {
            ext.context.globalState.update(SELECTED_ORG_ID_KEY, selectedOrg?.id);
        }
        this._onOrganizationChanged.fire(selectedOrg);
    }

    public set selectedProjectId(selectedProjectId: string) {
        this._selectedProjectId = selectedProjectId;
        this._onChoreoProjectChanged.fire(selectedProjectId);
    }

    public projectUpdated() {
        this._onChoreoProjectChanged.fire(this._selectedProjectId);
    }

    public async signIn(authCode: string): Promise<void> {
        getLogger().debug("Signin triggered from ChoreoExtensionApi");
        return exchangeAuthToken(authCode);
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

    public async isChoreoProject(): Promise<boolean> {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            return workspaceConfig && workspaceConfig.metadata?.choreo?.projectID !== undefined;
        }
        return false;
    }

    public async getChoreoProject(): Promise<Project | undefined> {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID,
                orgId = workspaceConfig.metadata?.choreo?.orgId;
            const selectedOrg = ext.api.selectedOrg?.id;
            if (projectID && orgId && orgId === selectedOrg) {
                return ProjectRegistry.getInstance().getProject(projectID, orgId);
            }
        }
    }

    public async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        return ProjectRegistry.getInstance().getProject(projectId, orgId);
    }

    public getProjectManager(projectId: string): Promise<IProjectManager | undefined> {
        return Promise.resolve(undefined);
    }

    public async getPerformanceForecastData(data: string): Promise<AxiosResponse> {
        return ProjectRegistry.getInstance().getPerformanceForecast(data);
    }

    public async getSwaggerExamples(spec: any): Promise<AxiosResponse> {
        return ProjectRegistry.getInstance().getSwaggerExamples(spec);
    }

    public async enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined> {
        if (this._selectedProjectId && this._selectedOrg?.id) {
            const workspaceFileLocation = ProjectRegistry.getInstance().getProjectLocation(this._selectedProjectId);
            if (workspaceFileLocation) {
                const workspaceFileConfig: WorkspaceConfig = JSON.parse(readFileSync(workspaceFileLocation).toString());
                // Remove workspace file from path
                const projectRoot = workspaceFileLocation.slice(0, workspaceFileLocation.lastIndexOf(path.sep));

                if (workspaceFileConfig?.folders && projectRoot) {
                    const choreoComponents = await ProjectRegistry.getInstance().fetchComponentsFromCache(this._selectedProjectId,
                        (this._selectedOrg as Organization).handle, (this._selectedOrg as Organization).uuid);

                    choreoComponents?.forEach(({ name, displayType, apiVersions, accessibility, local = false }) => {
                        const wsConfig = workspaceFileConfig.folders.find(component => component.name === name);
                        if (wsConfig && wsConfig.path) {
                            const componentPath: string = path.join(projectRoot, wsConfig.path);
                            for (const localModel of model.values()) {
                                if (localModel.functionEntryPoint?.elementLocation.filePath.includes(componentPath) &&
                                    (displayType === ChoreoComponentType.ScheduledTask || displayType === ChoreoComponentType.ManualTrigger)) {
                                        localModel.functionEntryPoint.type = displayType;
                                }
                                const response = enrichDeploymentData(new Map(Object.entries(localModel.services)), apiVersions,
                                    componentPath, local, accessibility);
                                if (response === true) {
                                    break;
                                }
                            }
                        }
                    });
                }
            }
        }
        return Promise.resolve(model);
    }

    public async deleteComponent(projectId: string, componentPath: string) {
        const workspaceFilepath = ProjectRegistry.getInstance().getProjectLocation(projectId);
        if (workspaceFilepath && ext.api.selectedOrg) {
            const { handle, uuid } = ext.api.selectedOrg;
            const components: Component[] = await ProjectRegistry.getInstance().getComponents(projectId, handle, uuid);
            const workspaceFileConfig: WorkspaceConfig = JSON.parse(readFileSync(workspaceFilepath).toString());
            const wsResponse = workspaceFileConfig.folders.find(wsEntry => wsEntry.name !== 'choreo-project-root' && 
                componentPath.includes(wsEntry.path));
            const toDelete = components.find(component => component.name === wsResponse?.name);
            if (toDelete) {
                await ProjectRegistry.getInstance().deleteComponent(toDelete, handle, projectId);
            }
        }
    }
}
