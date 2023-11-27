/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { CellDiagram, CellDiagramProps } from "../Diagram";
import { Container, componentMenu, handleComponentDoubleClick } from "./utils";

const Diagram = (args: CellDiagramProps) => (
    <Container>
        <CellDiagram {...args} />
    </Container>
)

const meta: Meta<typeof Diagram> = {
    title: "Cell Diagram",
    component: Diagram,
    args: {
        animation: true,
        showControls: true,
        componentMenu: componentMenu,
        onComponentDoubleClick: handleComponentDoubleClick,
    },
};

export default meta;

type Story = StoryObj<typeof Diagram>;

export const Primary: Story = {
    args: {
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
    },
};

export const Primary: Story = {
    args: {
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
    },
};
