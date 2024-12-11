/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LinePosition } from "./common";

// Component Diagram Model
export type CDModel = {
    automation: CDAutomation;
    connections: CDConnection[];
    listeners: CDListener[];
    services: CDService[];
};

export type CDAutomation = {
    name: string;
    displayName: string;
    location: CDLocation;
    connections: string[];
    uuid: string;
};

export type CDLocation = LinePosition & {
    filePath: string;
};

export type CDConnection = {
    symbol: string;
    location: CDLocation;
    scope: string;
    uuid: string;
};

export type CDListener = {
    symbol: string;
    location: CDLocation;
    attachedServices: string[];
    kind: string;
    type: string;
    args: CDArg[];
    uuid: string;
};

export type CDArg = {
    key: string;
    value: string;
};

export type CDService = {
    displayName?: string;
    location: CDLocation;
    listener: string;
    connections: string[];
    functions: CDFuction[];
    remoteFunctions: CDFuction[];
    resourceFunctions: ResourceFunction[];
    absolutePath: string;
    uuid: string;
};

export type CDFuction = {
    name: string;
    location: CDLocation;
};

export type ResourceFunction = {
    accessor: string;
    path: string;
    location: CDLocation;
};
