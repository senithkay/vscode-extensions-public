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
import React, { Fragment, ReactNode, useEffect, useRef, useState } from 'react'

import { css, cx } from "@emotion/css";
import { Combobox, Transition } from '@headlessui/react'

// import { Dropdown } from "./Dropdown";
import styled from '@emotion/styled';
import { RequiredFormInput } from '../Commons/RequiredInput';
import { Control, Controller } from 'react-hook-form';

export interface ComboboxOptionProps {
    active?: boolean;
    display?: boolean;
}

export interface DropdownContainerProps {
    widthOffset?: number;
    dropdownWidth?: number;
    display?: boolean;
}

const ComboboxButtonContainerActive = cx(css`
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-focusBorder);
    border-bottom: 1px solid var(--vscode-focusBorder);
    border-top: 1px solid var(--vscode-focusBorder);
    border-left: 0 solid var(--vscode-focusBorder);
`);

const ComboboxButtonContainer = cx(css`
    padding-right: 5px;
    background-color: var(--vscode-input-background);
    border-right: 1px solid var(--vscode-dropdown-border);
    border-bottom: 1px solid var(--vscode-dropdown-border);
    border-top: 1px solid var(--vscode-dropdown-border);
    border-left: 0 solid var(--vscode-dropdown-border);
`);

export const DropdownIcon = cx(css`
    color: var(--vscode-symbolIcon-colorForeground);
    padding-top: 4px;
    height: 20px;
    width: 16px;
    padding-right: 8px;
`);

