/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import styled from "@emotion/styled";
import { ClickAwayListener } from "./ClickAwayListener";

const TextContainer = styled.div`
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    width: 200px;
`;

const meta = {
    component: ClickAwayListener,
    title: "ClickAwayListener",
} satisfies Meta<typeof ClickAwayListener>;
export default meta;

type Story = StoryObj<typeof ClickAwayListener>;

export const Example: Story = {
    render: () => {
        const [isOpen, setIsOpen] = useState(true);

        return (
            <ClickAwayListener onClickAway={() => setIsOpen(false)}>
                {isOpen && <TextContainer>Click Away</TextContainer>}
            </ClickAwayListener>
        );
    },
};
