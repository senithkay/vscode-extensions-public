/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RequestType, NotificationType } from 'vscode-messenger-common';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

export interface ApplyEditParams {
    text: string;
    documentUri: string;
    range: Range;
}

export interface GetConnectorsResponse {
    path: string;
    name: string;
    description: string;
    icon: string;
}

export interface GetProjectStructureResponse {
    directoryMap: {
        [key: string]: {
            [key: string]: ProjectStructureEntry[]
        }
    };
}

export interface ProjectStructureEntry {
    sequences: ProjectStructureEntry[],
    endpoints: ProjectStructureEntry[],
    type: string,
    name: string,
    path: string

}

// request types 
export const ExecuteCommandRequest: RequestType<string[], unknown> = { method: 'executeCommand' };
export const GetSyntaxTreeRequest: RequestType<string, unknown> = { method: 'xml/getSynapseSyntaxTree' };
export const GetConnectorsRequest: RequestType<void, GetConnectorsResponse[]> = { method: 'getConnectors' };
export const GetConnectorRequest: RequestType<string, string[]> = { method: 'getConnector' };
export const GetProjectStructureRequest: RequestType<string, GetProjectStructureResponse> = { method: 'xml/getSynapseSourceMap' };

// notification types
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };
export const Refresh: NotificationType<void> = { method: 'refresh' };
export const ApplyEdit: NotificationType<ApplyEditParams> = { method: 'applyEdit' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
    return {
        message: err.message,
        cause: err.cause ? err.cause.message : ""
    };
}
