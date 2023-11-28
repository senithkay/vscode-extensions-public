/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { CellDiagram, CellDiagramProps } from "../Diagram";
import { Container, componentMenu, handleComponentDoubleClick } from "./utils";

export default {
    title: "Samples",
    component: CellDiagram,
    args: {
        animation: true,
        showControls: true,
        componentMenu: componentMenu,
        onComponentDoubleClick: handleComponentDoubleClick,
    },
};

export const Links: Story = (args: CellDiagramProps) => (
    <Container>
        <CellDiagram {...args} />
    </Container>
);

Links.args = {
    project: {
        id: "PRG",
        components: [
            {
                id: "A",
                type: "service",
                connections: [
                    {
                        id: "ORG:PRG:B",
                    },
                ],
            },
            {
                id: "B",
                type: "service",
                services: {
                    "PRG:B:Service1:Get": {
                        id: "PRG:B:Service1:Get",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: true,
                                },
                                intranet: {
                                    isExposed: false,
                                },
                            },
                        },
                    },
                },
                connections: [
                    {
                        id: "ORG:ORG:IDA",
                    },
                ],
            },
            {
                id: "C",
                type: "service",
                connections: [{ id: "EDA", type: "connector" }],
            },
        ],
    },
};

export const ObservationsNDiff: Story = (args: CellDiagramProps) => (
    <Container>
        <CellDiagram {...args} />
    </Container>
);

ObservationsNDiff.args = {
    project: {
        id: "A",
        name: "A",
        components: [
            {
                id: "Users",
                version: "0.2.0",
                type: "service",
                services: {
                    "ABC:A:Users:get": {
                        id: "ABC:A:Users:get",
                        label: "Get Users",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: true,
                                    tooltip: "test tooltip with observations",
                                    observations: [
                                        {
                                            version: "0.2.0",
                                            avgLatency: 136631633,
                                            destinationNodeId: 1,
                                            errorCount: 0,
                                            p50Latency: 21132684,
                                            p90Latency: 1043810050,
                                            p99Latency: 2199582500,
                                            requestCount: 36,
                                            sourceNodeId: 0,
                                        },
                                    ],
                                },
                                intranet: {
                                    isExposed: true,
                                    observations: [
                                        {
                                            version: "0.2.0",
                                            avgLatency: 207605809,
                                            destinationNodeId: 2,
                                            errorCount: 4,
                                            p50Latency: 22461844,
                                            p90Latency: 1469733900,
                                            p99Latency: 1469733900,
                                            requestCount: 16,
                                            sourceNodeId: 0,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    "ABC:A:Users:post": {
                        id: "ABC:A:Users:post",
                        label: "Add Users",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: true,
                                    observations: [
                                        {
                                            version: "0.2.0",
                                            avgLatency: 136631633,
                                            destinationNodeId: 1,
                                            errorCount: 10,
                                            p50Latency: 21132684,
                                            p90Latency: 1043810050,
                                            p99Latency: 2199582500,
                                            requestCount: 36,
                                            sourceNodeId: 0,
                                        },
                                    ],
                                },
                                intranet: {
                                    isExposed: false,
                                },
                            },
                        },
                    },
                    "ABC:A:Users:put": {
                        id: "ABC:A:Users:put",
                        label: "Update Users",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: true,
                                    observations: [
                                        {
                                            version: "0.2.0",
                                            avgLatency: 136631633,
                                            destinationNodeId: 1,
                                            errorCount: 10,
                                            p50Latency: 21132684,
                                            p90Latency: 1043810050,
                                            p99Latency: 2199582500,
                                            requestCount: 2500,
                                            sourceNodeId: 0,
                                        },
                                    ],
                                },
                                intranet: {
                                    isExposed: false,
                                },
                            },
                        },
                    },
                },
                connections: [
                    {
                        id: "ABC:A:Products:basepath",
                        onPlatform: true,
                        observations: [],
                    },
                    {
                        id: "googleapps://firebase",
                        label: "Firebase",
                        onPlatform: false,
                        type: "datastore",
                        observations: [
                            {
                                version: "0.2.0",
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 4000,
                                sourceNodeId: 2,
                            },
                        ],
                    },
                ],
            },
            {
                id: "Products",
                label: "Products",
                version: "0.2.0",
                type: "service",
                services: {
                    "ABC:A:Products:get": {
                        id: "ABC:A:Products:get",
                        label: "Get Products",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: false,
                                },
                                intranet: {
                                    isExposed: false,
                                },
                            },
                        },
                    },
                },
                connections: [
                    {
                        id: "ABC:B:Users:get",
                        label: "Org Users",
                        onPlatform: true,
                        observations: [
                            {
                                version: "0.2.0",
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 10000,
                                sourceNodeId: 2,
                            },
                        ],
                        observationOnly: true,
                    },
                    {
                        id: "mysql://mysql",
                        onPlatform: true,
                        type: "datastore",
                        observations: [
                            {
                                version: "0.2.0",
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 20,
                                sourceNodeId: 2,
                            },
                        ],
                    },
                ],
            },
            {
                id: "Invoices",
                version: "0.2.0",
                type: "service",
                services: {
                    "ABC:A:Invoices:get": {
                        id: "ABC:A:Invoices:get",
                        label: "Get Invoices",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: false,
                                },
                                intranet: {
                                    isExposed: true,
                                },
                            },
                        },
                    },
                },
                connections: [
                    {
                        id: "ABC:B:Invoices:post",
                        label: "Org Invoices",
                        type: "http",
                        onPlatform: true,
                        observations: [
                            {
                                version: "0.2.0",
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 158,
                                sourceNodeId: 2,
                            },
                        ],
                    },
                    {
                        id: "ABC:A:Users:get",
                        onPlatform: true,
                        observations: [
                            {
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 150,
                                sourceNodeId: 2,
                                componentVersion: "0.2.0",
                            },
                            {
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 300,
                                sourceNodeId: 2,
                                componentVersion: "0.1.0",
                            },
                        ],
                    },
                    {
                        id: "mysql://mysql",
                        label: "MySQL DB",
                        onPlatform: false,
                        type: "datastore",
                        observations: [
                            {
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 2000,
                                sourceNodeId: 2,
                            },
                        ],
                    },
                ],
            },
            {
                id: "Transactions",
                version: "0.2.0",
                type: "service",
                services: {
                    "ABC:A:Invoices:get": {
                        id: "ABC:A:Invoices:get",
                        label: "Get Invoices",
                        type: "http",
                        dependencyIds: [],
                        deploymentMetadata: {
                            gateways: {
                                internet: {
                                    isExposed: false,
                                },
                                intranet: {
                                    isExposed: false,
                                },
                            },
                        },
                    },
                },
                connections: [
                    {
                        id: "ABC:A:Products:basepath",
                        onPlatform: true,
                        observations: [
                            {
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 1500,
                                sourceNodeId: 2,
                                componentVersion: "0.2.0",
                            },
                            {
                                avgLatency: 191934320,
                                destinationNodeId: 1,
                                errorCount: 0,
                                p50Latency: 191934320,
                                p90Latency: 191934320,
                                p99Latency: 191934320,
                                requestCount: 3000,
                                sourceNodeId: 2,
                                componentVersion: "0.1.0",
                            },
                        ],
                        observationOnly: true,
                    },
                ],
            },
        ],
        modelVersion: "0.4.0",
    },
};
