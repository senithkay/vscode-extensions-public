/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";

const meta = {
    component: Dialog,
    title: "Dialog",
} satisfies Meta<typeof Dialog>;
export default meta;

type Story = StoryObj<typeof Dialog>;

export const DialogBox: Story = {
    render: () => {
        const [isOpen, setIsOpen] = useState(false);
        const openDialog = () => {
            setIsOpen(!isOpen);
        };
        const handleOnClose = () => {
            setIsOpen(false);
            console.log("Dialog Closed");
        };
        return (
            <>
                <Button appearance="primary" onClick={openDialog}> Dialog </Button>
                <Dialog isOpen={isOpen} onClose={handleOnClose}>
                    Hello World
                </Dialog>
            </>
        );
    },
};
