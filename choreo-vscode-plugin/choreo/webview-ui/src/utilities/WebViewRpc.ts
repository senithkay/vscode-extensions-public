import { Messenger } from "vscode-messenger-webview";
import { HOST_EXTENSION, RequestType, NotificationType } from "vscode-messenger-common";

import type { WebviewApi } from "vscode-webview";
import { vscode } from "./vscode";

export type ChoreoLoginStatus = 'Initializing' | 'LoggingIn' | 'LoggedIn' | 'LoggedOut';

const getLoginStatus: RequestType<string, ChoreoLoginStatus> = { method: 'getLoginStatus' };
const getCurrentOrg: RequestType<string, Organization> = { method: 'getCurrentOrg' };
const getAllOrgs: RequestType<string, Organization[]> = { method: 'getAllOrgs' };

// notifications
const onLoginStatusChanged: NotificationType<string> = { method: 'loginStatusChanged' };
const onSelectedOrgChanged: NotificationType<Organization> = { method: 'selectedOrgChanged' };
const executeCommand: NotificationType<string[]> = { method: 'executeCommand' };

export interface Organization {
    id: string;
    uuid: string;
    handle: string;
    name: string;
    owner: Owner;
}

export interface Owner {
    id: string;
    idpId: string;
    createdAt: Date;
}

export class WebViewRpc {

    private readonly _messenger ;
    private static _instance: WebViewRpc;

    constructor(vscodeAPI: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscodeAPI);
        this._messenger.start();
    }

    public async getLoginStatus(): Promise<ChoreoLoginStatus> {
        return this._messenger.sendRequest(getLoginStatus, HOST_EXTENSION, '');
    }

    public async getCurrentOrg(): Promise<Organization> {
        return this._messenger.sendRequest(getCurrentOrg, HOST_EXTENSION, '');
    }
    
    public async getAllOrgs(): Promise<Organization[]> {
        return this._messenger.sendRequest(getAllOrgs, HOST_EXTENSION, '');
    }

    public onLoginStatusChanged(callback: (newStatus: ChoreoLoginStatus) => void) {
        this._messenger.onNotification(onLoginStatusChanged, callback);
    }

    public onSelectedOrgChanged(callback: (newOrg: Organization) => void) {
        this._messenger.onNotification(onSelectedOrgChanged, callback);
    }

    public triggerSignIn() {
        this._messenger.sendNotification(executeCommand, HOST_EXTENSION, ["wso2.choreo.sign.in"]);
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new WebViewRpc(vscode);
        }
        return this._instance;
    }
}