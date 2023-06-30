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
import React, { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { css, cx } from "@emotion/css";
import { Dropdown } from "./Dropdown";

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
    const handleQueryChange = (query: string) => {
        setQuery(query);
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
                            onChange={(event) => handleChange(event.target.value)}
                            className= {SearchableInput}
                            onBlur={handleTextFileOutFocused}
                            onFocus={handleTextFileFocused}
                        />
                        <Combobox.Button className={textFiledFocused ? ComboboxButtonContainerActive : ComboboxButtonContainer}>
                            <i className={`codicon codicon-chevron-down ${DropdownIcon}`} />
                        </Combobox.Button>
                    </div>
                    <Dropdown
                        query={query}
                        notItemsFoundMessage={notItemsFoundMessage}
                        widthOffset={widthOffset}
                        filteredResults={filteredResults}
                        onQueryChange={handleQueryChange}
                    />
                </div>
            </Combobox>
        </div>
    )
}
