/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 *  Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

export interface ApplyEditRequest {
    text: string;
    documentUri: string;
    range: Range;
}

export interface ApplyEditResponse {
    status: boolean;
}

export interface CreateAPIRequest {
   directory: string;
   name: string;
   context: string;
   swaggerDef: string;
   type: string;
   version: string;
}

export interface CreateEndpointRequest {
    directory: string;
    name: string;
    type: string;
    configuration: string;
    address: string;
    uriTemplate: string;
    method: string;
}
export interface CreateEndpointResponse {
    data: string;
}

export interface Connector {
    path: string;
    name: string;
    description: string;
    icon: string;
}
export interface ConnectorsResponse {
    data: Connector[];
}

export interface ProjectStructureResponse {
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

export interface CommandsRequest {
    commands: string[];
}

export interface CommandsResponse {
    data: string;
}

export interface getSTRequest {
    documentUri: string;
}
export interface getSTResponse {
    syntaxTree: any;
    defFilePath: string;
}

export interface ConnectorRequest {
    path: string;
}
export interface ConnectorResponse {
    data: Connector[];
}

export interface ProjectStructureRequest {
    data: string;
}

export interface ApiDirectoryResponse {
    data: string;
}

export interface EndpointDirectoryResponse {
    data: string;
}
export interface ShowErrorMessageRequest {
    message: string;
}

export interface OpenDiagramRequest extends CreateAPIRequest{
}

export interface CreateAPIResponse {
    data: string;
}

export interface EndpointsAndSequencesResponse {
    data: any;
}

export interface SequenceDirectoryResponse {
    data: string;
}

export interface CreateSequenceRequest {
    
}
export interface CreateSequenceResponse {

}
