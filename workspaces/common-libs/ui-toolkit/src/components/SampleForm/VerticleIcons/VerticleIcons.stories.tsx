/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerticleIcons as IconsWrapper } from "./VerticleIcons";

const meta = {
    component: IconsWrapper,
    title: "Sample Form",
} satisfies Meta<typeof IconsWrapper>;
export default meta;

type Story = StoryObj<typeof IconsWrapper>;

const onClick = (type: string) => {
    console.log("Selected Type", type);
};

export const VerticleIcons: Story = {
    args: {
        sx: { width: `1000px` },
        onClick: onClick
    }
};
