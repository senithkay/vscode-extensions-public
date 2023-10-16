import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import styled from "@emotion/styled";
import { CellDiagram } from "../Diagram";
import { Project } from "../types";
import { MenuItem } from "../components";

export const Container = styled.div`
    height: calc(100vh - 50px);
    width: calc(100vw - 40px);
`;

export const componentMenu: MenuItem[] = [
    { label: "Go to source", callback: (id) => action("Go to source menu item clicked")(id) },
    { label: "Observe", callback: (id) => action("Observe menu item clicked")(id) },
];

const noComponentModel: Project = {
    id: "A",
    name: "A",
    components: [],
    modelVersion: "0.4.0",
};

const singleComponentModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "User Service",
            version: "0.2.0",
            type: "service",
            services: {},
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

const singleExposedComponentModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "Users",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:A:Users:basepath": {
                    id: "ABC:A:Users:basepath",
                    label: "basepath",
                    type: "http",
                    dependencyIds: [],
                    deploymentMetadata: {
                        gateways: {
                            internet: {
                                isExposed: true,
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
                    id: "madusha:B:C:endpoint1",
                    onPlatform: true,
                },
                {
                    id: "dynamoDb://dynamoDb",
                    onPlatform: false,
                    type: "datastore",
                },
            ],
        },
    ],
    modelVersion: "0.4.0",
};

const allComponentModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "Ballerina Service",
            version: "0.2.0",
            type: "service",
            buildPack: "ballerina",
            services: {},
            connections: [],
        },
        {
            id: "Wep App",
            version: "0.2.0",
            type: "web-app",
            services: {},
            connections: [],
        },
        {
            id: "Scheduled Task ABCDEFGHT",
            version: "0.2.0",
            type: "scheduled-task",
            buildPack: "java",
            services: {},
            connections: [],
        },
        {
            id: "Manual Task",
            version: "0.2.0",
            type: "manual-task",
            buildPack: "python",
            services: {},
            connections: [],
        },
        {
            id: "Api Proxy",
            version: "0.2.0",
            type: "api-proxy",
            buildPack: "go",
            services: {},
            connections: [],
        },
        {
            id: "Web Hook",
            version: "0.2.0",
            type: "web-hook",
            buildPack: "node-js",
            services: {},
            connections: [],
        },
        {
            id: "Event Handler",
            version: "0.2.0",
            type: "event-handler",
            buildPack: "php",
            services: {},
            connections: [],
        },
        {
            id: "Test",
            version: "0.2.0",
            type: "test",
            services: {},
            connections: [],
        },
        {
            id: "Ruby Service",
            version: "0.2.0",
            type: "service",
            buildPack: "ruby",
            services: {},
            connections: [],
        },
        {
            id: "Rust Service",
            version: "0.2.0",
            type: "service",
            buildPack: "rust",
            services: {},
            connections: [],
        },
        {
            id: "Docker Service",
            version: "0.2.0",
            type: "service",
            buildPack: "docker",
            services: {},
            connections: [],
        },
        {
            id: "XYZ Service",
            version: "0.2.0",
            type: "service",
            buildPack: "xyz",
            services: {},
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

const componentDependencyModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "Users",
            version: "0.2.0",
            type: "api-proxy",
            services: {
                "ABC:A:Users:basepath": {
                    id: "ABC:A:Users:basepath",
                    label: "basepath",
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
            connections: [],
        },
        {
            id: "Courses",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:A:Courses:basepath": {
                    id: "ABC:A:Courses:basepath",
                    label: "basepath",
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
                    id: "ABC:A:Users:basepath",
                    type: "http",
                },
                {
                    id: "ABC:A:Task",
                    type: "http",
                },
            ],
        },
        {
            id: "Task",
            version: "0.2.0",
            type: "manual-task",
            services: {},
            connections: [
                {
                    id: "ABC:A:WebApp",
                    type: "http",
                },
            ],
        },
        {
            id: "WebApp",
            version: "0.2.0",
            type: "web-app",
            services: {},
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

const unlinkConfigurationModel: Project = {
    id: "A",
    name: "A",
    components: [],
    configurations: [
        {
            id: "twilio://twilio",
            type: "connector",
            onPlatform: false,
        },
        {
            id: "paypal://paypal",
            label: "Paypal",
            type: "connector",
            onPlatform: false,
        },
    ],
    modelVersion: "0.4.0",
};

const observabilityModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "Users",
            version: "0.2.0",
            type: "api-proxy",
            services: {
                "ABC:A:Users:basepath": {
                    id: "ABC:A:Users:basepath",
                    label: "basepath",
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
            connections: [],
        },
        {
            id: "Courses",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:A:Courses:basepath": {
                    id: "ABC:A:Courses:basepath",
                    label: "basepath",
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
                    id: "ABC:A:Users:basepath",
                    type: "http",
                    observations: [
                        {
                            version: "0.2.0",
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
                },
            ],
        },
    ],
    modelVersion: "0.4.0",
};

export const handleComponentDoubleClick = (componentId: string) => {
    action("component double clicked")(componentId);
};

storiesOf("Basic", module).add("Empty cell", () => (
    <Container>
        <CellDiagram project={noComponentModel} />
    </Container>
));

storiesOf("Basic", module).add("Single component", () => (
    <Container>
        <CellDiagram project={singleComponentModel} />
    </Container>
));

storiesOf("Basic", module).add("Single component with expose link", () => (
    <Container>
        <CellDiagram project={singleExposedComponentModel} />
    </Container>
));

storiesOf("Basic", module).add("All component types", () => (
    <Container>
        <CellDiagram project={allComponentModel} />
    </Container>
));

storiesOf("Basic", module).add("Component dependencies", () => (
    <Container>
        <CellDiagram project={componentDependencyModel} />
    </Container>
));

storiesOf("Basic", module).add("Project configurations", () => (
    <Container>
        <CellDiagram project={unlinkConfigurationModel} />
    </Container>
));

storiesOf("Basic", module).add("Observability data and events", () => (
    <Container>
        <CellDiagram project={observabilityModel} componentMenu={componentMenu} onComponentDoubleClick={handleComponentDoubleClick} />
    </Container>
));
