/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { EggplantApp, Flow } from "../index";
import { action } from "@storybook/addon-actions";

export default {
    title: "EggplantDiagram",
    component: EggplantApp,
} as Meta;

const Template: Story = (args: { flowModel: Flow }) => {
    const [flowModel, setModel] = useState(args.flowModel);

    const onModelChange = (model: Flow) => {
        action("on model change")(model);
        console.log(model);
        setModel(model);
    };

    return <EggplantApp flowModel={flowModel} onModelChange={onModelChange} />;
};

export const Blank = Template.bind({});
Blank.args = {
    flowModel: {
        id: "1",
        name: "flow1",
        fileName: "path",
        nodes: [],
    },
};

const simpleModel: Flow = {
    id: "1",
    name: "flow1",
    fileName: "path",
    nodes: [
        {
            name: "A",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 4,
                    offset: 4,
                },
                end: {
                    line: 8,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [],
            outputPorts: [
                {
                    id: "ao2",
                    type: "INT",
                    receiver: "C",
                },
                {
                    id: "ao1",
                    type: "INT",
                    receiver: "B",
                },
            ],
        },
        {
            name: "B",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 10,
                    offset: 4,
                },
                end: {
                    line: 16,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [
                {
                    id: "bi1",
                    type: "INT",
                    name: "x1",
                    sender: "A",
                },
            ],
            outputPorts: [
                {
                    id: "bo1",
                    type: "INT",
                    receiver: "C",
                },
            ],
        },
        {
            name: "C",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 18,
                    offset: 4,
                },
                end: {
                    line: 21,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [
                {
                    id: "ci1",
                    type: "INT",
                    name: "x2",
                    sender: "A",
                },
                {
                    id: "ci2",
                    type: "INT",
                    name: "x3",
                    sender: "B",
                },
            ],
            outputPorts: [
                {
                    id: "co2",
                    type: "INT",
                    receiver: "D",
                },
            ],
        },
        {
            name: "D",
            templateId: "TRANSFORMER",
            codeLocation: {
                start: {
                    line: 10,
                    offset: 4,
                },
                end: {
                    line: 16,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [
                {
                    id: "di1",
                    type: "INT",
                    name: "x1",
                    sender: "C",
                },
            ],
            outputPorts: [],
        },
    ],
};

export const Simple = Template.bind({});
Simple.args = {
    flowModel: simpleModel,
};

const CodeBlockModel: Flow = {
    id: "2",
    name: "main/function",
    fileName: "code_block.bal",
    nodes: [
        {
            name: "A",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 7,
                    offset: 4,
                },
                end: {
                    line: 15,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 11,
                y: 32,
            },
            inputPorts: [],
            outputPorts: [
                {
                    id: "1",
                    type: "int",
                    name: "b",
                    receiver: "B",
                },
            ],
            codeBlock: "int b = 32;\n",
        },
        {
            name: "B",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 17,
                    offset: 4,
                },
                end: {
                    line: 28,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 32,
                y: 63,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "int",
                    name: "x",
                    sender: "A",
                },
            ],
            outputPorts: [
                {
                    id: "2",
                    type: "int",
                    name: "b",
                    receiver: "function",
                },
            ],
            codeBlock: "        int a = 32 + x;\n        int b = a % 12;\n",
        },
    ],
};
export const CodeBlock = Template.bind({});
CodeBlock.args = {
    flowModel: CodeBlockModel,
};

const SwitchModel: Flow = {
    id: "1",
    name: "main/function",
    fileName: "multi_switch.bal",
    nodes: [
        {
            name: "A",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 7,
                    offset: 4,
                },
                end: {
                    line: 15,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 0,
                y: 0,
            },
            inputPorts: [],
            outputPorts: [
                {
                    id: "1",
                    type: "INT",
                    receiver: "B",
                },
            ],
            codeBlock: "",
        },
        {
            name: "B",
            templateId: "switch",
            codeLocation: {
                start: {
                    line: 17,
                    offset: 4,
                },
                end: {
                    line: 36,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 12,
                y: 3,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "INT",
                    name: "x",
                    sender: "A",
                },
            ],
            outputPorts: [
                {
                    id: "2",
                    type: "INT",
                    name: "y",
                    receiver: "C",
                },
                {
                    id: "3",
                    type: "INT",
                    name: "y",
                    receiver: "D",
                },
                {
                    id: "4",
                    type: "INT",
                    name: "y",
                    receiver: "E",
                },
                {
                    id: "5",
                    type: "INT",
                    name: "y",
                    receiver: "F",
                },
            ],
            properties: {
                cases: [
                    {
                        expression: "x < 10",
                        nodes: ["2"],
                    },
                    {
                        expression: "x > 10 && x < 20",
                        nodes: ["3"],
                    },
                    {
                        expression: "x > 20 && x < 40",
                        nodes: ["4"],
                    },
                ],
                defaultCase: {
                    nodes: ["5"],
                },
            },
        },
        {
            name: "C",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 38,
                    offset: 4,
                },
                end: {
                    line: 46,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 10,
                y: 50,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "INT",
                    name: "x",
                    sender: "B",
                },
            ],
            outputPorts: [],
            codeBlock: "",
        },
        {
            name: "D",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 48,
                    offset: 4,
                },
                end: {
                    line: 56,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 12,
                y: 56,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "INT",
                    name: "x",
                    sender: "B",
                },
            ],
            outputPorts: [],
            codeBlock: "",
        },
        {
            name: "E",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 58,
                    offset: 4,
                },
                end: {
                    line: 66,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 13,
                y: 52,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "INT",
                    name: "y",
                    sender: "B",
                },
            ],
            outputPorts: [],
            codeBlock: "",
        },
        {
            name: "F",
            templateId: "block",
            codeLocation: {
                start: {
                    line: 68,
                    offset: 4,
                },
                end: {
                    line: 76,
                    offset: 5,
                },
            },
            canvasPosition: {
                x: 18,
                y: 32,
            },
            inputPorts: [
                {
                    id: "1",
                    type: "INT",
                    name: "y",
                    sender: "B",
                },
            ],
            outputPorts: [],
            codeBlock: "",
        },
    ],
};
export const Switch = Template.bind({});
Switch.args = {
    flowModel: SwitchModel,
};

const SampleModel: Flow = {
    id: "1",
    name: "main/function",
    fileName: "/home/jo/workspace/eggplant/demo_sample/main.bal",
    nodes: [
        {
            name: "CreatePerson",
            codeLocation: {
                start: {
                    line: 8,
                    offset: 4,
                },
                end: {
                    line: 11,
                    offset: 5,
                },
            },
            inputPorts: [],
            outputPorts: [
                {
                    id: "1",
                    type: "jo/demo_sample:0.1.0:Person",
                    name: "p",
                    receiver: "Log",
                },
            ],
        },
        {
            name: "Log",
            codeLocation: {
                start: {
                    line: 13,
                    offset: 4,
                },
                end: {
                    line: 16,
                    offset: 5,
                },
            },
            inputPorts: [
                {
                    id: "1",
                    type: "jo/demo_sample:0.1.0:Person",
                    name: "p",
                    sender: "CreatePerson",
                },
            ],
            outputPorts: [],
        },
    ],
};
export const Sample = Template.bind({});
Sample.args = {
    flowModel: SampleModel,
};
