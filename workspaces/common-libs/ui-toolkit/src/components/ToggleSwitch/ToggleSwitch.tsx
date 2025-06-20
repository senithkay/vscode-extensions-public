/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";

interface ToggleSwitchContainerProps {
    sx?: any;
    disabled?: boolean;
}

const ToggleSwitchContainer = styled.label<ToggleSwitchContainerProps>`
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
    cursor: ${(props: ToggleSwitchContainerProps) => (props.disabled ? "not-allowed" : "pointer")};
    opacity: ${(props: ToggleSwitchContainerProps) => (props.disabled ? 0.5 : 1)};
    ${(props: ToggleSwitchContainerProps) => props.sx};
`;

const ToggleSwitchInput = styled.input`
    opacity: 0;
    width: 0;
    height: 0;
`;

interface ToggleSwitchSliderProps {
    active?: boolean;
}

const ToggleSwitchSlider = styled.span<ToggleSwitchSliderProps>`
    position: absolute;
    cursor: inherit;
    inset: 0;
    background: ${(props: ToggleSwitchSliderProps) => 
        props.active ? "var(--vscode-button-background, #0974f1)" : "var(--vscode-dropdown-border, #9fccfa)"};
    border-radius: 50px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &:before {
        position: absolute;
        content: "";
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2em;
        width: 2em;
        inset: 0;
        background-color: white;
        border-radius: 50px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform: ${(props: ToggleSwitchSliderProps) => 
        props.active ? "translateX(1.6em)" : "translateX(0)"};
    }

    &:focus {
        box-shadow: 0 0 1px var(--vscode-button-background, #0974f1);
    }
`;

export interface ToggleSwitchProps {
    id?: string;
    className?: string;
    sx?: any;
    checked: boolean;
    disabled?: boolean;
    readonly?: boolean;
    onChange: (state: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = (props: ToggleSwitchProps) => {
    const { id, className, sx, checked, disabled, readonly, onChange } = props;

    const [active, setActive] = useState(checked);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || readonly) return;
        const newState = event.target.checked;
        onChange(newState);
        setActive(newState);
    };

    return (
        <ToggleSwitchContainer
            id={id}
            className={className}
            sx={sx}
            disabled={disabled}
        >
            <ToggleSwitchInput 
                type="checkbox" 
                checked={active}
                disabled={disabled || readonly}
                onChange={handleChange}
            />
            <ToggleSwitchSlider active={active} />
        </ToggleSwitchContainer>
    );
};
