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
} from "@wso2-enterprise/choreo-core";
import { exchangeAuthToken } from "./auth/auth";
import { readFileSync } from 'fs';
import { ProjectRegistry } from './registry/project-registry';
import * as path from "path";
import { enrichDeploymentData } from "./utils";

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    isChoreoProject(): Promise<boolean>;
    getChoreoProject(): Promise<Project | undefined>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
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
        this._status = "Initializing";
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
        this._onOrganizationChanged.fire(selectedOrg);
    }

    public set selectedProjectId(selectedProjectId: string) {
        this._selectedProjectId = selectedProjectId;
        this._onChoreoProjectChanged.fire(selectedProjectId);
    }

    public async signIn(authCode: string): Promise<void> {
        return exchangeAuthToken(authCode);
    }

    public async waitForLogin(): Promise<boolean> {
        switch (this._status) {
            case 'LoggedIn':
                return true;
            case 'LoggedOut':
                return false;
            case 'Initializing':
            case 'LoggingIn':
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

    public async getChoreoProject(): Promise<Project|undefined> {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID,
                  orgId = workspaceConfig.metadata?.choreo?.orgId;
            if (projectID && orgId) {
                return ProjectRegistry.getInstance().getProject(projectID, orgId);
            }
        }
    }

    public getProjectManager(projectId: string): Promise<IProjectManager | undefined> {
        return Promise.resolve(undefined);
    }

    public async enrichChoreoMetadata(model: Map<string, ComponentModel>):
        Promise<Map<string, ComponentModel> | undefined> {
        if (this._selectedProjectId && this._selectedOrg?.id && this._selectedOrg) {
            const workspaceFileLocation = ProjectRegistry.getInstance().getProjectLocation(this._selectedProjectId);
            // Remove workspace file from path
            const currentProjectLocation = workspaceFileLocation?.slice(0, workspaceFileLocation.lastIndexOf(path.sep));
            const repository = ProjectRegistry.getInstance().getProjectRepository(this._selectedProjectId);
            if (repository && currentProjectLocation) {
                const currentRepoLocation = path.join(currentProjectLocation, "repos", repository);
                const projectComponents = await ProjectRegistry.getInstance().getComponents(this._selectedProjectId,
                    (this._selectedOrg as Organization).handle);
                if (currentProjectLocation) {
                    projectComponents.forEach(({name, apiVersions, accessibility}) => {
                        if (accessibility) {
                            model.forEach(localModel => {
                                enrichDeploymentData(new Map(Object.entries(localModel.services)), apiVersions,
                                    accessibility, currentRepoLocation, name);
                            });
                        }
                    });
                }
            }
        }
        return Promise.resolve(model);
    }
}
