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
import React, { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";

export interface ComboboxOptionProps {
    active?: boolean;
}

export interface DropdownContainerProps {
    widthOffset?: number;
}

const DropdownContainer:React.FC<any> = styled.div`
    position: absolute;
    max-height: 100px;
    width: ${(props: DropdownContainerProps) => `calc(var(--input-min-width) + ${props.widthOffset}px)`};
    overflow: auto;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    outline: none;
    border: 1px solid var(--vscode-list-dropBackground);
    padding-top: 5px;
    padding-bottom: 5px;
    ul {
        margin: 0;
        padding: 0;
    }
`;

const ComboboxButtonContainerActive = cx(css`
    position: absolute;
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-focusBorder);
    border-bottom: 1px solid var(--vscode-focusBorder);
    border-top: 1px solid var(--vscode-focusBorder);
    border-left: 0 solid var(--vscode-focusBorder);
`);

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
    color: var(--vscode-editor-foreground);
    background-color: ${(props: ComboboxOptionProps) => (props.active ? 'var(--vscode-editor-selectionBackground)' :
            'var(--vscode-editor-background)')};
    list-style: none;
`;

export const OptionContainer = cx(css`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-selectionBackground);
    padding: 3px 5px 3px 5px;
    list-style-type: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
`);

export const ActiveOptionContainer = cx(css`
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
    list-style-type: none;
    padding: 3px 5px 3px 5px;
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

export const NothingFound = styled.div`
    position: relative;
    cursor: default;
    user-select: none;
    padding-left: 8px;
    color: var(--vscode-editor-foreground);
    background-color: var(--vscode-editor-background);
`;

export interface Item {
    value: string;
    id: number;
}

export interface AutoCompleteProps {
    items: Item[];
    notItemsFoundMessage?: string;
    selectedItem?: string;
    widthOffset?: number;
    onChange: (item: string, index?: number) => void;
}

export const AutoComplete: React.FC<AutoCompleteProps> = (props: AutoCompleteProps) => {
    const { selectedItem, items, notItemsFoundMessage, widthOffset = 108 , onChange } = props;
    const [query, setQuery] = useState('');
    const [textFiledFocused, setTextFiledFocused] = useState(false);

    const handleChange = (item: string) => {
        onChange(item);
    };
    const handleTextFileFocused = () => {
        setTextFiledFocused(true);
    };
    const handleTextFileOutFocused = () => {
        setTextFiledFocused(false);
    };

    const filteredResults =
        query === ''
            ? items
            : items.filter((item) =>
                item.value.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    return (
        <div>
            <Combobox value={selectedItem} onChange={handleChange}>
                <div>
                    <div>
                        <Combobox.Input
                            displayValue={(item: string) => item}
                            onChange={(event) => setQuery(event.target.value)}
                            className= {SearchableInput}
                            onBlur={handleTextFileOutFocused}
                            onFocus={handleTextFileFocused}
                        />
                        <Combobox.Button className={textFiledFocused ? ComboboxButtonContainerActive : ComboboxButtonContainer}>
                            <i className={`codicon codicon-chevron-down ${DropdownIcon}`} />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        afterLeave={() => setQuery('')}
                    >
                        <DropdownContainer widthOffset={widthOffset}>
                            <Combobox.Options>
                                {filteredResults.length === 0 && query !== '' ? (
                                    <NothingFound>
                                        {notItemsFoundMessage || 'No options'}
                                    </NothingFound>
                                ) : (
                                    filteredResults.map((item: Item) => {
                                        return (
                                            <ComboboxOption>
                                                <Combobox.Option
                                                    className={({ active }) => active ?
                                                        OptionContainer : ActiveOptionContainer}
                                                    value={item.value}
                                                >
                                                    {item.value}
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
