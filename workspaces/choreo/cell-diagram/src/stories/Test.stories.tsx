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
import { Container } from "./utils";

export default {
    title: "Cell Diagram",
    component: CellDiagram,
};

export const Simple: Story = (args: CellDiagramProps) => (
    <Container>
        <CellDiagram {...args} />
    </Container>
);

Simple.args = {
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
