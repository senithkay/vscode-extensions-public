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
import { Button, ButtonProps } from "./Button";
import { colors } from "../Commons/Colors";
import { Icon } from "../Icon/Icon";

const meta = {
    component: Button,
    title: "Button",
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof Button>;

export const PrimaryButton: Story = {
    args: { appearance: "primary", tooltip: "Primary Button" },
    render: (args: ButtonProps) => (
        <Button {...args}>
            <div style={{color: colors.editorForeground}}>Test</div>
        </Button>
    ),
};

export const IconButton: Story = {
    args: { appearance: "icon", tooltip: "Icon Button" },
    render: (args: ButtonProps) => (
        <Button {...args}>
            <Icon sx={{marginTop: 2, marginRight: 5}} name="ballerina"/>
            <div style={{color: colors.editorForeground}}>Test</div>
        </Button>
    ),
};
