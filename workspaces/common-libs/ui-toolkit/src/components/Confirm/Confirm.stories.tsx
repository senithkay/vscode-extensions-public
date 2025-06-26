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
import { Confirm } from "./Confirm";
import { Button } from "../Button/Button";

const meta = {
    component: Confirm,
    title: "Confirm",
} satisfies Meta<typeof Confirm>;
export default meta;

type Story = StoryObj<typeof Confirm>;

export const ConfirmDefault: Story = {
    args: {
        message: "Modifying the output type will reset the function body. Are you sure you want to proceed?",
        confirmText: "Okay",
        anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
        },
        transformOrigin: {
            vertical: "top",
            horizontal: "left",
        },
    },
    render: args => {
        const [isOpen, setIsOpen] = useState(false);
        const [anchorEvent, setAnchorEvent] = useState<null | HTMLElement>(null);
        const openPanel = (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
            setIsOpen(true);
            setAnchorEvent(event.currentTarget as HTMLElement);
        };

        const handleConfirm = (status: boolean) => {
            console.log(status);
            setIsOpen(false);
            setAnchorEvent(null);
        };

        return (
            <>
                <Button onClick={e => openPanel(e)}> Confirm Me! </Button>
                <Confirm {...args} isOpen={isOpen} anchorEl={anchorEvent} onConfirm={handleConfirm} />
            </>
        );
    },
};
