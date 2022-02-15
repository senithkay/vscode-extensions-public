/*
* Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 Inc. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
export interface LibraryDocResponse {
    librariesList: LibraryInfo[];
}

export interface LibraryInfo {
    id: string;
    summary?: string;
    description?: string;
    orgName: string;
    version: string;
    isDefaultModule: boolean;
}

export enum LibraryKind {
    langLib = 'langLibs',
    stdLib = 'modules',
}

export interface LibrarySearchResponse {
    modules: LibraryInfo[];
    classes: ModuleProperty[];
    functions: ModuleProperty[];
    records: ModuleProperty[];
    constants: ModuleProperty[];
    errors: ModuleProperty[];
    types: ModuleProperty[];
    clients: ModuleProperty[];
    listeners: ModuleProperty[];
    annotations: ModuleProperty[];
    objectTypes: ModuleProperty[];
    enums: ModuleProperty[];
}

export interface LibraryDataResponse {
    docsData: LibraryDocsData;
    searchData: LibrarySearchResponse;
}

export interface ModuleProperty {
    id: string;
    description: string;
    moduleId: string;
    moduleOrgName: string;
    moduleVersion: string;
}

export interface LibraryDocsData {
    releaseVersion: string;
    langLibs: any;
    modules: LibraryModule[];
}

export interface LibraryModule {
    relatedModules: any;
    records: any;
    classes: any;
    objectTypes: any;
    clients: any;
    listeners: any;
    functions: LibraryFunction[];
    constants: any;
    annotations: any;
    errors: any;
    types: any;
    enums: any;
    variables: any;
    id: string;
    summary: string;
    description: string;
    orgName: string;
    version: string;
    isDefaultModule: boolean;
}

export interface LibraryFunction {
    isIsolated: boolean;
    isRemote: boolean;
    isExtern: boolean;
    parameters: FunctionParams[];
    returnParameters: any;
    name: string;
    description: string;
    isDeprecated: boolean;
    isReadOnly: boolean;
}

export interface FunctionParams {
    defaultValue: string;
    type: any;
    name: string;
    description: string;
    isDeprecated: boolean;
    isReadOnly: boolean;
}
