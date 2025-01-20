/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { Banner, BannerProps } from "./Banner";
import { Codicon } from "../Codicon/Codicon";

const Template: ComponentStory<typeof Banner> = (args: BannerProps) => <Banner {...args} />;

const Icon = () => <Codicon iconSx={{ fontSize: 20, marginTop: 2 }} name="info" />;
export const BannerWithoutTitle = Template.bind();
BannerWithoutTitle.args = { icon: <Icon />, message: "This is a sample banner without title", closeBtnSx: {marginTop: 2}, onClose: () => {console.log("Banner closed")}};

const InfoIcon = () => <Codicon iconSx={{ fontSize: 20 }} name="info" />;
export const InfoBanner = Template.bind();
InfoBanner.args = { icon: <InfoIcon />, message: "This is a sample info banner", title: "Info Banner", onClose: undefined };

const ErrorIcon = () => <Codicon iconSx={{ fontSize: 20, color: "var(--vscode-errorForeground)" }} name="error" />;
export const ErrorBanner = Template.bind();
ErrorBanner.args = { icon: <ErrorIcon />, containerSx: {color: "var(--vscode-errorForeground)"}, message: "This is a sample warning banner", title: "Warning Banner", onClose: undefined };

const SuccessIcon = () => <Codicon iconSx={{ fontSize: 20, color: "var(--vscode-statusBarItem-remoteBackground)" }} name="check" />;
export const SuccessBanner = Template.bind();
SuccessBanner.args = { icon: <SuccessIcon />, containerSx: {color: "var(--vscode-statusBarItem-remoteBackground)"}, message: "This is a sample success banner", title: "Success Banner", onClose: undefined };

const WarningIcon = () => <Codicon iconSx={{ fontSize: 20, color: "var(--vscode-editorWarning-foreground)" }} name="warning" />;
export const WarningBanner = Template.bind();
WarningBanner.args = { icon: <WarningIcon />, containerSx: {color: "var(--vscode-editorWarning-foreground)"}, message: "This is a sample warning banner", title: "Warning Banner", onClose: undefined };

export default { component: Banner, title: "Banner" };
