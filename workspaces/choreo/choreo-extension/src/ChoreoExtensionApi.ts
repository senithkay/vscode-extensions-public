/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Disposable, EventEmitter, workspace, WorkspaceFolder, Uri, window, commands, extensions } from 'vscode';
import { ext } from "./extensionVariables";

import {
    ChoreoLoginStatus,
    Organization,
    Project,
} from "@wso2-enterprise/choreo-core";
import {
    ComponentModel
} from "@wso2-enterprise/ballerina-languageclient";

// TODO: delete this file!
export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    isChoreoProject(): Promise<boolean>;
    getChoreoProject(): Promise<Project | undefined>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
    getNonBalComponentModels(): Promise<{ [key: string]: ComponentModel }>
    deleteComponent(projectId: string, componentPath: string): Promise<void>;
    getConsoleUrl(): Promise<string>;
}

export class ChoreoExtensionApi {
    // private _userInfo: UserInfo | undefined;
    // private _status: ChoreoLoginStatus;

    private _selectedProjectId: string | undefined;

    private _choreoInstallationOrgId: number | undefined;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


    private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

    private _onChoreoProjectChanged = new EventEmitter<string | undefined>();
    public onChoreoProjectChanged = this._onChoreoProjectChanged.event;

    private _onRefreshComponentList = new EventEmitter();
    public onRefreshComponentList = this._onRefreshComponentList.event;

    private _onRefreshWorkspaceMetadata = new EventEmitter();
    public onRefreshWorkspaceMetadata = this._onRefreshWorkspaceMetadata.event;

    constructor() {
        // this._status = STATUS_INITIALIZING;
    }

  

    public set status(value: ChoreoLoginStatus) {
        // this._status = value;
        this._onStatusChanged.fire(value);
    }

    public set selectedProjectId(selectedProjectId: string) {
        this._selectedProjectId = selectedProjectId;
        this._onChoreoProjectChanged.fire(selectedProjectId);
    }


    public refreshComponentList() {
        this._onRefreshComponentList.fire(null);
    }

    public refreshOrganization(org: Organization) {
        this._onOrganizationChanged.fire(org);
    }

    public refreshWorkspaceMetadata() {
        this._onRefreshWorkspaceMetadata.fire(null);
    }

    public projectUpdated() {
        this._onChoreoProjectChanged.fire(this._selectedProjectId);
    }

}
