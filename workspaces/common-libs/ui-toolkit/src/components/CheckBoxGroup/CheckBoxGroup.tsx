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
import React, { ComponentPropsWithRef } from "react";

export type CheckBoxProps = {
    label: string;
    value: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export type CheckBoxGroupProps = ComponentPropsWithRef<"div"> & {
    containerSx?: React.CSSProperties;
    direction?: "vertical" | "horizontal";
};

const CheckBoxContainer = styled.div<CheckBoxGroupProps>`
    display: flex;
    gap: 2px;
    flex-direction: ${({ direction }: CheckBoxGroupProps) =>
        direction ? (direction === "vertical" ? "column" : "row") : "column"};
    ${({ containerSx }: CheckBoxGroupProps) => containerSx};
`;

export const CheckBox = ({ label, value, checked, onChange }: CheckBoxProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    }

    return (
        <VSCodeCheckbox key={`checkbox-${value}`} value={value} checked={checked} onClick={handleChange}>
            {label}
        </VSCodeCheckbox>
    );
};

export const CheckBoxGroup = ({ id, className, direction, containerSx, children }: CheckBoxGroupProps) => {
    return (
        <CheckBoxContainer id={id} className={className} direction={direction} containerSx={containerSx}>
            {children}
        </CheckBoxContainer>
    );
};
