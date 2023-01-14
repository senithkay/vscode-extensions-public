/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client";
import { Messenger } from "vscode-messenger";
import { BallerinaProjectManager } from "./manager";
import { OpenDialogOptions, WebviewPanel, window } from "vscode";
import { AddComponentDetails, ComponentModel, Service } from "../resources";
import { ExtendedLangClient } from "src/core";
import { addConnector, linkServices, pullConnector } from "./code-generator";
import { getProjectResources } from "./utils";
import { BallerinaConnectorsResponse, BallerinaConnectorsRequest } from "workspaces/low-code-editor-commons/lib";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class ProjectDesignRPC {
    private _messenger: Messenger = new Messenger();
    private _isChoreoProject: boolean;
    private projectManager: ChoreoProjectManager | BallerinaProjectManager;

    constructor(webview: WebviewPanel, langClient: ExtendedLangClient) {
        this._messenger.registerWebviewPanel(webview);

        this._isChoreoProject = false;
        if (this._isChoreoProject) {
            this.projectManager = new ChoreoProjectManager();
        } else {
            this.projectManager = new BallerinaProjectManager();
        }

        this._messenger.onRequest({ method: 'createComponent' }, (addComponentDetails: AddComponentDetails): Promise<string> => {
            return this.projectManager.createComponent(addComponentDetails);
        });

        this._messenger.onRequest({ method: 'getProjectDetails' }, (): Promise<unknown> => {
            return this.projectManager.getProjectDetails();
        });

        this._messenger.onRequest({ method: 'getProjectRoot' }, (): Promise<string | undefined> => {
            return this.projectManager.getProjectRoot();
        });

        this._messenger.onRequest({ method: 'getConnectors' }, (args: BallerinaConnectorsRequest[]): Promise<BallerinaConnectorsResponse> => {
            return langClient.getConnectors(args[0]).then(result => {
                if((result as BallerinaConnectorsResponse).central){
                    return Promise.resolve(result as BallerinaConnectorsResponse);
                }
                return Promise.resolve({central:[], error: "Not found"} as BallerinaConnectorsResponse);
            });
        });

        this._messenger.onRequest({ method: 'addConnector' }, (args: any[]): Promise<boolean> => {
            return addConnector(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'pullConnector' }, (args: any[]): Promise<boolean> => {
            return pullConnector(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'addLinks' }, (args: Service[]): Promise<boolean> => {
            return linkServices(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'pickDirectory' }, async (): Promise<string | undefined> => {
            const fileUri = await window.showOpenDialog(directoryPickOptions);
            if (fileUri && fileUri[0]) {
                return fileUri[0].fsPath;
            }
        });

        this._messenger.onRequest({ method: 'getProjectResources' }, async (): Promise<Map<string, ComponentModel>> => {
            return getProjectResources(langClient);
        });
    }

    static create(webview: WebviewPanel, langClient: ExtendedLangClient) {
        return new ProjectDesignRPC(webview, langClient);
    }
}
