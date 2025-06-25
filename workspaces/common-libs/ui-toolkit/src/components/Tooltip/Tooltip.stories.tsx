/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import styled from "@emotion/styled";

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const TextContainer = styled.div`
    border: 1px solid black;
    padding: 10px;
`;

const LargeTextContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90vw;
    height: 90vh;
    border: 1px solid black;
`;

const LargeTooltipContent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 100px;
`;

const meta: Meta<typeof Tooltip> = {
    component: Tooltip,
    title: "Tooltip",
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
    render: args =>
        <Container>
            <Tooltip {...args}>
                <TextContainer>Hover Over Me</TextContainer>
            </Tooltip>
        </Container>,
    args: { content: "Tooltip Content", position: "bottom" },
};

export const TooltipWithOffset: Story = {
    render: args =>
        <Container>
            <Tooltip {...args}>
                <TextContainer>Hover Over Me</TextContainer>
            </Tooltip>
        </Container>,
    args: { content: "Tooltip Content", position: "bottom", offset: { top: 16, left: 20 } },
};

const TooltipContent = () => <LargeTooltipContent>Tooltip Content</LargeTooltipContent>;

export const Overflow: Story = {
    render: args =>
        <Tooltip {...args}>
            <LargeTextContainer>Hover Over Me</LargeTextContainer>
        </Tooltip>,
    args: { content: <TooltipContent />, position: "bottom" },
};
