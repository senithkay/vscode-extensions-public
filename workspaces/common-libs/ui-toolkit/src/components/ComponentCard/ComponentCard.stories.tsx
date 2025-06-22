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
import { ComponentCard } from "./ComponentCard";
import { Typography } from "../Typography/Typography";
import { Icon } from "../Icon/Icon";

const meta = {
    component: ComponentCard,
    title: "ComponentCard",
} satisfies Meta<typeof ComponentCard>;
export default meta;

type Story = StoryObj<typeof ComponentCard>;

export const EditorCard: Story = {
    args: {
        id: "Test",
        isSelected: false,
        sx: {
            display: "flex",
            height: 50,
            width: 200,
            cursor: "pointer",
            borderRadius: 5,
            alignItems: "center",
            padding: 10,
            justifyContent: "left",
            marginRight: 16,
            marginBottom: 16,
            transition: "0.3s",
            border: "1px solid var(--vscode-editor-foreground)",
            "&:hover, &.active": {
                border: "1px solid var(--vscode-focusBorder)",
                backgroundColor: "var(--vscode-pickerGroup-border)",
                ".icon svg g": {
                    fill: "var(--vscode-editor-foreground)"
                }
            }
        },
        onClick: (e: any) => { console.log(e) }
    },
    render: args => (
        <ComponentCard {...args}>
            <Icon name="ArchitectureViewIcon" sx={{marginRight: 5}} />
            <Typography variant="h4">Test Component</Typography>
        </ComponentCard>
    ),
};

export const ChoreoCard: Story = {
    args: {
        id: "Test",
        isSelected: false,
        sx: { width: 900, height: 50 },
        onClick: (e: any) => { console.log(e) }
    },
    render: args => (
        <ComponentCard {...args}>
            <Icon name="ArchitectureViewIcon" sx={{marginRight: 5}} />
            <Typography variant="h4">Test Component</Typography>
        </ComponentCard>
    ),
};
