/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

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
    version: string;
    type: ComponentType;
    services: Services;
    connections: Connection[];
}

export interface Services {
    [key: string]: Service;
}

export interface Service {
    id: string;
    label: string;
    type: string;
    dependencyIds: string[];
    deploymentMetadata?: DeploymentMetadata;
}

export interface Connection {
    id: string;
    type: ConnectionType;
    onPlatform?: boolean;
}

export enum ConnectionType {
    HTTP = "http",
    GRPC = "grpc",
    Connector = "connector",
    Datastore = "datastore",
}

export interface ServiceMetadata {
    type: ConnectionType;
    organization: string;
    project: string;
    component: string;
    service: string;
}

export interface ConnectorMetadata {
    type: ConnectionType.Connector;
    organization: string;
    package: string;
}

export type ConnectionMetadata = ServiceMetadata | ConnectorMetadata;

export interface DeploymentMetadata {
    gateways: {
        internet: {
            isExposed: boolean;
        },
        intranet: {
            isExposed: boolean;
        }
    }
}
