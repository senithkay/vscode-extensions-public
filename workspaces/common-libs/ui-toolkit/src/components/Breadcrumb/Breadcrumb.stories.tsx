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
import { BreadcrumbProps, Breadcrumbs } from "./Breadcrumb";
import { Codicon } from "../Codicon/Codicon";

const meta = {
    component: Breadcrumbs,
    title: "Breadcrumb",
} satisfies Meta<typeof Breadcrumbs>;
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
    args: {
        maxItems: 3,
        separator: <Codicon name="chevron-right" />,
    },
    render: (args: BreadcrumbProps) => (
        <Breadcrumbs {...args}>
            <div key={1}>Home</div>
            <div key={2}>Products</div>
            <div key={3}>Category</div>
            <div key={4}>Sub Category</div>
            <div key={5}>Product</div>
        </Breadcrumbs>
    ),
};
