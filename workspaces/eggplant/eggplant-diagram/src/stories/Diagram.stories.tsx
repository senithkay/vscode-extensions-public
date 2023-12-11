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
        setModel(model);
    };

    return <EggplantApp flowModel={flowModel} onModelChange={onModelChange} />;
};

export const Blank = Template.bind({});
Blank.args = {
    flowModel: {
        id: "1",
        name: "flow1",
        balFilename: "path",
        nodes: [],
    },
};

const simpleModel: Flow = {
    id: "1",
    name: "flow1",
    balFilename: "path",
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

const SampleModel: Flow = {
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
                    type: "INT",
                    receiver: "B",
                },
            ],
            codeBlock: "",
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
                    type: "INT",
                    name: "x",
                    sender: "A",
                },
            ],
            outputPorts: [
                {
                    id: "2",
                    type: "INT",
                    name: "b",
                    receiver: "function",
                },
            ],
            codeBlock: "        int a = 32 + x;\n        int b = a % 12;\n",
        },
    ],
};
export const Sample = Template.bind({});
Sample.args = {
    flowModel: SampleModel,
};
