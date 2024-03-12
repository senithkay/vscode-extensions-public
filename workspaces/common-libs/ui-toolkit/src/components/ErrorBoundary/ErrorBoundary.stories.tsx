/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { ErrorBoundary as EB, ErrorBoundaryProps } from "./ErrorBoundary";

const Template: ComponentStory<typeof EB> = (args: ErrorBoundaryProps) => <EB {...args} />;

export const ErrorBoundary = Template.bind();
ErrorBoundary.args = { hasError: true, errorMsg: "An error occurred. Please try again" };

export default { component: ErrorBoundary, title: "Error Boundary" };
