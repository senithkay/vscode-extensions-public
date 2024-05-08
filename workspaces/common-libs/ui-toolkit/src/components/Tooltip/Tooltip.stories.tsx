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
import { Tooltip, TooltipProps } from "./Tooltip";
import styled from "@emotion/styled";

const Text = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90vw;
    height: 90vh;
    padding: 10px;
    border: 1px solid black;
`;

const TooltipContent = styled.div`
    width: 200px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Content = () => <TooltipContent>Tooltip Content</TooltipContent>;

const Template: ComponentStory<typeof Tooltip> = (args: TooltipProps) =>
    <Tooltip {...args}>
        <Text>Hover Over Me</Text>
    </Tooltip>
;

export const TooltipText = Template.bind();
TooltipText.args = { content: <Content />, position: "bottom" };

export default { component: Tooltip, title: "Tooltip" };
