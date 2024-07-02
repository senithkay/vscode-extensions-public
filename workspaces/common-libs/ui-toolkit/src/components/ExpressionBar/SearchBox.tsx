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
import { ExpressionBarProps, ItemType } from './ExpressionBar';
import { debounce } from 'lodash';
import { createPortal } from 'react-dom';
import { addClosingBracketIfNeeded, getExpressionInfo, filterItems, setCursor } from './utils';

// Types
type StyleBase = {
    sx?: React.CSSProperties;
};

type DropdownProps = StyleBase & {
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

type SyntaxElProps = StyleBase &
    SyntaxProps & {
        onClose: () => void;
    };

// Styles
const Container = styled.div`
    width: 100%;
    position: relative;
    display: flex;
`;

const DropdownContainer = styled.div<StyleBase>`
    position: absolute;
    width: 350px;
    padding-top: 8px;
    border-radius: 8px;
    background-color: var(--vscode-dropdown-background);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
    ${(props: StyleBase) => props.sx}
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
    padding: 8px 4px;
    gap: 4px;
`;

const DropdownFooterSection = styled.div`
    display: flex;
    align-items: center;
`;

const DropdownFooterText = styled.p`
    margin: 0;
    font-size: 12px;
`;

const DropdownFooterKey = styled.p`
    margin: 0;
    font-size: 10px;
    font-weight: 800;
`;

const KeyContainer = styled.div`
    padding: 2px;
    margin-inline: 4px;
    border-radius: 2px;
    border: 1px solid var(--vscode-editorWidget-border);
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
            <Typography variant="body3" sx={{ fontWeight: 600 }}>
                {item.label}
            </Typography>
            <Typography id="description" variant="body3">
                {item.description}
            </Typography>
        </DropdownItemContainer>
    );
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const { items, onItemSelect, onClose, sx } = props;
    const listBoxRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => listBoxRef.current);

    return (
        <DropdownContainer sx={sx}>
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
                <DropdownFooterSection>
                    <KeyContainer>
                        <Codicon
                            name="arrow-small-up"
                            sx={{ display: 'flex', height: '12px', width: '12px' }}
                            iconSx={{
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        />
                    </KeyContainer>
                    <DropdownFooterText>,</DropdownFooterText>
                    <KeyContainer>
                        <Codicon
                            name="arrow-small-down"
                            sx={{ display: 'flex', height: '12px', width: '12px' }}
                            iconSx={{
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        />
                    </KeyContainer>
                    <DropdownFooterText>to navigate.</DropdownFooterText>
                </DropdownFooterSection>
                <DropdownFooterSection>
                    <KeyContainer>
                        <DropdownFooterKey>TAB</DropdownFooterKey>
                    </KeyContainer>
                    <DropdownFooterText>to select.</DropdownFooterText>
                </DropdownFooterSection>
                <DropdownFooterSection>
                    <KeyContainer>
                        <DropdownFooterKey>ENTER</DropdownFooterKey>
                    </KeyContainer>
                    <DropdownFooterText>to save.</DropdownFooterText>
                </DropdownFooterSection>
            </DropdownFooter>
        </DropdownContainer>
    );
});
Dropdown.displayName = 'Dropdown';

const SyntaxEl = (props: SyntaxElProps) => {
    const { item, currentArgIndex, onClose, sx } = props;

    return (
        <>
            {item && (
                <DropdownContainer sx={sx}>
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
                        <Typography variant="body3" sx={{ fontWeight: 600 }}>
                            {`${item.label}(`}
                        </Typography>
                        {item.args?.map((arg, index) => {
                            const lastArg = index === item.args.length - 1;
                            if (index === currentArgIndex) {
                                return (
                                    <Fragment key={`arg-${index}`}>
                                        <SelectedArg>{arg}</SelectedArg>
                                        {!lastArg && <Typography variant="body3">{`, `}</Typography>}
                                    </Fragment>
                                );
                            }
                            return (
                                <Typography key={`arg-${index}`} variant="body3">
                                    {`${arg}${lastArg ? '' : ', '}`}
                                </Typography>
                            );
                        })}
                        <Typography variant="body3">{`)`}</Typography>
                    </SyntaxBody>
                </DropdownContainer>
            )}
        </>
    );
};

export const ExpressionEditor = forwardRef<HTMLInputElement, ExpressionBarProps>((props, ref) => {
    const { items, maxItems = 10, value, sx, onChange, onSave, onItemSelect, ...rest } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listBoxRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>();
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [selectedItem, setSelectedItem] = useState<ItemType | undefined>();
    const [syntax, setSyntax] = useState<SyntaxProps | undefined>();
    const SUGGESTION_REGEX = {
        prefix: /[+-/*=]\s*(\w*)$/,
        suffix: /^(\w*)/
    };

    useImperativeHandle(ref, () => inputRef.current);

    const handleResize = debounce(() => {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.top + rect.height,
                left: rect.left
            });
        }
    }, 200);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementRef]);

    const getSuggestions = (text: string) => {
        setSyntax(undefined);
        const cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
            .selectionStart;
        const prefixMatches = text.substring(0, cursorPosition).match(SUGGESTION_REGEX.prefix);
        if (prefixMatches) {
            const suffixMatches = text.substring(cursorPosition).match(SUGGESTION_REGEX.suffix);
            if (suffixMatches) {
                setFilteredItems(filterItems(items, prefixMatches[1] + suffixMatches[1], maxItems));
            } else {
                setFilteredItems(filterItems(items, prefixMatches[1], maxItems));
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
        const inputArgsCount = currentFnContent.trim().split(',').length;
        if (item?.args) {
            if (inputArgsCount <= item.args.length) {
                setSyntax({ item: item, currentArgIndex: inputArgsCount - 1 });
                return;
            }
            // Multiple arguments (ex: ...numbers)
            const isMultiArgFn = item.args[item.args.length - 1].match(/^\.{3}\w+$/);
            if (isMultiArgFn) {
                setSyntax({ item: item, currentArgIndex: item.args.length - 1 });
                return;
            }
        }
    };

    const handleChange = (text: string, cursorPosition?: number, selectedItem?: ItemType) => {
        if (text.trim().startsWith('=')) {
            // Check whether the cursor is inside a function
            const { isCursorInFunction, currentFnContent } = getExpressionInfo(text, cursorPosition);
            if (isCursorInFunction) {
                setFilteredItems([]);
                updateSyntax(currentFnContent, selectedItem);
            } else {
                getSuggestions(text);
            }
        } else {
            setFilteredItems([]);
        }
        onChange(text);
    };

    const handleItemSelect = (item: ItemType) => {
        const cursorPosition = (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
            .selectionStart;
        const prefixMatches = value.substring(0, cursorPosition).match(SUGGESTION_REGEX.prefix);
        const suffixMatches = value.substring(cursorPosition).match(SUGGESTION_REGEX.suffix);
        const prefix = value.substring(0, cursorPosition - prefixMatches[1].length);
        let suffix = value.substring(cursorPosition + suffixMatches[1].length);
        if (suffix.startsWith('(')) {
            suffix = suffix.substring(1);
        }
        const newCursorPosition = prefix.length + item.label.length + 1;
        const newTextValue = prefix + item.label + '(' + suffix;
        onItemSelect && onItemSelect(item, newTextValue);
        handleChange(newTextValue, newCursorPosition, item);
        setCursor(inputRef, newCursorPosition);
    };

    const handleDropdownClose = () => {
        setFilteredItems([]);
    };

    const handleFunctionSyntaxClose = () => {
        setSyntax(undefined);
    };

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
        if (listBoxRef.current) {
            const hoveredEl = listBoxRef.current.querySelector('.hovered');
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    handleDropdownClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
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
                    break;
                case 'ArrowUp':
                    e.preventDefault();
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
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (hoveredEl) {
                        const item = filteredItems.find(
                            (item: ItemType) => item.label === hoveredEl.firstChild.textContent
                        );
                        if (item) {
                            handleItemSelect(item);
                        }
                    }
                    break;
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const { updatedText: valueWithClosingBracket, cursorPosition } = addClosingBracketIfNeeded(inputRef, value);
            handleChange(valueWithClosingBracket, cursorPosition);
            onSave && onSave(valueWithClosingBracket);
            setFilteredItems([]);
            setSyntax(undefined);
        }
    };

    return (
        <Container ref={elementRef}>
            <TextField
                ref={inputRef}
                value={value}
                onTextChange={handleChange}
                onKeyDown={handleInputKeyDown}
                sx={{ width: '100%', ...sx }}
                {...rest}
            />
            {inputRef &&
                createPortal(
                    <>
                        <Transition show={filteredItems.length > 0} {...ANIMATION}>
                            <Dropdown
                                ref={listBoxRef}
                                items={filteredItems}
                                onItemSelect={handleItemSelect}
                                onClose={handleDropdownClose}
                                sx={{ ...dropdownPosition }}
                            />
                        </Transition>
                        <Transition show={!!syntax?.item} {...ANIMATION}>
                            <SyntaxEl
                                item={syntax?.item}
                                currentArgIndex={syntax?.currentArgIndex ?? 0}
                                onClose={handleFunctionSyntaxClose}
                                sx={{ ...dropdownPosition }}
                            />
                        </Transition>
                    </>,
                    document.body
                )}
        </Container>
    );
});
ExpressionEditor.displayName = 'ExpressionEditor';

