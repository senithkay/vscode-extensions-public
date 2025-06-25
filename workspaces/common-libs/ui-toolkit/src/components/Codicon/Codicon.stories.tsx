/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Codicon } from "./Codicon";

const meta = {
    component: Codicon,
    title: "Codicon",
} satisfies Meta<typeof Codicon>;
export default meta;

type Story = StoryObj<typeof Codicon>;

export const SampleIcon: Story = {
    args: { name: "add" },
};
