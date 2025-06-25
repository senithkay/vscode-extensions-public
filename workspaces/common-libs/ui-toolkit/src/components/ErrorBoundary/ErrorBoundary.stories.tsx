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
import { ErrorBoundary as EB } from "./ErrorBoundary";
import { Button } from "../Button/Button";

function MyComponent() {
    const [shouldThrowError, setShouldThrowError] = useState(false);

    const handleClick = () => {
        setShouldThrowError(true);
    };

    if (shouldThrowError) {
        // This will be caught by the error boundary due to being part of the rendering phase
        throw new Error('This is an error');
    }

    return <Button onClick={handleClick}>My Component</Button>;
}

const meta = {
    component: EB,
    title: "Error Boundary",
} satisfies Meta<typeof EB>;
export default meta;

type Story = StoryObj<typeof EB>;

export const ErrorBoundary: Story = {
    args: { children: <MyComponent />, errorMsg: "An error occurred" },
};
