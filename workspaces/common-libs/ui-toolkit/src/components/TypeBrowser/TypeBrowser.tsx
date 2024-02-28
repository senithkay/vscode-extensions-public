/*
 *  Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'

import { css, cx } from "@emotion/css";
import { Combobox } from '@headlessui/react'

import { Dropdown } from "./Dropdown";
import styled from '@emotion/styled';
import { Codicon } from '../Codicon/Codicon';
import { Button } from '../Button/Button';
import { CommonRPCAPI, STModification } from '@wso2-enterprise/ballerina-core';

const ComboboxButtonContainerActive = cx(css`
    height: 28px;
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-focusBorder);
    border-bottom: 1px solid var(--vscode-focusBorder);
    border-top: 1px solid var(--vscode-focusBorder);
    border-left: 0 solid var(--vscode-focusBorder);
`);

const ComboboxButtonContainer = cx(css`
    height: 28px;
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-left: 0 solid var(--vscode-dropdown-border);
`);

const DropdownLabelDiv = cx(css`
    margin-bottom: 4px;
    font-family: var(--font-family);
`);

interface ContainerProps {
    sx?: React.CSSProperties;
}

const DropdownIcon = cx(css`
    color: var(--vscode-symbolIcon-colorForeground);
    padding-top: 5px;
    height: 20px;
    width: 10px;
    padding-right: 8px;
`);

const SearchableInput = cx(css`
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
    height: 24px;
    width: 80%;
    padding-left: 8px;
    border-left: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-right: 0 solid var(--vscode-dropdown-border);
    &:focus {
      outline: none;
      border-left: 1px solid var(--vscode-focusBorder);
      border-bottom: 1px solid var(--vscode-focusBorder);
      border-top: 1px solid var(--vscode-focusBorder);
      border-right: 0 solid var(--vscode-focusBorder);
    }
`);

const Container = styled.div<ContainerProps>`
    width: 100%;
    ${(props: ContainerProps) => props.sx}
`;

export interface NodePosition {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
}

export interface TypeBrowserProps {
    id?: string;
    commonRpcClient: CommonRPCAPI;
    serviceEndPosition?: NodePosition;
    label?: string;
    selectedItem?: string;
    widthOffset?: number;
    sx?: React.CSSProperties;
    borderBox?: boolean; // Enable this if the box-sizing is border-box
    onChange: (item: string, index?: number) => void;
    applyModifications?: (modifications: STModification[]) => Promise<void>;
}

export const TypeBrowser: React.FC<TypeBrowserProps> = (props: TypeBrowserProps) => {
    const { id, commonRpcClient, selectedItem, serviceEndPosition, label, widthOffset = 157, sx, borderBox, onChange, applyModifications } = props;
    const [query, setQuery] = useState('');
    const [items, setItems] = useState([]);
    const [isCleared, setIsCleared] = useState(false);
    const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
    const inputRef = useRef(null);

    const fetchTypes = async () => {
        const types = await commonRpcClient.getTypes();
        setItems(types.data?.completions.map(type => type.insertText));
    };

    useEffect(() => {
        fetchTypes();
    } , []);

    const handleCreateNewRecord = async (name: string) => {
        const source = `type ${name} readonly & record {};`;
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": source
            },
            ...serviceEndPosition
        }]);
        setQuery(name);
        fetchTypes();
    };

    const handleChange = (item: string) => {
        onChange(item);
    };
    const handleTextFieldFocused = () => {
        setIsTextFieldFocused(true);
    };
    const handleTextFieldClick = () => {
        inputRef.current?.select();
        // This is to open the dropdown when the text field is focused.
        // This is a hacky way to do it since the Combobox component does not have a prop to open the dropdown.
        document.getElementById(`autocomplete-dropdown-button-${items[0]}`)?.click();
        document.getElementById(selectedItem)?.focus();
    };
    const handleTextFieldOutFocused = () => {
        setIsCleared(false);
        setIsTextFieldFocused(false);
    };
    const handleDeleteButtonClick = () => {
        setIsCleared(true);
        setQuery('');
    };
    const handleQueryChange = (q: string) => {
        setQuery(q);
    };

    const handleInputQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsCleared(false);
        setQuery(event.target.value);
    };
    const displayItemValue = (item: string) => item;

    const filteredResults =
        query === ''
            ? items
            : items.filter(item =>
                item.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    return (
        <Container sx={sx}>
            <Combobox value={selectedItem} onChange={handleChange} nullable>
                <div className={DropdownLabelDiv}>
                    <label>{label}</label>
                </div>
                <div>
                    <div>
                        <Combobox.Input
                            id={id}
                            ref={inputRef}
                            displayValue={isCleared ? () => "" : displayItemValue}
                            onChange={handleInputQueryChange}
                            className={cx(SearchableInput, borderBox && cx(css`
                                height: 28px;
                            `))}
                            onBlur={handleTextFieldOutFocused}
                            onFocus={handleTextFieldFocused}
                            onClick={handleTextFieldClick}
                        />
                        <Combobox.Button
                            id={`autocomplete-dropdown-button-${items[0]}`}
                            className={isTextFieldFocused ? ComboboxButtonContainerActive : ComboboxButtonContainer}
                        >
                            <Button sx={{width: 20, height: 20}} appearance="icon" tooltip="Clear" onClick={handleDeleteButtonClick}>
                                <Codicon sx={{marginTop: -6, width: 8}} name="close" className={DropdownIcon} />
                            </Button>
                        </Combobox.Button>
                    </div>
                    <Dropdown
                        query={query}
                        widthOffset={widthOffset}
                        filteredResults={filteredResults}
                        onQueryChange={handleQueryChange}
                        onCreateNewRecord={handleCreateNewRecord}
                    />
                </div>
            </Combobox>
        </Container>
    )
}
