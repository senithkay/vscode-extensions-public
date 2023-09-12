import React from "react";
import { storiesOf } from "@storybook/react";
import { CellDiagram } from "../Diagram";
import { Project } from "../types";

const emptyModel: Project = {
    id: "p1",
    name: "A",
    components: [],
    modelVersion: "0.4.0",
};

const starterModel: Project = {
    id: "A",
    name: "Project A",
    components: [
        {
            id: "W",
            version: "0.2.0",
            services: {
                "ABC:A:W:basepath": {
                    id: "ABC:A:W:basepath",
                    label: "basepath",
                    type: "http",
                    dependencyIds: [],
                    isExposedToInternet: true,
                },
            },
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

const simpleModel: Project = {
    id: "A",
    name: "Project A",
    components: [
        {
            id: "X",
            version: "0.1.0",
            services: {
                "ABC:A:X:svc1Basepath": {
                    id: "ABC:A:X:svc1Basepath",
                    label: "svc1Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:X:svc2Basepath"],
                    isExposedToInternet: false,
                },
                "ABC:A:X:svc2Basepath": {
                    id: "ABC:A:X:svc2Basepath",
                    label: "svc2Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Y:svc2Basepath", "salesforce://salesforceCorporate"],
                    isExposedToInternet: false,
                },
            },
            connections: [
                {
                    id: "ABC:A:Y:svc2Basepath",
                    type: "http",
                    projectId: "A",
                    onPlatform: true,
                },
                {
                    id: "ABC:B:Y:svc2Basepath",
                    type: "http",
                    projectId: "B",
                    onPlatform: true,
                },
                {
                    id: "salesforce://salesforceCorporate",
                    type: "connector",
                    onPlatform: false,
                },
            ],
        },
        {
            id: "Y",
            version: "0.1.1",
            services: {
                "ABC:A:Y:svc1Basepath": {
                    id: "ABC:A:Y:svc1Basepath",
                    label: "svc1Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Y:svc2Basepath"],
                    isExposedToInternet: true,
                },
                "ABC:A:Y:svc2Basepath": {
                    id: "ABC:A:Y:svc2Basepath",
                    label: "svc2Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Z:basepath", "ABC:B:X:basepath"],
                    isExposedToInternet: false,
                },
            },
            connections: [
                {
                    id: "ABC:A:Z:basepath",
                    type: "http",
                    projectId: "A",
                    onPlatform: true,
                },
                {
                    id: "ABC:B:X:basepath",
                    type: "grpc",
                    onPlatform: false,
                },
            ],
        },
        {
            id: "Z",
            version: "0.2.0",
            services: {
                "ABC:A:Z:basepath": {
                    id: "ABC:A:Z:basepath",
                    label: "basepath",
                    type: "http",
                    dependencyIds: [],
                    isExposedToInternet: true,
                },
            },
            connections: [
                {
                    id: "mysql://mysql",
                    type: "connector",
                    onPlatform: true,
                },
                {
                    id: "github://github",
                    type: "connector",
                    onPlatform: false,
                },
            ],
        },
        {
            id: "W",
            version: "0.2.0",
            services: {
                "ABC:A:W:basepath": {
                    id: "ABC:A:W:basepath",
                    label: "basepath",
                    type: "http",
                    dependencyIds: [],
                    isExposedToInternet: true,
                },
            },
            connections: [],
        },
    ],
    modelVersion: "0.4.0",
};

