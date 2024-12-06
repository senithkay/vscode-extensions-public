/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import React, { ComponentPropsWithRef, ReactNode } from "react";
import { Control, Controller } from "react-hook-form";

const Directions = {
    vertical: "vertical",
    horizontal: "horizontal",
} as const;

export type CheckBoxProps = {
    label: string;
    labelAdornment?: ReactNode;
    value?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export type CheckBoxGroupProps = ComponentPropsWithRef<"div"> & {
    columns?: number;
    containerSx?: React.CSSProperties;
    direction?: (typeof Directions)[keyof typeof Directions];
};

const CheckBoxContainer = styled.div<CheckBoxGroupProps>`
    display: grid;
    ${({ columns, direction }: CheckBoxGroupProps) =>
        direction === Directions.vertical
            ? `grid-template-columns: repeat(${columns}, auto);
        column-gap: 5%;
        grid-auto-flow: row dense;`
            : `grid-template-rows: repeat(${columns}, auto);
        row-gap: 5%;
        grid-auto-flow: column dense;`}
    ${({ containerSx }: CheckBoxGroupProps) => containerSx};
`;

export const StyledCheckBox = styled(VSCodeCheckbox)`
    --checkbox-border: var(--vscode-icon-foreground);
    display: flex;
    align-items: center; // Center vertically
`;

const LabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;
export const CheckBox = ({ label, labelAdornment, value, checked, onChange }: CheckBoxProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <StyledCheckBox key={`checkbox-${value}`} value={value} checked={checked} onClick={handleChange}>
            <LabelContainer>
                <div style={{ color: "var(--vscode-editor-foreground)" }}>
                    <label htmlFor={`${label}`}>{label}</label>
                </div>
                {labelAdornment && labelAdornment}
            </LabelContainer>
        </StyledCheckBox>
    );
};


interface FormCheckBoxProps {
    name: string;
    label?: string;
    labelAdornment?: ReactNode;
    control: Control<any>;
}

export const FormCheckBox: React.FC<FormCheckBoxProps> = ({ name, control, label, labelAdornment }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value: checked } }) => {
                return (
                    <CheckBox
                        label={label}
                        labelAdornment={labelAdornment}
                        checked={checked}
                        onChange={onChange}
                    />
                );
            }}
        />
    );
};

export const CheckBoxGroup = ({
    id,
    className,
    columns = 1,
    direction = Directions.vertical,
    containerSx,
    children,
}: CheckBoxGroupProps) => {
    return (
        <CheckBoxContainer
            id={id}
            className={className}
            columns={columns}
            direction={direction}
            containerSx={containerSx}
        >
            {children}
        </CheckBoxContainer>
    );
};
