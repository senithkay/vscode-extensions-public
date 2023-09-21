import React from "react";
import { storiesOf } from "@storybook/react";
import { CellDiagram } from "../Diagram";
import { Project } from "../types";

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

const allComponentModel: Project = {
    id: "A",
    name: "A",
    components: [
        {
            id: "Ballerina Service",
            version: "0.2.0",
            type: "service",
            kind: "ballerina",
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
            kind: "java",
            services: {},
            connections: [],
        },
        {
            id: "Manual Task",
            version: "0.2.0",
            type: "manual-task",
            kind: "python",
            services: {},
            connections: [],
        },
        {
            id: "Api Proxy",
            version: "0.2.0",
            type: "api-proxy",
            kind: "go",
            services: {},
            connections: [],
        },
        {
            id: "Web Hook",
            version: "0.2.0",
            type: "web-hook",
            kind: "node-js",
            services: {},
            connections: [],
        },
        {
            id: "Event Handler",
            version: "0.2.0",
            type: "event-handler",
            kind: "php",
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
            kind: "ruby",
            services: {},
            connections: [],
        },
        {
            id: "Rust Service",
            version: "0.2.0",
            type: "service",
            kind: "rust",
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

const simpleModel: Project = {
    id: "110ec58a-a0f2-4ac4-8393-c866d813b8d1",
    name: "A",
    components: [
        {
            id: "Users",
            version: "0.1.0",
            type: "service",
            services: {
                "ABC:A:Users:users": {
                    id: "ABC:A:Users:users",
                    label: "users",
                    type: "http",
                    dependencyIds: ["ABC:A:Users:svc2Basepath"],
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
                "ABC:A:Users:admin": {
                    id: "ABC:A:Users:admin",
                    label: "admin",
                    type: "http",
                    dependencyIds: ["ABC:A:Inventories:svc2Basepath", "salesforce://salesforceCorporate"],
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
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
                {
                    id: "salesforce://salesforceCorporate",
                    type: "connector",
                    onPlatform: false,
                },
                {
                    id: "ABC:EStore:Members:members",
                    type: "http",
                },
            ],
        },
        {
            id: "Inventories",
            version: "0.1.1",
            type: "service",
            services: {
                "ABC:A:Inventories:inventories": {
                    id: "ABC:A:Inventories:inventories",
                    label: "inventories",
                    type: "http",
                    dependencyIds: ["ABC:A:Inventories:svc2Basepath"],
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
                    id: "ABC:A:Payments:payments",
                    type: "http",
                },
                {
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
                {
                    id: "ABC:EStore:Products:products",
                    type: "grpc",
                },
            ],
        },
        {
            id: "Payments",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:A:Payments:payments": {
                    id: "ABC:A:Payments:payments",
                    label: "payments",
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
                    id: "ABC:A:Users:users",
                    type: "http",
                    onPlatform: true,
                },
                {
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
                {
                    id: "paypal://paypal",
                    type: "connector",
                    onPlatform: false,
                },
            ],
        },
        {
            id: "Offers",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:A:Offers:basepath": {
                    id: "ABC:A:Offers:basepath",
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
                    id: "firebase://firebase",
                    type: "datastore",
                    onPlatform: false,
                },
            ],
        },
        {
            id: "Notifications",
            version: "0.2.0",
            type: "scheduled-task",
            services: {},
            connections: [],
        },
    ],
    configurations: [
        {
            id: "twilio://twilio",
            type: "connector",
            onPlatform: false,
        },
        {
            id: "paypal://paypal",
            type: "connector",
            onPlatform: false,
        },
    ],
    modelVersion: "0.4.0",
};

const complexModel: Project = {
    id: "110ec58a-a0f2-4ac4-8393-c866d813b8d1",
    name: "EStore",
    components: [
        {
            id: "Products",
            version: "0.1.0",
            type: "service",
            kind: "ballerina",
            services: {
                "ABC:EStore:Products:service1": {
                    id: "ABC:EStore:Products:service1",
                    label: "service1",
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
                    id: "ABC:BookStore:Products:Products",
                    type: "http",
                },
            ],
        },
        {
            id: "Inventories",
            version: "0.1.0",
            type: "service",
            kind: "java",
            services: {
                "ABC:EStore:Inventories:service1": {
                    id: "ABC:EStore:Inventories:service1",
                    label: "service1",
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
                    id: "ABC:EStore:Products:service1",
                    type: "http",
                },
            ],
        },
        {
            id: "Payments",
            version: "0.1.0",
            type: "service",
            services: {
                "ABC:EStore:Payments:service1": {
                    id: "ABC:EStore:Payments:service1",
                    label: "service1",
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
                    id: "ABC:EStore:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:EStore:Inventories:service1",
                    type: "http",
                },
                {
                    id: "ABC:EStore:Users:service1",
                    type: "http",
                },
                { id: "dynamoDb://dynamoDb", type: "datastore", onPlatform: false },
                {
                    id: "ABC:Audit:Checks:check",
                    type: "http",
                },
            ],
        },
        {
            id: "Users",
            version: "0.1.0",
            type: "service",
            services: {
                "ABC:EStore:Users:service1": {
                    id: "ABC:EStore:Users:service1",
                    label: "service1",
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
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
            ],
        },
        {
            id: "Offers",
            version: "0.1.0",
            type: "scheduled-task",
            services: {
                "ABC:EStore:Offers:service1": {
                    id: "ABC:EStore:Offers:service1",
                    label: "service1",
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
                    id: "twilio://twilio",
                    type: "connector",
                    onPlatform: false,
                },
                {
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
                {
                    id: "ABC:CreditCards:Offers:Offers",
                    type: "http",
                },
            ],
        },
        {
            id: "Subscription",
            version: "0.1.0",
            type: "scheduled-task",
            services: {
                "ABC:EStore:Subscription:service1": {
                    id: "ABC:EStore:Subscription:service1",
                    label: "service1",
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
            id: "Website",
            version: "0.1.0",
            type: "web-app",
            services: {},
            connections: [
                {
                    id: "ABC:EStore:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:EStore:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:EStore:Users:service1",
                    type: "http",
                },
            ],
        },
        {
            id: "Admin Portal",
            version: "0.1.0",
            type: "web-app",
            services: {},
            connections: [],
        },
    ],
    configurations: [
        {
            id: "mysql://mysql",
            type: "datastore",
            onPlatform: true,
        },
        {
            id: "mongoDb://mongoDb",
            type: "datastore",
            onPlatform: true,
        },
        {
            id: "twilio://twilio",
            type: "connector",
            onPlatform: false,
        },
        {
            id: "paypal://paypal",
            type: "connector",
            onPlatform: false,
        },
        {
            id: "dynamoDb://dynamoDb",
            type: "datastore",
            onPlatform: false,
        },
    ],
    modelVersion: "0.4.0",
};

storiesOf("Cell Diagram", module).add("No Components", () => <CellDiagram project={noComponentModel} />);
storiesOf("Cell Diagram", module).add("Single Component", () => <CellDiagram project={singleComponentModel} />);
storiesOf("Cell Diagram", module).add("Single Component with expose link", () => <CellDiagram project={singleExposedComponentModel} />);
storiesOf("Cell Diagram", module).add("All Component types", () => <CellDiagram project={allComponentModel} />);
storiesOf("Cell Diagram", module).add("Component dependencies", () => <CellDiagram project={componentDependencyModel} />);
storiesOf("Cell Diagram", module).add("Simple", () => <CellDiagram project={simpleModel} />);
storiesOf("Cell Diagram", module).add("Complex", () => <CellDiagram project={complexModel} />);
