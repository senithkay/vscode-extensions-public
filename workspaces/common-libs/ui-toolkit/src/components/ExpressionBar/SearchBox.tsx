/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextField } from '../TextField/TextField';
import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import { css } from '@emotion/css';
import { Typography } from '../Typography/Typography';
import { Codicon } from '../Codicon/Codicon';

// Types
export type ItemType = {
    label: string;
    description: string;
    args?: string[];
};

type ExpressionEditorProps = {
    autoFocus?: boolean;
    items: ItemType[];
    maxItems?: number;
    value: string;
    sx?: React.CSSProperties;
    input?: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
};

type DropdownProps = {
    items: ItemType[];
    onItemSelect: (item: ItemType) => void;
    onClose: () => void;
};

type DropdownItemProps = {
    item: ItemType;
    firstItem?: boolean;
    onClick: () => void;
};

type SyntaxProps = {
    item: ItemType;
    currentArgIndex: number;
};

type SyntaxElProps = SyntaxProps & {
    onClose: () => void;
};

// Styles
const Container = styled.div`
    width: 100%;
    position: relative;
    display: flex;
`;

const DropdownContainer = styled.div`
    position: absolute;
    width: 350px;
    top: 100%;
    left: 0;
    padding: 8px 0;
    border-radius: 8px;
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
`;

const DropdownItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px;
    cursor: pointer;

    & > #description {
        display: none;
    }

    &.hovered {
        background-color: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
    }

    &.hovered > #description {
        display: block;
    }
`;

const Divider = styled.div`
    height: 1px;
    background-color: var(--vscode-editorWidget-border);
`;

const DropdownFooter = styled.div`
    display: flex;
    padding: 4px 0;
`;

const SyntaxBody = styled.div`
    display: flex;
    align-items: center;
    padding-inline: 16px;
    margin: 0;
`;

const SelectedArg = styled(Typography)`
    background-color: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
    font-weight: 600;
    padding-inline: 4px;
    margin-inline: 2px;
    border-radius: 4px;
