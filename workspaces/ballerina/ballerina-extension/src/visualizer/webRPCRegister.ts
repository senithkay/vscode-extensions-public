/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { Messenger } from 'vscode-messenger';
import { NotificationType, RequestType } from "vscode-messenger-common";
import {
    getContext,
    getLangClient, getService, openView
} from './activator';
import { error } from 'console';
import { checkIsChoreoProject, deleteProjectComponent, getActiveChoreoProject, getComponentModel, showChoreoProjectOverview } from '../project-design-diagrams/utils/shared-utils';
import { CMLocation, GetComponentModelResponse } from '@wso2-enterprise/ballerina-languageclient';
import { ExtensionContext, WebviewPanel, workspace } from 'vscode';
import { registerProjectDesignRPCHandlers } from '../project-design-diagrams/rpc-layer/rpc-handler';
import { BallerinaExtension, ExtendedLangClient } from '../core';


const stateChanged: NotificationType<any> = { method: 'stateChanged' };

export class RPCLayer {
    private _messenger: Messenger = new Messenger();
    private _langClient: ExtendedLangClient;
    private _vsContext: ExtensionContext
    private _ballerinaContext: BallerinaExtension;

    constructor(webViewPanel: WebviewPanel, _ballerinaContext: BallerinaExtension) {
        this._messenger.registerWebviewPanel(webViewPanel);
        this._langClient = _ballerinaContext.langClient;
        this._vsContext = _ballerinaContext.context;
        this._ballerinaContext = _ballerinaContext;
        
        registerProjectDesignRPCHandlers(this._messenger, this._langClient, this._vsContext, false);


        // Inform console of changing state
        getService().onTransition((state) => {
            const snapshot: any = {
                state: stateString(state.value),
                viewContext: state.context
            };
            this._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: 'visualizer' }, snapshot);
        });



    }

    static create(webViewPanel: WebviewPanel, balExt: BallerinaExtension) {
        return new RPCLayer(webViewPanel, balExt);
    }
}




function stateString(state: any): string {
    if (typeof state === 'string') {
        return state;
    } else if (typeof state === 'object') {
        const stateString = Object.entries(state).map(([key, value]) => `${key}.${value}`).at(0);
        if (stateString === undefined) {
            throw error("Undefined state");
        } else {
            return stateString;
        }
    } else {
        throw error("Undefined state");
    }
}
