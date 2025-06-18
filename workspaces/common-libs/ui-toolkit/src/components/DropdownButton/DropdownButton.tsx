/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState, useRef, useEffect, ReactNode } from "react";
import styled from "@emotion/styled";
import { Button } from "../Button/Button";
import { Codicon } from "../Codicon/Codicon";
import { Divider } from "../Divider/Divider";

const DropdownButtonContainer = styled.div<{ sx?: any }>`
    display: inline-block;
    position: relative;
    ${(props: { sx?: any }) => props.sx || {}}
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
`;

const DropdownContent = styled.div<{ minWidth?: number, sx?: any }>`
    display: block;
    position: absolute;
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-editor-snippetFinalTabstopHighlightBorder);
    min-width: ${(props: { minWidth?: number }) => props.minWidth ? `${props.minWidth}px` : '120px'};
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 3333;
    border-radius: 4px;
    padding: 8px 2px;
    ${(props: { sx?: any }) => props.sx || {}}
`;

const DropdownItem = styled.div<{ noGap ?: boolean, sx?: any }>`
    display: flex;
    flex-direction: row;
    padding: 8px 2px;
    margin: 0 4px;
    gap: ${(props: { noGap?: boolean }) => props.noGap ? '0' : '8px'};
    cursor: pointer;
    color: var(--vscode-editor-foregound);
    &:hover {
        background-color: var(--vscode-quickInput-background);
    }
`;

const OptionsButton = styled.div<{ sx?: any, height?: number }>`
    display: flex;
    padding: 0 4px;
    align-items: center;
    justify-content: center;
    height: ${(props: { height?: number }) => props.height ? `${props.height + 4}px` : '20px'};
    border-left: 1px solid var(--vscode-checkbox-border);
    border-right: 1px solid var(--button-border);
    border-radius: 4px;
    border-top-left-radius: unset;
    border-bottom-left-radius: unset;
    background: var(--vscode-button-secondaryBackground);
    cursor: "pointer";
    &:hover {
        background-color: var(--vscode-button-secondaryHoverBackground);
    }
    ${(props: { sx?: any }) => props.sx || {}}
`;
    

export interface DropdownOption {
    content: ReactNode | string;
    value: string;
}

export interface DropdownButtonProps {
    buttonContent: string | ReactNode;
    selecteOption: string;
    options: DropdownOption[];
    dropDownAlign?: "top" | "bottom";
    tooltip?: string;
    iconName?: string;
    sx?: any;
    iconSx?: any;
    buttonSx?: any;
    optionButtonSx?: any;
    dropdownSx?: any;
    selectIconSx?: any;
    onOptionChange: (value: string) => void;
    onClick: (selectedOption: string) => void;
}

export const DropdownButton: React.FC<DropdownButtonProps> = (props: DropdownButtonProps) => {
    const { buttonContent, selecteOption, dropDownAlign = "bottom", tooltip, options, iconName, sx,
        buttonSx, iconSx, optionButtonSx, onOptionChange, dropdownSx: dropDownSx, selectIconSx, onClick 
    } = props;
    const [open, setOpen] = useState(false);
    const [buttonWidth, setButtonWidth] = useState<number>(0);
    const [buttonHeight, setButtonHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);
    const secondaryBtnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (secondaryBtnRef.current) {
            setButtonWidth(secondaryBtnRef.current.offsetWidth);
            setButtonHeight(secondaryBtnRef.current.offsetHeight);
        }
    }, [buttonContent]);

    // Dynamic positioning based on dropDownAlign
    let dropdownStyle: React.CSSProperties = {};
    switch (dropDownAlign) {
        case "top":
            dropdownStyle = { bottom: 'calc(100% + 4px)' };
            break;
        case "bottom":
        default:
            dropdownStyle = { top: 'calc(100% + 4px)' };
            break;
    }

    return (
        <DropdownButtonContainer ref={ref} style={sx}>
            <ButtonContainer>
                <div ref={secondaryBtnRef}>
                    <Button
                        tooltip={tooltip}
                        buttonSx={{
                            // border: "1px solid var(--vscode-editor-snippetFinalTabstopHighlightBorder)",
                            borderTopRightRadius: 'unset',
                            borderBottomRightRadius: 'unset',
                            ...buttonSx
                        }}
                        appearance="secondary"
                        onClick={() => {
                            setOpen(false);
                            onClick(selecteOption);
                        }}
                    >
                        {buttonContent}
                    </Button>
                </div>
                <OptionsButton sx={optionButtonSx} onClick={() => setOpen(!open)} height={buttonHeight}>
                    <Codicon sx={{ color: "var(--button-secondary-foreground)", ...iconSx }} iconSx={iconSx} name={iconName || "chevron-down"} />
                </OptionsButton>
                {open && (
                    <DropdownContent minWidth={buttonWidth + 30} style={dropdownStyle} sx={dropDownSx}>
                        {options.map((option, idx) => (
                            <div key={option.value}>
                                <DropdownItem
                                    noGap={selectIconSx ? true : false}
                                    onClick={() => {
                                        setOpen(false);
                                        onOptionChange?.(option.value);
                                    }}
                                >
                                    {selecteOption === option.value ? (
                                        <Codicon sx={selectIconSx} iconSx={{width: 16}} name="check" />
                                    ) : (
                                    // Empty span with same width as Codicon for alignment
                                        <span style={{ display: "inline-block", width: selectIconSx ? 25 : 22 }} />
                                    )}
                                    {option.content}
                                </DropdownItem>
                                {idx < options.length - 1 && <Divider sx={{margin: '0 12px', 'border-top': '1px solid var(--vscode-editorWidget-border)'}}/>}
                            </div>
                        ))}
                    </DropdownContent>
                )}
            </ButtonContainer>
        </DropdownButtonContainer>
    );
};
