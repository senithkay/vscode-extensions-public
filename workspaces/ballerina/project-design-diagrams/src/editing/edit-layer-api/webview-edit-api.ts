/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from 'vscode-messenger-webview';
import { HOST_EXTENSION } from 'vscode-messenger-common';
import { WebviewApi } from 'vscode-webview';
import {
    CMAnnotation as Annotation, CMEntryPoint as EntryPoint, CMLocation as Location, CMService as Service
} from '@wso2-enterprise/ballerina-languageclient';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import {
    BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggerResponse, BallerinaTriggersResponse, Connector
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { EditLayerAPI } from '../../resources';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

interface DeleteComponentProps {
    location: Location;
    deletePkg: boolean;
}
const PRE_FIX = "project-design/";

export class WebviewEditLayerAPI implements EditLayerAPI {
    private readonly _messenger: Messenger;
    private static _instance: WebviewEditLayerAPI;

    constructor(vscode: WebviewApi<unknown>) {
        this._messenger = new Messenger(vscode);
        this._messenger.start();
    }

    public static getInstance(): WebviewEditLayerAPI {
        if (!this._instance) {
            let vscode: WebviewApi<unknown> = (window as any).vscode;
            this._instance = new WebviewEditLayerAPI(vscode);
        }
        return this._instance;
    }

    public showView(view: string) {
        return this._messenger.sendRequest({ method: PRE_FIX + 'onViewChange' }, HOST_EXTENSION, view);
    }

    public async getComponentModel(): Promise<any> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'getComponentModel' }, HOST_EXTENSION);
    }

    public async showChoreoProjectOverview(): Promise<any> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'showChoreoProjectOverview' }, HOST_EXTENSION);
    }

    public async deleteComponent(props: DeleteComponentProps): Promise<void> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'deleteComponent' }, HOST_EXTENSION, props);
    }

    public async isChoreoProject(): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'isChoreoProject' }, HOST_EXTENSION);
    }

    public async selectedNodeId(): Promise<string> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'selectedNodeId' }, HOST_EXTENSION);
    }

    public async isCellView(): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'isCellView' }, HOST_EXTENSION);
    }

    public async createComponent(addComponentDetails: BallerinaComponentCreationParams): Promise<string> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'createComponent' }, HOST_EXTENSION, addComponentDetails);
    }

    public async getProjectDetails(): Promise<any> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'getProjectDetails' }, HOST_EXTENSION, '');
    }

    public async getProjectRoot(): Promise<string | undefined> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'getProjectRoot' }, HOST_EXTENSION, '');
    }

    public async getConnectors(params: BallerinaConnectorsRequest): Promise<BallerinaConnectorsResponse> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'getConnectors' }, HOST_EXTENSION, [params]);
    }

    public async pullConnector(connector: Connector, source: Service | EntryPoint): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'pullConnector' }, HOST_EXTENSION, { connector, source });
    }

    public async addConnector(connector: Connector, source: EntryPoint | Service): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'addConnector' }, HOST_EXTENSION, { connector, source });
    }

    public async addLink(source: Service | EntryPoint, target: Service): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'addLink' }, HOST_EXTENSION, { source, target });
    }

    public async deleteLink(linkLocation: Location, nodeLocation: Location): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'deleteLink' }, HOST_EXTENSION, { linkLocation, nodeLocation });
    }

    public async pickDirectory(): Promise<string | undefined> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'pickDirectory' }, HOST_EXTENSION, '');
    }

    public async fetchTriggers(): Promise<BallerinaTriggersResponse> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'fetchTriggers' }, HOST_EXTENSION, '');
    }

    public async fetchTrigger(triggerId: string): Promise<BallerinaTriggerResponse> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'fetchTrigger' }, HOST_EXTENSION, triggerId);
    }

    public async executeCommand(cmd: string): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'executeCommand' }, HOST_EXTENSION, cmd);
    }

    public async editDisplayLabel(annotation: Annotation): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'editDisplayLabel' }, HOST_EXTENSION, annotation);
    }

    public showDiagnosticsWarning(): void {
        this._messenger.sendNotification({ method: PRE_FIX + 'showDiagnosticsWarning' }, HOST_EXTENSION, '');
    }

    public showErrorMessage(msg: string): void {
        this._messenger.sendNotification({ method: PRE_FIX + 'showErrorMsg' }, HOST_EXTENSION, msg);
    }

    public go2source(location: Location): void {
        return this._messenger.sendNotification({ method: PRE_FIX + 'go2source' }, HOST_EXTENSION, location);
    }

    public goToDesign(filePath: string, position: NodePosition): void {
        return this._messenger.sendNotification({ method: PRE_FIX + 'goToDesign' }, HOST_EXTENSION, { filePath, position })
    }

    public checkIsMultiRootWs(): Promise<boolean> {
        return this._messenger.sendRequest({ method: PRE_FIX + 'checkIsMultiRootWs' }, HOST_EXTENSION, '');
    }

    public promptWorkspaceConversion(): void {
        return this._messenger.sendNotification({ method: PRE_FIX + 'promptWorkspaceConversion' }, HOST_EXTENSION, '');
    }
}
