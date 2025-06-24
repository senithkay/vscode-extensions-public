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
import { MultiSelect as MS } from "./MultiSelect";
import { Codicon } from "../Codicon/Codicon";

const meta = {
    component: MS,
    title: "MultiSelect",
} satisfies Meta<typeof MS>;
export default meta;

type Story = StoryObj<typeof MS>;

export const MultiSelectDefault: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>(["option1", "option2"]);
        const onChangeValues = (values: string[]) => {
            setValues(values);
        };
        return (
            <MS options={["option1", "option2", "option3", "option4", "option5", "option6"]} values={values} onChange={onChangeValues} />
        );
    }
};

const displayValue = (
    <div style={{display: "flex", flexDirection: "row", height: 30}}>
        <Codicon sx={{height: 30, width: 30}} iconSx={{fontSize: 30, height: 30, width: 30}} name="globe" />
        <Codicon sx={{marginTop: 5}} name="chevron-down" iconSx={{fontWeight: 800}} />
    </div>
);

export const MultiSelectWithDisplayValue: Story = {
    render: () => {
        const [values, setValues] = useState<string[]>([]);
        const onChangeValues = (values: string[]) => {
            setValues(values);
        };
        return (
            <MS options={["option1", "option2", "option3", "option4", "option5", "option6"]} displayValue={displayValue} values={values} onChange={onChangeValues} />
        );
    }
};
