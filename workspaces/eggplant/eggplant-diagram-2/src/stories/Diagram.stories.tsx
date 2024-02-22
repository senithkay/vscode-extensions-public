import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

const resourceModel: any = {
    nodes: [
        {
            kind: "EVENT_HTTP_API",
            label: "HTTP API Event",
            method: {
                key: "method",
                type: null,
                value: "GET",
                typeKind: "IDENTIFIER",
            },
            path: {
                key: "path",
                type: null,
                value: "/search/doctors/[string name]",
                typeKind: "URI_PATH",
            },
            id: "1",
            lineRange: {
                fileName: "",
                startLine: [7, 7],
                endLine: [15, 6],
            },
            fixed: true,
        },
        {
            kind: "IF",
            label: "If",
            condition: {
                key: "condition",
                type: "boolean",
                value: 'name == "kandy"',
                typeKind: "BTYPE",
            },
            thenBranch: [
                {
                    label: "HTTP GET",
                    kind: "HTTP_API_GET_CALL",
                    client: {
                        key: "client",
                        type: "http:Client",
                        value: "asiri",
                        typeKind: "BTYPE",
                    },
                    path: {
                        key: "path",
                        type: "string",
                        value: "/doctors/kandy",
                        typeKind: "BTYPE",
                    },
                    headers: {
                        key: "headers",
                        type: "map<string|string[]>?",
                        typeKind: "BTYPE",
                        optional: true,
                    },
                    targetType: {
                        key: "targetType",
                        type: "Response|anydata",
                        value: "json",
                        typeKind: "BTYPE",
                    },
                    params: {
                        key: "params",
                        type: "http:QueryParamType",
                        value: [],
                        optional: true,
                    },
                    variable: {
                        key: "j",
                        type: "json",
                        typeKind: "BTYPE",
                    },
                    id: "3",
                    lineRange: {
                        fileName: "",
                        startLine: [9, 13],
                        endLine: [9, 57],
                    },
                },
                {
                    expr: {
                        key: "expression",
                        type: "json",
                        value: "j",
                        typeKind: "BTYPE",
                    },
                    kind: "RETURN",
                    returning: true,
                    id: "5",
                    lineRange: {
                        fileName: "",
                        startLine: [10, 13],
                        endLine: [10, 22],
                    },
                },
            ],
            elseBranch: [
                {
                    label: "HTTP GET",
                    kind: "HTTP_API_GET_CALL",
                    client: {
                        key: "client",
                        type: "http:Client",
                        value: "nawaloka",
                        typeKind: "BTYPE",
                    },
                    path: {
                        key: "path",
                        type: "string",
                        value: "/doctors",
                        typeKind: "BTYPE",
                    },
                    headers: {
                        key: "headers",
                        type: "map<string|string[]>?",
                        typeKind: "BTYPE",
                        optional: true,
                    },
                    targetType: {
                        key: "targetType",
                        type: "Response|anydata",
                        value: "json",
                        typeKind: "BTYPE",
                    },
                    params: {
                        key: "params",
                        type: "http:QueryParamType",
                        value: [],
                        optional: true,
                    },
                    variable: {
                        key: "j",
                        type: "json",
                        typeKind: "BTYPE",
                    },
                    id: "4",
                    lineRange: {
                        fileName: "",
                        startLine: [12, 13],
                        endLine: [12, 60],
                    },
                },
                {
                    expr: {
                        key: "expression",
                        type: "json",
                        value: "j",
                        typeKind: "BTYPE",
                    },
                    kind: "RETURN",
                    returning: true,
                    id: "6",
                    lineRange: {
                        fileName: "",
                        startLine: [13, 13],
                        endLine: [13, 22],
                    },
                },
            ],
            id: "2",
            lineRange: {
                fileName: "",
                startLine: [8, 9],
                endLine: [14, 10],
            },
        },
    ],
    name: "",
};

export default {
    title: "Example/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    model: resourceModel,
};
