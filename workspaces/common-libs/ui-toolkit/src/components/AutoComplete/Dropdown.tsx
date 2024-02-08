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
import React, { Fragment } from 'react'

import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";
import { Combobox, Transition } from '@headlessui/react'

export interface ComboboxOptionProps {
    active?: boolean;
}

export interface DropdownContainerProps {
    widthOffset?: number;
}

const DropdownContainer: React.FC<any> = styled.div`
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
    z-index: 1;
    ul {
        margin: 0;
        padding: 0;
    }
`;

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

export interface DropdownProps {
    query: string;
    filteredResults: string[];
    notItemsFoundMessage?: string;
    widthOffset?: number;
    onQueryChange: (query: string) => void;
}

export function Dropdown(props: DropdownProps) {
    const { query, filteredResults, notItemsFoundMessage, widthOffset = 108, onQueryChange } = props;

    const handleQueryChange = (q: string) => {
        onQueryChange(q);
    };
    const ComboboxOptionContainer = ({ active }: ComboboxOptionProps) => {
        return active ? OptionContainer : ActiveOptionContainer;
    };

    const handleAfterLeave = () => {
        handleQueryChange('');
    };

    return (
        <Transition
            as={Fragment}
            afterLeave={handleAfterLeave}
        >
            <DropdownContainer widthOffset={widthOffset}>
                <Combobox.Options>
                    {filteredResults.length === 0 && query !== '' ? (
                        <NothingFound>
                            {notItemsFoundMessage || 'No options'}
                        </NothingFound>
                    ) : (
                        filteredResults.map((item: string, i: number) => {
                            return (
                                <ComboboxOption key={i}>
                                    <Combobox.Option
                                        className={ComboboxOptionContainer}
                                        value={item}
                                        key={item}
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
    )
}
