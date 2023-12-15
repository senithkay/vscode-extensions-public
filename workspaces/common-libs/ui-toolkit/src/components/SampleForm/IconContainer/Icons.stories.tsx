/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { Icons as IconsWrapper, IconContainerProps } from "./Icons";
import { FORM_WIDTH } from "../WebAppCreation/WebAppCration";

const Template: ComponentStory<typeof IconsWrapper> = (args: IconContainerProps) => <IconsWrapper {...args} />;

export const Icons = Template.bind();
Icons.args = { sx: { width: `${FORM_WIDTH}px` } };

export default { component: Icons, title: "Sample Form" };
