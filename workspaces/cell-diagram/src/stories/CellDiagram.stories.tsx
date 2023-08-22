import React from "react";
import { storiesOf } from "@storybook/react";
import { CellDiagram } from "./../Diagram";
import { Project } from "../types";

const getProjectModel = () => {
    const projectModel: Project = {
        id: "p1",
        name: "A",
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
                    },
                    {
                        id: "salesforce://salesforceCorporate",
                        type: "connector",
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
                    },
                    {
                        id: "ABC:B:X:basepath",
                        type: "grpc",
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
                        isExposedToInternet: false,
                    },
                },
                connections: [
                    {
                        id: "github://github",
                        type: "connector",
                    },
                ],
            },
        ],
        modelVersion: "0.4.0",
    };
    return Promise.resolve(projectModel);
};

storiesOf("CellDiagram", module).add("default", () => <CellDiagram getProjectModel={getProjectModel} />);
