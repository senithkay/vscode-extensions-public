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
    id: "dcf4efe2-9d10-462a-b29b-69df17161209",
    name: "Aquarium",
    components: [
        {
            id: "e367584f-398d-4809-93e2-a666f3ee9e82",
            label: "history",
            version: "v1.0",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:dcf4efe2-9d10-462a-b29b-69df17161209:e367584f-398d-4809-93e2-a666f3ee9e82:defaultEp": {
                    id: "madushagunasekara:dcf4efe2-9d10-462a-b29b-69df17161209:e367584f-398d-4809-93e2-a666f3ee9e82:defaultEp",
                    label: "",
                    type: "HTTP",
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
            connections: [],
        },
        {
            id: "3d51292f-076d-4c53-9a47-b6f87ed69cc7",
            label: "salesservice",
            version: "v1.1",
            type: "service",
            buildPack: "ballerina",
            services: {
                "madushagunasekara:dcf4efe2-9d10-462a-b29b-69df17161209:3d51292f-076d-4c53-9a47-b6f87ed69cc7:sales": {
                    id: "madushagunasekara:dcf4efe2-9d10-462a-b29b-69df17161209:3d51292f-076d-4c53-9a47-b6f87ed69cc7:sales",
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
                                        avgLatency: 150325186,
                                        destinationNodeId: 1,
                                        errorCount: 0,
                                        p50Latency: 9642748,
                                        p90Latency: 532982765,
                                        p99Latency: 532982765,
                                        requestCount: 7,
                                        sourceNodeId: 0,
                                    },
                                    {
                                        componentVersion: "v1.1",
                                        avgLatency: 242825819,
                                        destinationNodeId: 2,
                                        errorCount: 0,
                                        p50Latency: 4346338,
                                        p90Latency: 481305300,
                                        p99Latency: 481305300,
                                        requestCount: 2,
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
    ],
    modelVersion: "0.4.0",
};

storiesOf("Test", module).add("Observability data and events", () => (
    <Container>
        <CellDiagram project={ComponentModel} componentMenu={componentMenu} onComponentDoubleClick={handleComponentDoubleClick} />
    </Container>
));
