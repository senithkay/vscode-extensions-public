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

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Text = styled.div`
    border: 1px solid black;
    padding: 10px;
`;

const Template: ComponentStory<typeof Tooltip> = (args: TooltipProps) =>
    <Container>
        <Tooltip {...args}>
            <Text>Hover Over Me</Text>
        </Tooltip>
    </Container>
;

export const TooltipText = Template.bind();
TooltipText.args = { content: "Tooltip Content", position: "bottom" };

export default { component: Tooltip, title: "Tooltip" };
