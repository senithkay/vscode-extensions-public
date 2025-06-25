/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from "./Dropdown";

const meta = {
    component: Dropdown,
    title: "Dropdown",
} satisfies Meta<typeof Dropdown>;
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Select: Story = {
    args: {
        id: "drop-down",
        label: "Test Dropdown",
        isLoading: false,
        value: "",
        items: [
            { id: "option-1", content: "Option 1", value: "op1" },
            { id: "option-2", content: "Option 2", value: "op2" },
            { id: "option-3", content: "Option 3", value: "op3" }
        ],
        description: "Test",
        onValueChange: (value: string) => { console.log(value); },
        errorMsg: "Error",
        disabled: false,
        isRequired: true
    },
    render: args => (
        <div style={{width: 300}}>
            <Dropdown {...args} ref={undefined}/>
        </div>
    ),
};
