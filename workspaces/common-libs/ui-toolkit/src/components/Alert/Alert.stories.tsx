/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertProps } from "./Alert";

const meta = {
    component: Alert,
    title: "Alert",
} satisfies Meta<typeof Alert>;
export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
    args: {
        title: "Alert Title",
        subTitle: "Alert Subtitle",
        variant: "primary",
    },
    render: (args: AlertProps) => (
        <Alert {...args}>
            <div>Child components go here...</div>
        </Alert>
    ),
};

