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

export interface CreateAPIParams {
   directory: string;
   name: string;
   context: string;
   swaggerDef: string;
   type: string;
   version: string;
}

export interface CreateEndpointParams {
    directory: string;
    name: string;
    type: string;
    configuration: string;
    address: string;
    uriTemplate: string;
    method: string;
 }

export interface GetConnectorsResponse {
    path: string;
    name: string;
    description: string;
    icon: string;
}

export interface GetProjectStructureResponse {
    directoryMap: {
        esbConfigs: {
            [key: string]: ProjectStructureEntry[]
        },
        dataServiceConfigs: ProjectStructureEntry[],
        dataSourceConfigs: ProjectStructureEntry[],
        mediatorProjects: ProjectStructureEntry[],
        registryResources: ProjectStructureEntry[],
        javaLibraryProjects: ProjectStructureEntry[],
        compositeExporters: ProjectStructureEntry[],
        connectorExporters: ProjectStructureEntry[],
        dockerExporters: ProjectStructureEntry[],
        kubernetesExporters: ProjectStructureEntry[]
    };
}

export interface ProjectStructureEntry {
    sequences?: ProjectStructureEntry[],
    endpoints?: ProjectStructureEntry[],
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
export const GetAPIDirectory: RequestType<void, string> = { method: 'getAPIDirectory' };
export const CreateAPI: RequestType<CreateAPIParams, string> = {method: 'createAPI'};
export const GetEndpointDirectory: RequestType<void, string> = { method: 'getEndpointDirectory' };
export const CreateEndpoint: RequestType<CreateEndpointParams, string> = {method: 'createEndpoint'};

// notification types
export const ShowErrorMessage: NotificationType<string> = { method: 'showErrorMessage' };
export const Refresh: NotificationType<void> = { method: 'refresh' };
export const ApplyEdit: NotificationType<ApplyEditParams> = { method: 'applyEdit' };
export const CloseWebViewNotification: NotificationType<void> = { method: 'close' };
export const OpenDiagram: NotificationType<string> = { method: 'openDiagram' };
export const OpenFile: NotificationType<string> = { method: 'openFile' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeError(err: any) {
    return {
        message: err.message,
        cause: err.cause ? err.cause.message : ""
    };
}