export const SearchableInput = cx(css`
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
    height: 24px;
    width: calc(100% - 40px);
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

const LabelContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

const ComboboxInputWrapper = styled.div`
    display: flex;
    flex-direction: row;
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

const DropdownContainer: React.FC<DropdownContainerProps> = styled.div`
    max-height: 100px;
    width: ${(props: DropdownContainerProps) => `${props.dropdownWidth}px`};
    overflow: auto;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    outline: none;
    border: 1px solid var(--vscode-list-dropBackground);
    padding-top: 5px;
    padding-bottom: 5px;
    z-index: 1;
    display: ${(props: DropdownContainerProps) => (props.display ? 'block' : 'none')};
    ul {
        margin: 0;
        padding: 0;
    }
`;

interface ContainerProps {
    sx?: React.CSSProperties;
}

export const Container = styled.div<ContainerProps>`
    width: 100%;
    ${(props: ContainerProps) => props.sx}
`;

export interface ItemComponent {
    key: string; // For searching
    item: ReactNode; // For rendering option
}

export interface AutoCompleteProps {
    id?: string;
    items: (string | ItemComponent)[];
    required?: boolean;
    label?: string;
    notItemsFoundMessage?: string;
    widthOffset?: number;
    nullable?: boolean;
    allowItemCreate?: boolean;
    sx?: React.CSSProperties;
    borderBox?: boolean;
    onValueChange?: (item: string, index?: number) => void;
    name?: string;
    value?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
} 

const ComboboxOption: React.FC<ComboboxOptionProps> = styled.div`
    position: relative;
    cursor: default;
    user-select: none;
    color: var(--vscode-editor-foreground);
    background-color: ${(props: ComboboxOptionProps) => (props.active ? 'var(--vscode-editor-selectionBackground)' :
        'var(--vscode-editor-background)')};
    list-style: none;
    display: ${(props: ComboboxOptionProps) => (props.display === undefined ? 'block' : props.display ? 'block' : 'none')};
`;

const getItemKey = (item: string | ItemComponent) => {
    if (typeof item === 'string') {
        return item;
    }
    return item.key;
}

const getItem = (item: string | ItemComponent) => {
    if (typeof item === 'string') {
        return item;
    }
    return item.item;
}


export const AutoComplete = React.forwardRef<HTMLInputElement, AutoCompleteProps>((props, ref) => {
    const { id, items, required, label, notItemsFoundMessage, widthOffset = 157, nullable, allowItemCreate = false, sx, borderBox, onValueChange, ...rest } = props;
    const [query, setQuery] = useState('');
    const [isTextFieldFocused, setIsTextFieldFocused] = useState(false);
    const [isUpButton, setIsUpButton] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number>();
    const inputRef = useRef(null);

    const handleChange = (item: string | ItemComponent) => {
        onValueChange && onValueChange(getItemKey(item));
    };
    const handleTextFieldFocused = () => {
        setIsTextFieldFocused(true);
    };
    const handleTextFieldClick = () => {
        inputRef.current?.select();
        // This is to open the dropdown when the text field is focused.
        // This is a hacky way to do it since the Combobox component does not have a prop to open the dropdown.
        document.getElementById(`autocomplete-dropdown-button-${getItemKey(items[0])}`)?.click();
        document.getElementById(props.value as string)?.focus();
    };
    const handleTextFieldOutFocused = (e: any) => {
        setIsTextFieldFocused(false);
        setIsUpButton(false);
        props.onBlur && props.onBlur(e);
    };
    const handleComboButtonClick = () => {
        setIsUpButton(!isUpButton);
    };
    const handleQueryChange = (q: string) => {
        setQuery(q);
    };

    const handleInputQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };
    const displayItemValue = (item: string | ItemComponent) => getItemKey(item);

    const filteredResults =
        query === ''
            ? items
            : items.filter(filteredItem => {
                const item = getItemKey(filteredItem);
                return item.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            });
    
    const extactMatch = items.filter(item => getItemKey(item) === query);

    const ComboboxOptionContainer = ({ active }: ComboboxOptionProps) => {
        return active ? OptionContainer : ActiveOptionContainer;
    };

    const handleAfterLeave = () => {
        handleQueryChange('');
    };

    useEffect(() => {
        setDropdownWidth(inputRef.current?.clientWidth);
    }, []);

    return (
        <Container sx={sx}>
            <Combobox value={props.value} onChange={handleChange} name={props.name} {...(nullable && { nullable })}>
                <LabelContainer>
                    <label htmlFor={id}>{label}</label>
                    {(required && label) && (<RequiredFormInput />)}
                </LabelContainer>
                <div>
                    <ComboboxInputWrapper>
                        <Combobox.Input
                            id={id}
                            ref={inputRef}
                            displayValue={displayItemValue}
                            onChange={handleInputQueryChange}
                            className={cx(SearchableInput, borderBox && cx(css`
                                height: 28px;
                            `))}
                            onFocus={handleTextFieldFocused}
                            onClick={handleTextFieldClick}
                            { ...props.name ? {...rest} : {} } // If name is not provided, then value should be empty (for react-hook-form)
                            onBlur={handleTextFieldOutFocused}
                        />
                        <Combobox.Button
                            id={`autocomplete-dropdown-button-${getItemKey(items[0])}`}
                            className={isTextFieldFocused ? ComboboxButtonContainerActive : ComboboxButtonContainer}
                        >
                            {isUpButton ? (
                                <i 
                                    className={`codicon codicon-chevron-up ${DropdownIcon}`}
                                    onClick={handleComboButtonClick}
                                    onMouseDown={(e: React.MouseEvent) => {
                                        e.preventDefault()
                                    }}
                                />
                            ) : (
                                <i
                                    className={`codicon codicon-chevron-down ${DropdownIcon}`}
                                    onClick={handleComboButtonClick}
                                    onMouseDown={(e: React.MouseEvent) => {
                                        e.preventDefault()
                                    }}
                                />
                            )}
                        </Combobox.Button>
                    </ComboboxInputWrapper>
                    <Transition
                        as={Fragment}
                        afterLeave={handleAfterLeave}
                        ref={ref}
                    >
                        <DropdownContainer display={!(filteredResults.length === 0 && query !== "" && allowItemCreate)} widthOffset={widthOffset} dropdownWidth={dropdownWidth}>
                            <Combobox.Options>
                                {filteredResults.length === 0 && query !== "" ? (
                                    allowItemCreate ? (
                                        <ComboboxOption key={0}>
                                            <Combobox.Option className={ComboboxOptionContainer} value={query} key={0}>
                                                {query}
                                            </Combobox.Option>
                                        </ComboboxOption>
                                    ) : (
                                        <NothingFound>{notItemsFoundMessage || "No options"}</NothingFound>
                                    )
                                ) : (
                                    <Fragment>
                                        {allowItemCreate && extactMatch.length === 0 && (
                                            <ComboboxOption display={false} key={0}>
                                                <Combobox.Option className={ComboboxOptionContainer} value={query} key={0}>
                                                    {query}
                                                </Combobox.Option>
                                            </ComboboxOption>
                                        )}
                                        {filteredResults.map((filteredItem: string | ItemComponent, i: number) => {
                                            const item = getItem(filteredItem);
                                            const itemKey = getItemKey(filteredItem);
                                            const offset = allowItemCreate && extactMatch.length === 0 ? 1 : 0;
                                            return (
                                                <ComboboxOption key={i + offset}>
                                                    <Combobox.Option
                                                        className={ComboboxOptionContainer}
                                                        value={itemKey}
                                                        key={i}
                                                    >
                                                        {item}
                                                    </Combobox.Option>
                                                </ComboboxOption>
                                            );
                                        })}
                                    </Fragment>
                                )}
                            </Combobox.Options>
                        </DropdownContainer>
                    </Transition>
                </div>
            </Combobox>
        </Container>
    )
});
AutoComplete.displayName = 'AutoComplete';

interface FormAutoCompleteProps {
    name: string;
    label?: string;
    control: Control<any>;
    items: string[];
    isRequired?: boolean;
    isNullable?: boolean;
}

export const FormAutoComplete: React.FC<FormAutoCompleteProps> = ({ name, control, label, items, isNullable, isRequired }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => {
                return (
                    <AutoComplete
                        items={items}
                        label={label}
                        required={isRequired}
                        nullable={isNullable}
                        value={value}
                        onValueChange={(val: string) => onChange(val)}
                    />
                );
            }}
        />
    );
};

