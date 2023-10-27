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

import { NodePosition } from '@wso2-enterprise/syntax-tree';
import {WorkspaceFolder} from 'vscode';
import { RequestType } from 'vscode-messenger-common';

export interface DiagramFocus {
    fileUri: string;
    position?: NodePosition;
}

export interface ExtensionAPI {
    getBallerinaVersion: () => Promise<string | undefined>;
    getEnv: (name: string) => Promise<any>;
    getFileContent: (url: string) => Promise<string>;

    // could maintain these as props as well without get detail through a call
    getWorkspaceName: () => Promise<string>;
    getLastUpdatedAt: () => Promise<string>;
    IsExperimentalEnabled: () => Promise<boolean>;
    getProjectPaths: () => Promise<WorkspaceFolder[]>;
    getDiagramFocus: () => Promise<DiagramFocus>;
}

const extensionAPI = "extension-api/"

export const getBallerinaVersion: RequestType<void, string | undefined> = { method: `${extensionAPI}getBallerinaVersion` };
export const getEnv: RequestType<string, any> = { method: `${extensionAPI}getEnv` };
export const getFileContent: RequestType<string, string> = { method: `${extensionAPI}getFileContent` };

export const getWorkspaceName: RequestType<void, string> = { method: `${extensionAPI}getWorkspaceName` };
export const getLastUpdatedAt: RequestType<void, string> = { method: `${extensionAPI}getLastUpdatedAt` };
export const IsExperimentalEnabled: RequestType<void, boolean> = { method: `${extensionAPI}IsExperimentalEnabled` };
export const getProjectPaths: RequestType<void, WorkspaceFolder[]> = { method: `${extensionAPI}getProjectPaths` };
export const getDiagramFocus: RequestType<void, DiagramFocus> = { method: `${extensionAPI}getDiagramFocus` };
