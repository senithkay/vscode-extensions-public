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
import DiagramCanvas from "../index";

export default {
    title: "EggplantDiagram",
    component: DiagramCanvas,
} as Meta;

const Template: Story = (args: any) => <DiagramCanvas {...args} />;

export const Simple = Template.bind({});
Simple.args = {
    model: {
        nodes: [
            { name: "A", links: [{ name: "B" }, { name: "C" }] },
            { name: "B", links: [{ name: "FunctionEnd" }] },
            { name: "C", links: [{ name: "FunctionEnd" }] },
            { name: "FunctionStart", links: [{ name: "A" }] },
            { name: "FunctionEnd", links: [] },
        ],
    },
};