`;

const ANIMATION = {
    enter: css({
        transition: 'all 0.3s ease-in'
    }),
    enterFrom: css({
        opacity: 0
    }),
    enterTo: css({
        opacity: 1
    }),
    leave: css({
        transition: 'all 0.15s ease-out'
    }),
    leaveFrom: css({
        opacity: 1
    }),
    leaveTo: css({
        opacity: 0
    })
};

const DropdownItem = (props: DropdownItemProps) => {
    const { item, firstItem, onClick } = props;
    const itemRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        const parentEl = itemRef.current.parentElement;
        const hoveredEl = parentEl.querySelector('.hovered');
        if (hoveredEl) {
            hoveredEl.classList.remove('hovered');
        }
        itemRef.current.classList.add('hovered');
    };

    return (
        <DropdownItemContainer
            ref={itemRef}
            {...(firstItem && { className: 'hovered' })}
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
        >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.label}
            </Typography>
            <Typography id="description" variant="body3">
                {item.description}
            </Typography>
        </DropdownItemContainer>
    );
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const { items, onItemSelect, onClose } = props;
    const listBoxRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => listBoxRef.current);

    return (
        <DropdownContainer>
            <Codicon
                sx={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '16px',
                    margin: '-4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--vscode-activityBar-background)',
                    zIndex: '5'
                }}
                iconSx={{ color: 'var(--vscode-activityBar-foreground)' }}
                name="close"
                onClick={onClose}
            />
            <div ref={listBoxRef}>
                {items.map((item, index) => {
                    return (
                        <DropdownItem
                            key={`dropdown-item-${index}`}
                            {...(index === 0 && { firstItem: true })}
                            item={item}
                            onClick={() => onItemSelect(item)}
                        />
                    );
                })}
            </div>
            <Divider />
            <DropdownFooter>
                <Codicon name="arrow-small-up" />
                <Typography variant="body2">,</Typography>
                <Codicon name="arrow-small-down" />
                <Typography variant="body2">to navigate.</Typography>
                <Typography variant="body2" sx={{ marginLeft: '4px' }}>
                    ENTER to select.
                </Typography>
            </DropdownFooter>
        </DropdownContainer>
    );
});
Dropdown.displayName = 'Dropdown';

const SyntaxEl = (props: SyntaxElProps) => {
    const { item, currentArgIndex, onClose } = props;

    return (
        <>
            {item && (
                <DropdownContainer>
                    <Codicon
                        sx={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '16px',
                            margin: '-4px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--vscode-activityBar-background)',
                            zIndex: '5'
                        }}
                        iconSx={{ color: 'var(--vscode-activityBar-foreground)' }}
                        name="close"
                        onClick={onClose}
                    />
                    <SyntaxBody>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {`${item.label}(`}
                        </Typography>
                        {item.args?.map((arg, index) => {
                            const lastArg = index === item.args.length - 1;
                            if (index === currentArgIndex) {
                                return (
                                    <Fragment key={`arg-${index}`}>
                                        <SelectedArg>{arg}</SelectedArg>
                                        {!lastArg && (
                                            <Typography variant="body2">
                                                {`, `}
                                            </Typography>
                                        )}
                                    </Fragment>
                                );
                            }
                            return (
                                <Typography key={`arg-${index}`} variant="body2">
                                    {`${arg}${lastArg ? '' : ', '}`}
                                </Typography>
                            );
                        })}
                        <Typography variant="body2">{`)`}</Typography>
                    </SyntaxBody>
                </DropdownContainer>
            )}
        </>
    );
};

export const ExpressionEditor = (props: ExpressionEditorProps) => {
    const { items, maxItems = 10, value, input, sx, onChange, ...rest } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const listBoxRef = useRef<HTMLDivElement>(null);
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [selectedItem, setSelectedItem] = useState<ItemType | undefined>();
    const [syntax, setSyntax] = useState<SyntaxProps | undefined>();
    const [valuePrefix, setValuePrefix] = useState<string>('');
    const suggestionRegex = {
        prefix: /[+-/*=]\s*(\w*)$/,
        suffix: /^(\w*)/
    };

    const filterItems = (items: ItemType[], text: string) => {
        const filtered = items.filter((item: ItemType) => item.label.toLowerCase().includes(text.toLowerCase()));
        return filtered.sort((a, b) => a.label.length - b.label.length).slice(0, maxItems);
    };

    const checkCursorInFunction = (text: string, newCursorPosition?: number) => {
        let cursorPosition;
        if (newCursorPosition) {
            cursorPosition = newCursorPosition;
        } else {
            cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement).selectionStart;
        }
        const openBrackets = text.substring(0, cursorPosition).match(/\(/g);
        const closeBrackets = text.substring(0, cursorPosition).match(/\)/g);
        const isCursorInFunction = !!(openBrackets && openBrackets.length > (closeBrackets?.length ?? 0));

        let currentFnContent;
        if (isCursorInFunction) {
            const openBracketIndex = text.substring(0, cursorPosition).lastIndexOf('(');
            currentFnContent = text.substring(openBracketIndex + 1, cursorPosition);
        }
        return { isCursorInFunction, currentFnContent };
    };

    const getSuggestions = (text: string) => {
        setSyntax(undefined);
        const cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
            .selectionStart;
        const prefixMatches = text.substring(0, cursorPosition).match(suggestionRegex.prefix);
        if (prefixMatches) {
            const suffixMatches = text.substring(cursorPosition).match(suggestionRegex.suffix);
            if (suffixMatches) {
                setFilteredItems(filterItems(items, prefixMatches[1] + suffixMatches[1]));
            } else {
                setFilteredItems(filterItems(items, prefixMatches[1]));
            }
        } else {
            setFilteredItems([]);
        }
    };

    const updateSyntax = (currentFnContent: string, newSelectedItem?: ItemType) => {
        if (newSelectedItem) {
            setSelectedItem(newSelectedItem);
        }
        const item = newSelectedItem ?? selectedItem;
        if (item?.args) {
            const inputArgsCount = currentFnContent.trim().split(',').length;
            if (inputArgsCount <= item.args.length) {
                return setSyntax({ item: item, currentArgIndex: inputArgsCount - 1 });
            }
            const isMultiArgFn = item.args[item.args.length - 1].match(/^\[\w+,\s*\.{3}]$/);
            if (isMultiArgFn) {
                return setSyntax({ item: item, currentArgIndex: item.args.length - 1 });
            }
        }
    };

    const setCursor = (position: number) => {
        inputRef.current.focus();
        (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement).setSelectionRange(
            position,
            position
        );
    };

    const handleChange = (text: string, cursorPosition?: number, selectedItem?: ItemType) => {
        if (text.trim().startsWith('=')) {
            const matches = text.match(/^(\s*=\s*)(.*)$/);
            if (matches[1] !== valuePrefix) {
                setValuePrefix(matches[1]);
            }
            // Check whether the cursor is inside a function
            const { isCursorInFunction, currentFnContent } = checkCursorInFunction(text, cursorPosition);
            if (isCursorInFunction) {
                setFilteredItems([]);
                updateSyntax(currentFnContent, selectedItem);
            } else {
                getSuggestions(text);
            }
            onChange(matches[2]);
        } else {
            if (valuePrefix) {
                setValuePrefix('');
            }
            onChange(text);
            setFilteredItems([]);
        }
    };

    const handleItemSelect = (item: ItemType) => {
        const rawValue = valuePrefix + value;
        const cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
            .selectionStart;
        const prefixMatches = rawValue.substring(0, cursorPosition).match(suggestionRegex.prefix);
        const suffixMatches = rawValue.substring(cursorPosition).match(suggestionRegex.suffix);
        const prefix = rawValue.substring(0, cursorPosition - prefixMatches[1].length);
        let suffix = rawValue.substring(cursorPosition + suffixMatches[1].length);
        if (suffix.startsWith('(')) {
            suffix = suffix.substring(1);
        }
        const newCursorPosition = prefix.length + item.label.length + 1;
        handleChange(prefix + item.label + '(' + suffix, newCursorPosition, item);
        setCursor(newCursorPosition);
    };

    const handleDropdownClose = () => {
        setFilteredItems([]);
    };

    const handleFunctionSyntaxClose = () => {
        setSyntax(undefined);
    };

    const handleOnInput = (input: string) => {
        const rawValue = valuePrefix + value;
        const cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
            .selectionStart;
        const newValue = rawValue.substring(0, cursorPosition) + input + rawValue.substring(cursorPosition);
        handleChange(newValue);
    };

    useEffect(() => {
        if (input) {
            handleOnInput(input);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input]);

    useEffect(() => {
        const handleFocus = () => {
            if (value.trim().startsWith('=')) {
                getSuggestions(value);
            }
        };

        if (inputRef) {
            inputRef.current.addEventListener('focus', handleFocus);
        }

        const currentRef = inputRef.current;
        return () => {
            if (inputRef) {
                currentRef.removeEventListener('focus', handleFocus);
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputRef]);

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleDropdownClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const hoveredEl = listBoxRef.current.querySelector('.hovered');
            if (hoveredEl) {
                hoveredEl.classList.remove('hovered');
                const nextEl = hoveredEl.nextElementSibling as HTMLElement;
                if (nextEl) {
                    nextEl.classList.add('hovered');
                } else {
                    const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                    if (firstEl) {
                        firstEl.classList.add('hovered');
                    }
                }
            } else {
                const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.classList.add('hovered');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const hoveredEl = listBoxRef.current.querySelector('.hovered');
            if (hoveredEl) {
                hoveredEl.classList.remove('hovered');
                const prevEl = hoveredEl.previousElementSibling as HTMLElement;
                if (prevEl) {
                    prevEl.classList.add('hovered');
                } else {
                    const lastEl = listBoxRef.current.lastElementChild as HTMLElement;
                    if (lastEl) {
                        lastEl.classList.add('hovered');
                    }
                }
            } else {
                const lastEl = listBoxRef.current.lastElementChild as HTMLElement;
                if (lastEl) {
                    lastEl.classList.add('hovered');
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const hoveredEl = listBoxRef.current.querySelector('.hovered');
            if (hoveredEl) {
                const item = filteredItems.find((item: ItemType) => item.label === hoveredEl.firstChild.textContent);
                if (item) {
                    handleItemSelect(item);
                }
            }
        }
    };

    return (
        <Container>
            <TextField
                ref={inputRef}
                value={valuePrefix + value}
                onTextChange={handleChange}
                onKeyDown={handleInputKeyDown}
                placeholder='Prefix "=" to use functions.'
                sx={{ width: '100%', ...sx }}
                {...rest}
            />
            {inputRef && (
                <>
                    <Transition show={filteredItems.length > 0} {...ANIMATION}>
                        <Dropdown
                            ref={listBoxRef}
                            items={filteredItems}
                            onItemSelect={handleItemSelect}
                            onClose={handleDropdownClose}
                        />
                    </Transition>
                    <Transition show={!!syntax?.item} {...ANIMATION}>
                        <SyntaxEl
                            item={syntax?.item}
                            currentArgIndex={syntax?.currentArgIndex ?? 0}
                            onClose={handleFunctionSyntaxClose}
                        />
                    </Transition>
                </>
            )}
        </Container>
    );
};

