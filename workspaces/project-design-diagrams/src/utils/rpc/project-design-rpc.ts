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

import { Messenger } from 'vscode-messenger-webview';
import { HOST_EXTENSION } from "vscode-messenger-common";
import { WebviewApi } from 'vscode-webview';
import { AddComponentDetails, ComponentModel, Service } from '../../resources';
import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, Connector } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export class ProjectDesignRPC {
    private readonly _messenger: Messenger;
    private static _instance: ProjectDesignRPC;

    constructor(vscode: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscode);
        this._messenger.start();
    }

    public static getInstance() {
        if (!this._instance) {
            let vscode: WebviewApi<unknown> = (window as any).vscode || acquireVsCodeApi();
            this._instance = new ProjectDesignRPC(vscode);
        }
        return this._instance;
    }

    public async createComponent(addComponentDetails: AddComponentDetails): Promise<string> {
        return this._messenger.sendRequest({ method: 'createComponent' }, HOST_EXTENSION, addComponentDetails);
    }

    public async getProjectDetails(): Promise<any> {
        return this._messenger.sendRequest({ method: 'getProjectDetails' }, HOST_EXTENSION, '');
    }

    public async getProjectRoot(): Promise<string | undefined> {
        return this._messenger.sendRequest({ method: 'getProjectRoot' }, HOST_EXTENSION, '');
    }

    public async getConnectors(params: BallerinaConnectorsRequest): Promise<BallerinaConnectorsResponse> {
        return this._messenger.sendRequest({ method: 'getConnectors' }, HOST_EXTENSION, [params]);
    }

    public async pullConnector(connector: Connector, targetService: Service): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'pullConnector' }, HOST_EXTENSION, [connector, targetService]);
    }

    public async addConnector(connector: Connector, targetService: Service): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'addConnector' }, HOST_EXTENSION, [connector, targetService]);
    }

    public async addLink(source: Service, target: Service): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'addLinks' }, HOST_EXTENSION, [source, target]);
    }

    public async pickDirectory(): Promise<string | undefined> {
        return this._messenger.sendRequest({ method: 'pickDirectory' }, HOST_EXTENSION, '');
    }

    public async fetchComponentModels(): Promise<Map<string, ComponentModel>> {
        return this._messenger.sendRequest({ method: 'getProjectResources' }, HOST_EXTENSION, '');
    }
}
