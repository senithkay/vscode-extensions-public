import React from "react";
import { storiesOf } from "@storybook/react";
import { CellDiagram } from "../Diagram";
import { Project } from "../types";
import { Container } from "./Basic.stories";
import { action } from "@storybook/addon-actions";

const simpleModel: Project = {
    id: "110ec58a-a0f2-4ac4-8393-c866d813b8d1",
    name: "A",
    components: [
        {
            id: "Users",
            version: "0.1.0",
            type: "service",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:users": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:users",
                    label: "users",
                    type: "http",
                    dependencyIds: ["ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:svc2Basepath"],
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
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:admin": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:admin",
                    label: "admin",
                    type: "http",
                    dependencyIds: ["ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:svc2Basepath", "salesforce://salesforceCorporate"],
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Members:members",
                    type: "http",
                },
            ],
        },
        {
            id: "Inventories",
            version: "0.1.1",
            type: "service",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:inventories": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:inventories",
                    label: "inventories",
                    type: "http",
                    dependencyIds: ["ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:svc2Basepath"],
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Payments:payments",
                    type: "http",
                },
                {
                    id: "mysql://mysql",
                    type: "datastore",
                    onPlatform: true,
                },
                {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:products",
                    type: "grpc",
                },
            ],
        },
        {
            id: "Payments",
            version: "0.2.0",
            type: "service",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Payments:payments": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Payments:payments",
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:users",
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
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Offers:basepath": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Offers:basepath",
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
            buildPack: "ballerina",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1",
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
                    label: "BookStore Products",
                    type: "http",
                },
            ],
        },
        {
            id: "Inventories",
            version: "0.1.0",
            type: "service",
            buildPack: "java",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:service1",
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1",
                    type: "http",
                },
            ],
        },
        {
            id: "Payments",
            version: "0.1.0",
            type: "service",
            services: {
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Payments:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Payments:service1",
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Inventories:service1",
                    type: "http",
                },
                {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:service1",
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
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:service1",
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
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Offers:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Offers:service1",
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
                "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Subscription:service1": {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Subscription:service1",
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
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Products:service1",
                    type: "http",
                },
                {
                    id: "ABC:110ec58a-a0f2-4ac4-8393-c866d813b8d1:Users:service1",
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
            label: "MySQL",
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
            label: "Twilio",
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
            label: "DynamoDB",
            type: "datastore",
            onPlatform: false,
        },
    ],
    modelVersion: "0.4.0",
};

const observationsModel: Project = {
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
                                        requestCount: 8,
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
            connections: [
                {
                    id: "ABC:A:Products:basepath",
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
                            requestCount: 1,
                            sourceNodeId: 2,
                        },
                    ],
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
                            requestCount: 1,
                            sourceNodeId: 2,
                        },
                    ],
                },
            ],
        },
        {
            id: "Products",
            label: "Product App",
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
                            requestCount: 1,
                            sourceNodeId: 2,
                        },
                    ],
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
                            requestCount: 1,
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
                                isExposed: false,
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
                            requestCount: 1,
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
                            requestCount: 1,
                            sourceNodeId: 2,
                        },
                    ],
                },
                {
                    id: "mysql://mysql",
                    label: "MySQL DB",
                    onPlatform: true,
                    type: "datastore",
                    observations: [
                        {
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

const handleComponentClick = (componentId: string) => {
    action("component clicked")(componentId);
    console.log("component clicked", componentId);
};

storiesOf("Complex", module).add("Component links", () => (
    <Container>
        <CellDiagram project={simpleModel} onComponentClick={handleComponentClick} />
    </Container>
));

storiesOf("Complex", module).add("With unused configurations", () => (
    <Container>
        <CellDiagram project={complexModel} onComponentClick={handleComponentClick} />
    </Container>
));

storiesOf("Complex", module).add("With observability data", () => (
    <Container>
        <CellDiagram project={observationsModel} onComponentClick={handleComponentClick} />
    </Container>
));
