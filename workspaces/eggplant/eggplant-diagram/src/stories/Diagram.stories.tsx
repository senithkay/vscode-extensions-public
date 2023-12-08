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
import {EggplantApp} from "../index";

export default {
    title: "EggplantDiagram",
    component: EggplantApp,
} as Meta;

const Template: Story = (args: any) => <EggplantApp {...args} />;

export const Simple = Template.bind({});
Simple.args = {
    model: {
        id: "SwitchBasedOnAge",
        templateId: "SwitchNode",
        inputPorts: [
            {
                id: "input1",
                type: "json",
                name: "payload",
                sender: "TransformPayload",
            },
            {
                id: "input2",
                type: "int",
                name: "baseAge",
                sender: "DerriveAgeFromDB",
            },
        ],
        outputPorts: [
            {
                id: "output1",
                type: "json",
                receiver: "ProcessSeniorCitizen",
            },
            {
                id: "output2",
                type: "json",
                receiver: "ProcessYoungCitizen",
            },
            {
                id: "outputDefault",
                type: "json",
                receiver: "ProcessDefaultCitizen",
            },
        ],
        location: {
            startLine: {
                line: 10,
                column: 5,
            },
            endLine: {
                line: 15,
                column: 5,
            },
        },
        properties: {
            templateId: "SwitchNode",
            name: "SwitchBasedOnAge",
            cases: [
                {
                    expression: "check payload.age > baseAge",
                    nodes: ["output1"],
                },
                {
                    expression: "check payload.age < baseAge",
                    nodes: ["output2"],
                },
            ],
            defaultCase: {
                nodes: ["outputDefault"],
            },
        },
    },
};
