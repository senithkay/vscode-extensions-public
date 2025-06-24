/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Meta, StoryObj } from "@storybook/react-vite";
import { SampleReactHookForm } from "./SampleReactHookForm";

const meta: Meta<typeof SampleReactHookForm> = {
    title: "Sample React Hook Form",
    component: SampleReactHookForm,
};
export default meta;

type Story = StoryObj<typeof SampleReactHookForm>;

export const SampleReactForm: Story = {
    args: {
        id: "sample-react-form",
        args: {
            name: "WSO2",
            products: "pro2",
            address: "123, Main Street",
            isRegistered: true,
            password: "pass",
            words: "foo",
            options: "option1",
            selectedFile: "sample.txt"
        },
    },
};
