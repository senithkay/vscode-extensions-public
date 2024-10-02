/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useRef } from "react";
import styled from "@emotion/styled";
import { Codicon } from "../Codicon/Codicon";
import { CheckBox } from "../CheckBoxGroup/CheckBoxGroup";
import { createPortal } from "react-dom";
import { Overlay } from "../Commons/Overlay";

interface MultiSelectContainerProps {
    sx?: any;
}

const MultiSelectContainer = styled.div<MultiSelectContainerProps>`
    ${(props: MultiSelectContainerProps) => props.sx};
`;

interface ContainerProps {
    isOpen: boolean;
    hasDisplayValue?: boolean;
    dropdownSx?: any;
}

const ValueContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: flex-start;
    cursor: pointer;
    background-color: var(--vscode-background);
    margin-top: 4px;
    flex-wrap: wrap;
    border: 1px solid var(--vscode-dropdown-border);
    border-bottom: ${(props: ContainerProps) => (props.hasDisplayValue ? "none" : "1px solid var(--vscode-dropdown-border)")};
    border-color: ${(props: ContainerProps) => (props.isOpen ? "var(--vscode-focusBorder)" : "var(--vscode-dropdown-border)")};
    padding: 4px;
    width: 100%;
`;

const Chip = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
    padding: 4px;
    background-color: var(--vscode-dropdown-border);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 4px;
    color: var(--vscode-dropdown-foreground);
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
`;

const Dropdown = styled.div<ContainerProps>`
    display: flex;
    flex-direction: column;
    position: absolute;
    width: fit-content;
    z-index: 1001;
    background-color: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-dropdown-border);
    border-color: ${(props: ContainerProps) => (props.isOpen ? "var(--vscode-focusBorder)" : "var(--vscode-dropdown-border)")};
    padding: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    padding-left: 10px;
    ${(props: ContainerProps) => props.dropdownSx};
`;

// Add a placeholder
const Placeholder = styled.div`
    color: var(--vscode-input-placeholderForeground);
    font-size: 12px;
    font-weight: 400;
    padding: 4px;
    cursor: pointer;
`;

export interface MultiSelectProps {
    id?: string;
    className?: string;
    displayValue?: ReactNode;
    options: string[]; // Available options
    values?: string[]; // Selected values
    placeholder?: string;
    sx?: any;
    iconSx?: any;
    dropdownSx?: any;
    onChange?: (values: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = (props: MultiSelectProps) => {
    const { id, className, values, placeholder, displayValue, options, sx, dropdownSx } = props;
    const [isComponentOpen, setIsComponentOpen] = React.useState(false);
    const [valueContainerPosition, setValueContainerPosition] = React.useState<DOMRect | null>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Reference to the container
    const valueContainerRef = useRef<HTMLDivElement>(null); // Reference to the value container

    const handleComponentClick = () => {
        setValueContainerPosition(valueContainerRef.current?.getBoundingClientRect());
        setIsComponentOpen(!isComponentOpen);
    };

    const handleDropdownClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent click from bubbling up to the container
    };

    const handleChange = (option: string, checked: boolean) => {
        let newValues = [...values];
        if (checked) {
            newValues.push(option);
        } else {
            newValues = newValues.filter(value => value !== option);
        }
        props.onChange && props.onChange(newValues);
    };

    const handleCloseComponent = () => {
        setIsComponentOpen(false);
    };

    return (
        <MultiSelectContainer ref={containerRef} id={id} className={className} sx={sx}>
            {displayValue ? <div ref={valueContainerRef} onClick={handleComponentClick}>{displayValue}</div> : (
                <ValueContainer ref={valueContainerRef} isOpen={isComponentOpen}>
                    {values?.length > 0 ? (
                        values.map((value, key) => (
                            <Chip key={key}>{value}</Chip>
                        ))
                    ) : (
                        <Placeholder>{placeholder}</Placeholder>
                    )}
                    <Codicon sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", marginTop: 4 }} name="chevron-down" onClick={handleComponentClick} />
                </ValueContainer>
            )}
            {isComponentOpen &&
                <>
                    {createPortal(
                        <Dropdown
                            dropdownSx={dropdownSx}
                            isOpen={isComponentOpen}
                            onClick={handleDropdownClick}
                            style={{
                                top: (window.innerHeight - valueContainerPosition?.bottom < 200) ? 
                                    valueContainerPosition?.top - 200 : valueContainerPosition?.bottom,
                                left: valueContainerPosition?.left,
                            }}
                        >
                            {options.map((option, key) => (
                                <CheckBox
                                    key={key}
                                    label={option}
                                    checked={(values?.length > 0) ? (values.indexOf(option) !== -1) : false}
                                    onChange={isSelected => handleChange(option, isSelected)}
                                />
                            ))}
                        </Dropdown>
                        , document.body
                    )}
                    <>
                        {isComponentOpen && <Overlay onClose={handleCloseComponent} />}
                    </>
                </>
            }
        </MultiSelectContainer>
    );
};
