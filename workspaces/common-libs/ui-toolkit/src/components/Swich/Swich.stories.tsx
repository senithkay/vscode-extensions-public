/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Swich";
import { Codicon } from "../Codicon/Codicon";

const checkedIcon = <Codicon name="star-full"/>;
const unCheckedIcon = <Codicon name="star-empty"/>;

const meta: Meta<typeof Switch> = {
    component: Switch,
    title: "Swich",
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const WithIcon: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return (
            <Switch leftLabel="OFF" rightLabel="ON" checked={checked} checkedIcon={checkedIcon} uncheckedIcon={unCheckedIcon} onChange={toggleSelection}/>
        );
    },
};

export const TransitionEnabledWithIcon: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return (
            <Switch leftLabel="OFF" rightLabel="ON" checked={checked} checkedIcon={checkedIcon} uncheckedIcon={unCheckedIcon} enableTransition onChange={toggleSelection}/>
        );
    },
};

export const WithoutIcon: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return (
            <Switch leftLabel="OFF" rightLabel="ON" checked={checked} onChange={toggleSelection}/>
        );
    },
};

export const WithDifferentColor: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return (
            <Switch leftLabel="OFF" rightLabel="ON" checked={checked} checkedColor="var(--vscode-button-background)" onChange={toggleSelection}/>
        );
    },
};

export const WithDifferentColorWithIcon: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return (
            <Switch leftLabel="OFF" rightLabel="ON" checked={checked} checkedColor="var(--vscode-button-background)" checkedIcon={checkedIcon} uncheckedIcon={unCheckedIcon} onChange={toggleSelection}/>
        );
    },
};
