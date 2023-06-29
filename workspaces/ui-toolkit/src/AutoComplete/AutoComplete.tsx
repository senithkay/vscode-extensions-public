/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import React, { Fragment, useEffect, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

export interface ComboboxOptionProps {
    active?: boolean;
}

const DropdownContainer = styled.div`
    position: absolute;
    max-height: 80px;
    width: calc(var(--input-min-width) + 108px);
    overflow: auto;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    outline: none;
    border: 1px solid var(--vscode-list-dropBackground);
    padding-top: 3px;
    padding-bottom: 5px;
    ul {
        margin: 0;
    }
`;

const ComboboxButtonContainer = cx(css`
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-left: 0 solid var(--vscode-dropdown-border);
`);

const ComboboxOption: React.FC<any> = styled.div`
    position: relative;
    cursor: default;
    user-select: none;
    padding-top: 2px;
    padding-left: 5px;
    padding-right: 5px;
    color: var(--vscode-editor-foreground);
    background-color: ${(props: ComboboxOptionProps) => (props.active ? 'var(--vscode-editor-selectionBackground)' : 'var(--vscode-editor-background)')}; /* Use "bg-white" class equivalent */;
    list-style: none;
    margin-left: -40px; // List here adds a default padding of 40px
`;

export const OptionContainer = cx(css`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-selectionBackground);
    list-style-type: none;
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`);

export const ActiveOptionContainer = cx(css`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
    list-style-type: none;
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`);

export const DropdownIcon = cx(css`
    color: var(--vscode-symbolIcon-colorForeground);
    padding-top: 5px;
    height: 20px;
    width: 10px;
    padding-right: 8px;
`);

export const SearchableInput = cx(css`
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
    height: 25px;
    width: 170px;
    padding-left: 8px;
    border: 1px solid var(--vscode-dropdown-border);
    &:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
`);

export const NothingFound = styled.div`
    position: relative;
    cursor: default;
    user-select: none;
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
`;

export interface AutoCompleteProps {
    items: string[];
    notItemsFoundMessage?: string;
    selectedItem?: string;
    onChange: (item: string) => void;
}

export const AutoComplete: React.FC<AutoCompleteProps> = (props: AutoCompleteProps) => {
    const { selectedItem, items, notItemsFoundMessage, onChange } = props;
    const [selected, setSelected] = useState(selectedItem);
    const [query, setQuery] = useState('');

    const handleChange = (item: string) => {
        setSelected(item);
        onChange(item);
    };


    const filteredResults =
        query === ''
            ? items
            : items.filter((item) =>
                item.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            )

    useEffect(() => {
        setSelected(selectedItem);
    }, [selectedItem]);

    return (
        <div>
            <Combobox value={selected} onChange={handleChange}>
                <div>
                    <div>
                        <Combobox.Input
                            displayValue={(item: any) => item}
                            onChange={(event) => setQuery(event.target.value)}
                            className= {SearchableInput}
                        />
                        <Combobox.Button className={ComboboxButtonContainer}>
                            <i className={`codicon codicon-chevron-down ${cx(DropdownIcon)}`} />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        afterLeave={() => setQuery('')}
                    >
                        <DropdownContainer>
                            <Combobox.Options>
                                {filteredResults.length === 0 && query !== '' ? (
                                    <NothingFound>
                                        {notItemsFoundMessage || 'Nothing found'}.
                                    </NothingFound>
                                ) : (
                                    filteredResults.map((item: string) => {
                                        return (
                                            <ComboboxOption>
                                                <Combobox.Option
                                                    className={({ active }) => active ? cx(OptionContainer) : cx(ActiveOptionContainer)}
                                                    value={item}
                                                >
                                                    {item}
                                                </Combobox.Option>
                                            </ComboboxOption>
                                        );
                                    })
                                )}
                            </Combobox.Options>
                        </DropdownContainer>
                    </Transition>
                </div>
            </Combobox>
        </div>
    )
}
