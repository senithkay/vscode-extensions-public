import { Messenger } from "vscode-messenger-webview";
import { HOST_EXTENSION } from "vscode-messenger-common";

import type { WebviewApi } from "vscode-webview";
import { vscode } from "./vscode";

export type ChoreoLoginStatus = 'Initializing' | 'LoggingIn' | 'LoggedIn' | 'LoggedOut';
const getLoginStatus = { method: 'getLoginStatus' };
const getCurrentOrg = { method: 'getCurrentOrg' };
const getAllOrgs = { method: 'getAllOrgs' };

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
    }

    public async getLoginStatus(): Promise<ChoreoLoginStatus> {
        return this._messenger.sendRequest(getLoginStatus, HOST_EXTENSION, undefined);
    }

    public async getCurrentOrg(): Promise<Organization> {
        return this._messenger.sendRequest(getCurrentOrg, HOST_EXTENSION, undefined);
    }

    public async getAllOrgs(): Promise<Organization[]> {
        return this._messenger.sendRequest(getAllOrgs, HOST_EXTENSION, undefined);
    }

    public static getInstance() {
        if (!this._instance) {
            this._instance = new WebViewRpc(vscode);
        }
        return this._instance;
    }
}