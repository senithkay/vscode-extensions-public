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
import { AutoComplete, AutoCompleteProps } from "./AutoComplete";

const meta = {
    component: AutoComplete,
    title: "AutoComplete",
} satisfies Meta<typeof AutoComplete>;
export default meta;

type Story = StoryObj<typeof AutoComplete>;

export const Select: Story = {
    args: {
        id: "autoComplete",
        label: "Words",
        required: true,
        nullable: true,
        onValueChange: (value: string) => { console.log(value); },
        items: ["foo", "boo"]
    },
    render: (args: AutoCompleteProps) => (
        <div style={{ width: 300 }}>
            <AutoComplete {...args} ref={null} />
        </div>
    ),
};
