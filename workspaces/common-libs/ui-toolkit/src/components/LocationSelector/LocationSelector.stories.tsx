/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationSelector as LS } from "./LocationSelector";

const meta = {
    component: LS,
    title: "File Selector",
} satisfies Meta<typeof LS>;
export default meta;

type Story = StoryObj<typeof LS>;

const onChange = () => {
    console.log("File Selected");
};

export const FileSelector: Story = {
    args: {
        id: "File Selector",
        label: "File Selector",
        selectionText: "Please select a folder",
        btnText: "Browse Directory",
        onSelect: onChange,
        required: true
    }
};
