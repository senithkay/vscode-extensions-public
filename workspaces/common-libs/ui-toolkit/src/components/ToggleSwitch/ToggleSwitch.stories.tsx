/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleSwitch } from "./ToggleSwitch";

const meta: Meta<typeof ToggleSwitch> = {
    component: ToggleSwitch,
    title: "ToggleSwitch",
};
export default meta;

type Story = StoryObj<typeof ToggleSwitch>;

export const Default: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return <ToggleSwitch checked={checked} onChange={toggleSelection} sx={{ fontSize: 10 }} />;
    },
};
