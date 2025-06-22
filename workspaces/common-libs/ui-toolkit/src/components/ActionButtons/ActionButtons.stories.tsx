/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionButtons } from "./ActionButtons";

const meta = {
    component: ActionButtons,
    title: "ActionButtons",
} satisfies Meta<typeof ActionButtons>;
export default meta;

type Story = StoryObj<typeof ActionButtons>;

export const PrimaryButton: Story = {
    args: {
        primaryButton: { tooltip: "Primary Tooltip", text: "Save", onClick: () => console.log("Primary Clicked") },
        secondaryButton: { tooltip: "Secondary Tooltip", text: "Cancel", onClick: () => console.log("Secondary Clicked") }
    }
};
