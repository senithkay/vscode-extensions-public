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
import { Organization, Project } from "../types";
import { Container, componentMenu, handleComponentDoubleClick } from "./utils";
import { CellBounds } from "../components/Cell/CellNode/CellModel";

const noProjectsModel: Organization = {
    id: "A",
    name: "A",
    projects: [],
    modelVersion: "0.4.0",
};

const singleProjectModel: Organization = {
    id: "A",
    name: "A",
    projects: [
        {
            id: "1234",
            name: "Project A",
            components: [],
        },
    ],
    modelVersion: "0.4.0",
};

const multiProjectsModel: Organization = {
    id: "A",
    name: "A",
    projects: [
        {
            id: "1234",
            name: "Project A",
            components: [],
            connections: [
                {
                    id: "1234-5678",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "5678",
                        boundary: CellBounds.WestBound,
                    },
                },
                {
                    id: "1234-9012",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "9012",
                        boundary: CellBounds.WestBound,
                    },
                }
            ]
        },
        {
            id: "5678",
            name: "Project B",
            components: [],
        },
        {
            id: "9012",
            name: "Project C",
            components: [],
            connections: [
                {
                    id: "9012-3456",
                    source: {
                        boundary: CellBounds.SouthBound,
                    },
                    target: {
                        projectId: "3456",
                        boundary: CellBounds.NorthBound,
                    },
                }
            ]
        },
        {
            id: "3456",
            name: "Project D",
            components: [],
        }
    ],
    modelVersion: "0.4.0",
};

const multiProjectsMeshModel: Organization = {
    id: "A",
    name: "A",
    projects: [
        {
            id: "1234",
            name: "Project A",
            components: [],
            connections: [
                {
                    id: "1234-5678",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "5678",
                        boundary: CellBounds.WestBound,
                    },
                },
                {
                    id: "1234-9012",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "9012",
                        boundary: CellBounds.WestBound,
                    },
                }
            ]
        },
        {
            id: "5678",
            name: "Project B",
            components: [],
        },
        {
            id: "9012",
            name: "Project C",
            components: [],
            connections: [
                {
                    id: "9012-3456",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "3456",
                        boundary: CellBounds.WestBound,
                    },
                }
            ]
        },
        {
            id: "3456",
            name: "Project D",
            components: [],
            connections: [
                {
                    id: "3456-7890",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "7890",
                        boundary: CellBounds.WestBound,
                    },
                }
            ]
        },
        {
            id: "7890",
            name: "Project E",
            components: [],
            connections: [
                {
                    id: "7890-1234",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "1234",
                        boundary: CellBounds.WestBound,
                    },
                },
                {
                    id: "7890-5678",
                    source: {
                        boundary: CellBounds.EastBound,
                    },
                    target: {
                        projectId: "5678",
                        boundary: CellBounds.WestBound,
                    },
                }
            ]
        }
    ],
    modelVersion: "0.4.0",
};

storiesOf("Org", module).add("Empty", () => (
    <Container>
        <CellDiagram organization={noProjectsModel} />
    </Container>
));

storiesOf("Org", module).add("Single project", () => (
    <Container>
        <CellDiagram organization={singleProjectModel} />
    </Container>
));

storiesOf("Org", module).add("Multi projects", () => (
    <Container>
        <CellDiagram organization={multiProjectsModel} />
    </Container>
));

storiesOf("Org", module).add("Multi projects mesh", () => (
    <Container>
        <CellDiagram organization={multiProjectsMeshModel} />
    </Container>
));