// const complexModel: Project = {
//     id: "p1",
//     name: "A",
//     components: [
//         {
//             id: "X",
//             version: "0.1.0",
//             services: {
//                 "ABC:A:X:svc1Basepath": {
//                     id: "ABC:A:X:svc1Basepath",
//                     label: "svc1Basepath",
//                     type: "http",
//                     dependencyIds: ["ABC:A:X:svc2Basepath"],
//                     isExposedToInternet: false,
//                 },
//                 "ABC:A:X:svc2Basepath": {
//                     id: "ABC:A:X:svc2Basepath",
//                     label: "svc2Basepath",
//                     type: "http",
//                     dependencyIds: ["ABC:A:Y:svc2Basepath", "salesforce://salesforceCorporate"],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [
//                 {
//                     id: "ABC:A:Y:svc2Basepath",
//                     type: "http",
//                 },
//                 {
//                     id: "salesforce://salesforceCorporate",
//                     type: "connector",
//                 },
//                 {
//                     id: "github://github",
//                     type: "connector",
//                 },
//                 {
//                     id: "googleappssheets://googlesheet",
//                     type: "connector",
//                 },
//                 {
//                     id: "twilio://twilio",
//                     type: "connector",
//                 },
//             ],
//         },
//         {
//             id: "Y",
//             version: "0.1.1",
//             services: {
//                 "ABC:A:Y:svc1Basepath": {
//                     id: "ABC:A:Y:svc1Basepath",
//                     label: "svc1Basepath",
//                     type: "http",
//                     dependencyIds: ["ABC:A:Y:svc2Basepath"],
//                     isExposedToInternet: true,
//                 },
//                 "ABC:A:Y:svc2Basepath": {
//                     id: "ABC:A:Y:svc2Basepath",
//                     label: "svc2Basepath",
//                     type: "http",
//                     dependencyIds: ["ABC:A:Z:basepath", "ABC:B:X:basepath"],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [
//                 {
//                     id: "ABC:A:Z:basepath",
//                     type: "http",
//                 },
//                 {
//                     id: "ABC:A:Warehouses:basepath",
//                     type: "http",
//                 },
//                 {
//                     id: "ABC:B:X:basepath",
//                     type: "grpc",
//                 },
//             ],
//         },
//         {
//             id: "Z",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Z:basepath": {
//                     id: "ABC:A:Z:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: true,
//                 },
//             },
//             connections: [
//                 {
//                     id: "github://github",
//                     type: "connector",
//                 },
//                 {
//                     id: "gitlab://gitbab",
//                     type: "connector",
//                 },
//                 {
//                     id: "bitbucket://bitbucket",
//                     type: "connector",
//                 },
//             ],
//         },
//         {
//             id: "Users",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Users:basepath": {
//                     id: "ABC:A:Users:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: true,
//                 },
//             },
//             connections: [
//                 {
//                     id: "mysql://mysql",
//                     type: "connector",
//                 },
//             ],
//         },
//         {
//             id: "Products",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Products:basepath": {
//                     id: "ABC:A:Products:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: true,
//                 },
//             },
//             connections: [
//                 {
//                     id: "ABC:A:Warehouses:basepath",
//                     type: "http",
//                 },
//             ],
//         },
//         {
//             id: "Warehouses",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Warehouses:basepath": {
//                     id: "ABC:A:Warehouses:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [],
//         },
//         {
//             id: "Invoices",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Invoices:basepath": {
//                     id: "ABC:A:Invoices:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [],
//         },
//         {
//             id: "Transactions",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Transactions:basepath": {
//                     id: "ABC:A:Transactions:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [],
//         },
//         {
//             id: "Orders",
//             version: "0.2.0",
//             services: {
//                 "ABC:A:Orders:basepath": {
//                     id: "ABC:A:Orders:basepath",
//                     label: "basepath",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [],
//         },
//     ],
//     modelVersion: "0.4.0",
// };

// const shoppingComplexModel: Project = {
//     id: "ShoppingComplex",
//     name: "Shopping Complex",
//     components: [
//         {
//             id: "Billing",
//             version: "1.0.0",
//             services: {
//                 "P:ShoppingComplex:Billing:Payment": {
//                     id: "P:ShoppingComplex:Billing:Payment",
//                     label: "Payment",
//                     type: "http",
//                     dependencyIds: ["Inventory:Stock"],
//                     isExposedToInternet: true,
//                 },
//                 "P:ShoppingComplex:Billing:Invoice": {
//                     id: "P:ShoppingComplex:Billing:Invoice",
//                     label: "Invoice",
//                     type: "http",
//                     dependencyIds: ["Inventory:Stock"],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [
//                 {
//                     id: "P:ShoppingComplex:Inventory:Stock",
//                     type: "http",
//                 },
//                 {
//                     id: "paypal://paypal",
//                     type: "connector",
//                 },
//             ],
//         },
//         {
//             id: "Inventory",
//             version: "1.0.0",
//             services: {
//                 "P:ShoppingComplex:Inventory:Stock": {
//                     id: "P:ShoppingComplex:Inventory:Stock",
//                     label: "Stock",
//                     type: "grpc",
//                     dependencyIds: ["Billing:Payment", "Billing:Invoice"],
//                     isExposedToInternet: false,
//                 },
//                 "P:ShoppingComplex:Inventory:Catalog": {
//                     id: "P:ShoppingComplex:Inventory:Catalog",
//                     label: "Catalog",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: true,
//                 },
//             },
//             connections: [
//                 {
//                     id: "P:ShoppingComplex:CatalogDB:Query",
//                     type: "grpc",
//                 },
//                 {
//                     id: "P:Warehouse:CatalogDB:Query",
//                     type: "grpc",
//                 },
//             ],
//         },
//         {
//             id: "Security",
//             version: "1.0.0",
//             services: {
//                 "P:ShoppingComplex:Security:Auth": {
//                     id: "P:ShoppingComplex:Security:Auth",
//                     label: "Auth",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//                 "P:ShoppingComplex:Security:AccessControl": {
//                     id: "P:ShoppingComplex:Security:AccessControl",
//                     label: "Access Control",
//                     type: "http",
//                     dependencyIds: [],
//                     isExposedToInternet: false,
//                 },
//             },
//             connections: [
//                 {
//                     id: "Auth0://auth0",
//                     type: "connector",
//                 },
//             ],
//         },
//     ],
//     modelVersion: "0.4.0",
// };

storiesOf("Cell Diagram", module).add("Empty Model", () => <CellDiagram project={emptyModel} />);
storiesOf("Cell Diagram", module).add("Starter Model", () => <CellDiagram project={starterModel} />);
storiesOf("Cell Diagram", module).add("Simple Model", () => <CellDiagram project={simpleModel} />);
// storiesOf("Cell Diagram", module).add("Complex Model", () => <CellDiagram project={complexModel} />);
// storiesOf("Cell Diagram", module).add("Shopping Complex Model", () => <CellDiagram project={shoppingComplexModel} />);
