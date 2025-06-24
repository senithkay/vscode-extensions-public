/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from "./Banner";
import { Codicon } from "../Codicon/Codicon";

const meta = {
    component: Banner,
    title: "Banner",
} satisfies Meta<typeof Banner>;
export default meta;

type Story = StoryObj<typeof Banner>;

export const BannerWithoutTitle: Story = {
    args: {
        icon: <Codicon iconSx={{ fontSize: 18 }} name="info" />, 
        message: "This is a sample banner without title",
        onClose: () => {console.log("Banner closed")}
    }
};

export const InfoBanner: Story = {
    args: {
        icon: <Codicon iconSx={{ fontSize: 18 }} name="info" />, 
        type: "info",
        message: "This is a sample info banner"
    }
};

export const ErrorBanner: Story = {
    args: {
        icon: <Codicon iconSx={{ fontSize: 18 }} name="error" />, 
        type: "error",
        message: "This is a sample error banner",
        title: "Error Banner"
    }
};

export const SuccessBanner: Story = {
    args: {
        icon: <Codicon iconSx={{ fontSize: 18 }} name="check" />, 
        type: "success",
        message: "This is a sample success banner",
        title: "Success Banner",
        onClose: undefined
    }
};

export const WarningBanner: Story = {
    args: {
        icon: <Codicon iconSx={{ fontSize: 18 }} name="warning" />, 
        type: "warning",
        message: "This is a sample warning banner",
        title: "Warning Banner",
        onClose: undefined
    }
};
