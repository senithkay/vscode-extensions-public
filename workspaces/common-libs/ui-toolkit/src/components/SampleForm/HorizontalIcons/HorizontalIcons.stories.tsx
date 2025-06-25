/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HorizontalIcons as IconsWrapper } from "./HorizontalIcons";

const meta = {
    component: IconsWrapper,
    title: "Sample Form",
} satisfies Meta<typeof IconsWrapper>;
export default meta;

type Story = StoryObj<typeof IconsWrapper>;

export const HorizontalIcons: Story = {
    args: {
        sx: { width: 800 },
        leftIconName: "ballerina",
        rightIconName: "plus",
        title: "Sample",
        description: "Sample Description"
    }
};
