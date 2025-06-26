/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from "./Badge";

const meta = {
    component: Badge,
    title: "Badge",
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof Badge>;

export const InformationalBadge: Story = {
    args: { color: "#6C757D", children: "100" }
};

export const SuccessfulBadge: Story = {
    args: { color: "#28A745", children: "200" }
};

export const RedirectionBadge: Story = {
    args: { color: "#007aff", children: "200" }
};

export const ClientErrorBadge: Story = {
    args: { color: "#FFC107", children: "200" }
};

export const ServerErrorBadge: Story = {
    args: { color: "#f93E3E", children: "500" }
};
