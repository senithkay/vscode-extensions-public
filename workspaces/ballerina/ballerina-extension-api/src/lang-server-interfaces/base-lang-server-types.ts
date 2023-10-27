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

import { NotificationType, RequestType } from "vscode-messenger-common";
import { InitializeParams, InitializeResult } from "vscode-languageserver-protocol";

export interface DidOpenParams {
    textDocument: {
        uri: string;
        languageId: string;
        text: string;
        version: number;
    };
}

export interface DidCloseParams {
    textDocument: {
        uri: string;
    };
}

export interface DidChangeParams {
    textDocument: {
        uri: string;
        version: number;
    };
    contentChanges: [
        {
            text: string;
        }
    ];
}

export interface BaseLangClientInterface {
    init?: (params: InitializeParams) => Promise<InitializeResult>
    didOpen: (Params: DidOpenParams) => void;
    didClose: (params: DidCloseParams) => void;
    didChange: (params: DidChangeParams) => void;
    close?: () => void;
}


const baseLangClient = "baseLangClient/"

export const init: RequestType<InitializeParams, InitializeResult> = { method: `${baseLangClient}init` };

export const didOpen: NotificationType<DidOpenParams> = { method: `${baseLangClient}go2source` };
export const didClose: NotificationType<DidCloseParams> = { method: `${baseLangClient}didClose` };
export const didChange: NotificationType<DidChangeParams> = { method: `${baseLangClient}didChange` };
export const close: NotificationType<void> = { method: `${baseLangClient}close` };
