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

export interface ApplyEditRequest {
    text: string;
    documentUri: string;
    range: Range;
}

export interface CreateAPIRequest {
   directory: string;
   name: string;
   context: string;
   swaggerDef: string;
   type: string;
   version: string;
}

export interface ConnectorsResponse {
    path: string;
    name: string;
    description: string;
    icon: string;
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
    path: string;
}
export interface getSTResponse {
    path: string;
}

export interface ConnectorRequest {
    data: string[];
}
export interface ConnectorResponse {
    data: string[];
}

export interface ProjectStructureRequest {
    data: string;
}

export interface ApiDirectoryResponse {
    data: string;
}
export interface ShowErrorMessageRequest {
    message: string;
}

export interface OpenDiagramRequest {
    data: string;
}

export interface CreateAPIResponse {
    data: string;
}
