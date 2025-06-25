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
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
    component: Toggle,
    title: "Toggle",
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
    render: () => {
        const [checked, setChecked] = React.useState(false);
        const toggleSelection = () => setChecked(!checked);
        return <Toggle checked={checked} onChange={toggleSelection} />;
    },
};
