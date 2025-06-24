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
import { PullUpButton } from "./PullUPButton";
import styled from "@emotion/styled";
import { Button } from "../Button/Button";

const meta = {
    component: PullUpButton,
    title: 'PullUpButton',
} satisfies Meta<typeof PullUpButton>;
export default meta;

const Container = styled.div`
    min-height: 500px;
`;

const options = ["Option 1", "Option 2", "Option 3"];

type Story = StoryObj<typeof PullUpButton>;

export const PullDownButton: Story = {
    render: () => {
        const [, setValues] = useState<string[]>(options);
        return (
            <Container>
                <PullUpButton options={options} onOptionChange={setValues}>
                    <Button appearance={"primary"}>
                        Add More
                    </Button>
                </PullUpButton>
            </Container>
        );
    }
};

export const PullDownButtonSingleOptionStory: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>(options);
        const handleOptionChange = (options: string[]) => {
            console.log("Selected Options: ", options);
            setValues(options);
        };
        return (
            <Container>
                <PullUpButton options={options} selectSingleOption selectedOptions={values} onOptionChange={handleOptionChange}>
                    <Button appearance={"primary"}>
                        Add More
                    </Button>
                </PullUpButton>
            </Container>
        );
    }
};
