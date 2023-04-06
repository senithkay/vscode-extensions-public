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
import { HOST_EXTENSION } from 'vscode-messenger-common';
import { WebviewApi } from 'vscode-webview';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggerResponse, BallerinaTriggersResponse, Connector } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Location, Service, EditLayerAPI, ServiceAnnotation } from '../../resources';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export class WebviewEditLayerAPI implements EditLayerAPI {
    private readonly _messenger: Messenger;
    private static _instance: WebviewEditLayerAPI;

    constructor(vscode: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscode);
        this._messenger.start();
    }

    public static getInstance(): WebviewEditLayerAPI {
        if (!this._instance) {
            let vscode: WebviewApi<unknown> = (window as any).vscode || acquireVsCodeApi();
            this._instance = new WebviewEditLayerAPI(vscode);
        }
        return this._instance;
    }

    public async createComponent(addComponentDetails: BallerinaComponentCreationParams): Promise<string> {
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
        return this._messenger.sendRequest({ method: 'addLink' }, HOST_EXTENSION, [source, target]);
    }

    public async deleteLink(linkLocation: Location, serviceLocation: Location): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'deleteLink' }, HOST_EXTENSION, { linkLocation, serviceLocation });
    }

    public async pickDirectory(): Promise<string | undefined> {
        return this._messenger.sendRequest({ method: 'pickDirectory' }, HOST_EXTENSION, '');
    }

    public async fetchTriggers(): Promise<BallerinaTriggersResponse> {
        return this._messenger.sendRequest({ method: 'fetchTriggers' }, HOST_EXTENSION, '');
    }

    public async fetchTrigger(triggerId: string): Promise<BallerinaTriggerResponse> {
        return this._messenger.sendRequest({ method: 'fetchTrigger' }, HOST_EXTENSION, triggerId);
    }    

    public async executeCommand(cmd: string): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'executeCommand' }, HOST_EXTENSION, cmd);
    }

    public async editDisplayLabel(annotation: ServiceAnnotation): Promise<boolean> {
        return this._messenger.sendRequest({ method: 'editDisplayLabel' }, HOST_EXTENSION, annotation);
    }

    public showErrorMessage(msg: string): void {
        this._messenger.sendNotification({ method: 'showErrorMsg' }, HOST_EXTENSION, msg);
    }

    public go2source(location: Location): void {
        return this._messenger.sendNotification({ method: 'go2source' }, HOST_EXTENSION, location);
    }

    public goToDesign(filePath: string, position: NodePosition): void {
        return this._messenger.sendNotification({ method: 'goToDesign' }, HOST_EXTENSION, { filePath, position })
    }
}
