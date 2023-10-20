/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { storiesOf } from "@storybook/react";
import { CellDiagram } from "../Diagram";
import { Project } from "../types";
import { Container, componentMenu, handleComponentDoubleClick } from "./utils";

const ComponentModel: Project = {
    id: "b7d6fb00-5fb6-48fc-a14f-c68cea999e35",
    name: "Pet Store",
    components: [
        {
            id: "dc3a293d-ab23-4325-ab0c-7adda1969012",
            label: "catalog",
            version: "v1.0",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:dc3a293d-ab23-4325-ab0c-7adda1969012:Catalog": {
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:dc3a293d-ab23-4325-ab0c-7adda1969012:Catalog",
                    label: "",
                    type: "HTTP",
                    dependencyIds: [],
                    deploymentMetadata: {
                        gateways: {
                            internet: {
                                isExposed: true,
                                observations: [
                                    {
                                        componentVersion: "v1.0",
                                        avgLatency: 145543004,
                                        destinationNodeId: 3,
                                        errorCount: 1,
                                        p50Latency: 14917084,
                                        p90Latency: 1984170200,
                                        p99Latency: 2300928000,
                                        requestCount: 44,
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
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:926f2b2d-2d7d-484a-8984-e3dfff31c5aa:Orders",
                    type: "http",
                    observations: [
                        {
                            componentVersion: "v1.0",
                            avgLatency: 204537550,
                            destinationNodeId: 4,
                            errorCount: 0,
                            p50Latency: 204537550,
                            p90Latency: 204537550,
                            p99Latency: 204537550,
                            requestCount: 1,
                            sourceNodeId: 3,
                        },
                    ],
                    onPlatform: true,
                },
            ],
        },
        {
            id: "7ce9bcfc-f669-445a-b760-a1cedc798008",
            label: "user-management",
            version: "v1.0",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:7ce9bcfc-f669-445a-b760-a1cedc798008:UserManagement": {
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:7ce9bcfc-f669-445a-b760-a1cedc798008:UserManagement",
                    label: "",
                    type: "HTTP",
                    dependencyIds: [],
                    deploymentMetadata: {
                        gateways: {
                            internet: {
                                isExposed: true,
                                observations: [
                                    {
                                        componentVersion: "v1.0",
                                        avgLatency: 207605809,
                                        destinationNodeId: 2,
                                        errorCount: 4,
                                        p50Latency: 22461844,
                                        p90Latency: 1469733900,
                                        p99Latency: 1469733900,
                                        requestCount: 8,
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
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:08b51ac2-95b9-4491-94d5-8ff4a3c91b5b:Cart",
                    type: "http",
                    observations: [
                        {
                            componentVersion: "v1.0",
                            avgLatency: 191934320,
                            destinationNodeId: 1,
                            errorCount: 0,
                            p50Latency: 191934320,
                            p90Latency: 191934320,
                            p99Latency: 191934320,
                            requestCount: 1,
                            sourceNodeId: 2,
                        },
                    ],
                    onPlatform: true,
                },
            ],
        },
        {
            id: "08b51ac2-95b9-4491-94d5-8ff4a3c91b5b",
            label: "cart",
            version: "v1.0",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:08b51ac2-95b9-4491-94d5-8ff4a3c91b5b:Cart": {
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:08b51ac2-95b9-4491-94d5-8ff4a3c91b5b:Cart",
                    label: "",
                    type: "HTTP",
                    dependencyIds: [],
                    deploymentMetadata: {
                        gateways: {
                            internet: {
                                isExposed: true,
                                observations: [
                                    {
                                        componentVersion: "v1.0",
                                        avgLatency: 671384543,
                                        destinationNodeId: 1,
                                        errorCount: 0,
                                        p50Latency: 111837105,
                                        p90Latency: 2193888530,
                                        p99Latency: 2193888530,
                                        requestCount: 7,
                                        sourceNodeId: 0,
                                    },
                                    {
                                        componentVersion: "v1.0",
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
                                isExposed: false,
                            },
                        },
                    },
                },
            },
            connections: [],
        },
        {
            id: "926f2b2d-2d7d-484a-8984-e3dfff31c5aa",
            label: "order-management",
            version: "v1.0",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:926f2b2d-2d7d-484a-8984-e3dfff31c5aa:Orders": {
                    id: "madushagunasekara:b7d6fb00-5fb6-48fc-a14f-c68cea999e35:926f2b2d-2d7d-484a-8984-e3dfff31c5aa:Orders",
                    label: "",
                    type: "HTTP",
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
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

storiesOf("Test", module).add("Observability data and events", () => (
    <Container>
        <CellDiagram project={ComponentModel} componentMenu={componentMenu} onComponentDoubleClick={handleComponentDoubleClick} />
    </Container>
));
