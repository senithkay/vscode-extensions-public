/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypeSelector as AppTypeSelector } from "./TypeSelector";

const meta = {
    component: AppTypeSelector,
    title: "Sample Form",
} satisfies Meta<typeof AppTypeSelector>;
export default meta;

type Story = StoryObj<typeof AppTypeSelector>;

const onClick = (type: string) => {
    console.log("Selected Type", type);
};

export const TypeSelector: Story = {
    args: {
        onTypeSelected: onClick,
        sx: { width: 600 }
    }
};
