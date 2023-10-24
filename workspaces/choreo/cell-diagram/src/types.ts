/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CellLinkModel, ComponentLinkModel, ComponentModel, ConnectionModel, EmptyModel, ExternalLinkModel, ExternalModel } from "./components";

export interface Project {
    id: string;
    name: string;
    components: Component[];
    configurations?: Connection[];
    modelVersion: string;
}

export enum ComponentType {
    SERVICE = "service",
    WEB_APP = "web-app",
    SCHEDULED_TASK = "scheduled-task",
    MANUAL_TASK = "manual-task",
    API_PROXY = "api-proxy",
    WEB_HOOK = "web-hook",
    EVENT_HANDLER = "event-handler",
    TEST = "test",
}

export interface Component {
    id: string;
    label?: string;
    version: string;
    type: ComponentType;
    buildPack?: string; // Component implemented language
    services: Services;
    connections: Connection[];
}

export interface Services {
    [key: string]: Service;
}

export interface Service {
    id: string;
    label?: string;
    type: string;
    dependencyIds: string[];
    deploymentMetadata?: DeploymentMetadata;
}

export interface Connection {
    id: string;
    label?: string;
    type?: ConnectionType;
    onPlatform?: boolean;
    observations?: Observations[];
}

export enum ConnectionType {
    HTTP = "http",
    GRPC = "grpc",
    WebSocket = "web-socket",
    Connector = "connector",
    Datastore = "datastore",
}

export interface ComponentMetadata {
    type: ConnectionType;
    organization: string;
    project: string;
    component: string;
    service?: string;
}
export interface ConnectorMetadata {
    type: ConnectionType.Connector;
    organization: string;
    package: string;
}

export type ConnectionMetadata = ComponentMetadata | ConnectorMetadata;

export interface DeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
            observations?: Observations[];
        };
        intranet: {
            isExposed: boolean;
            observations?: Observations[];
        };
    };
}

export interface Observations {
    label?: string;
    componentVersion?: string;
    sourceNodeId: number;
    destinationNodeId: number;
    avgLatency: number;
    errorCount: number;
    p50Latency: number;
    p90Latency: number;
    p99Latency: number;
    requestCount: number;
}

// Util function types

export type CommonModel = ComponentModel | ConnectionModel | ExternalModel | EmptyModel;
export interface NodesAndLinks {
    nodes: Nodes;
    links: Links;
}

export interface Nodes {
    [key: string]: Map<string, CommonModel>;
}

export interface Links {
    [key: string]: Map<string, ComponentLinkModel | ExternalLinkModel | CellLinkModel>;
}
