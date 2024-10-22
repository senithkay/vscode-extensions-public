/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, Fragment, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextField } from '../TextField/TextField';
import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import { css } from '@emotion/css';
import { Typography } from '../Typography/Typography';
import { Codicon } from '../Codicon/Codicon';
import { ExpressionBarProps, CompletionItem, ExpressionBarRef } from './ExpressionBar';
import { throttle } from 'lodash';
import { createPortal } from 'react-dom';
import { addClosingBracketIfNeeded, checkCursorInFunction, getIcon,setCursor } from './utils';
import { VSCodeTag } from '@vscode/webview-ui-toolkit/react';
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator';

// Types
type StyleBase = {
    sx?: React.CSSProperties;
};

type DropdownProps = StyleBase & {
    items: CompletionItem[];
    showDefaultCompletion?: boolean;
    getDefaultCompletion?: () => ReactNode;
    isSavable: boolean;
    onCompletionSelect: (item: CompletionItem) => void | Promise<void>;
    onDefaultCompletionSelect: () => void | Promise<void>;
};

type DefaultCompletionItemProps = {
    getDefaultCompletion: () => ReactNode;
    onClick: () => void |Promise<void>;
}

type DropdownItemProps = {
    item: CompletionItem;
    firstItem?: boolean;
    onClick: () => void | Promise<void>;
};

type FnSignatureProps = {
    label: string;
    args: string[];
    currentArgIndex: number;
};

type FnSignatureElProps = StyleBase & FnSignatureProps;

// Styles
const Container = styled.div`
    width: 100%;
    position: relative;
    display: flex;
`;

const StyledTextField = styled(TextField)`
    ::part(control) {
        font-family: monospace;
        font-size: 12px;
    }
`;

const StyledTag = styled(VSCodeTag)`
    ::part(control) {
        text-transform: none;
        font-size: 10px;
        height: 16px;
    }
`;

const DropdownContainer = styled.div<StyleBase>`
    position: absolute;
    z-index: 10000;
    ${(props: StyleBase) => props.sx}
`;

const DropdownBody = styled.div<StyleBase>`
    width: 350px;
    margin-block: 2px;
    padding-top: 8px;
    border-radius: 8px;
    background-color: var(--vscode-dropdown-background);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
    ${(props: StyleBase) => props.sx}
`;

const DropdownItemBody = styled.div`
    max-height: 249px;
    overflow-y: scroll;
`;

const DropdownItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px;
    font-family: monospace;
    cursor: pointer;

    & > #description {
        display: none;
    }

    &.hovered > #description {
        display: block;
        color: var(--vscode-list-deemphasizedForeground);
    }
    &.hovered {
        background-color: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
    }
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
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
    margin: 0 16px;
    overflow-x: auto;
    white-space: nowrap;
    scroll-behavior: smooth;
    scrollbar-width: thin;
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
        transition: 'all 0.3s ease-in',
    }),
    enterFrom: css({
        opacity: 0,
    }),
    enterTo: css({
        opacity: 1,
    }),
    leave: css({
        transition: 'all 0.15s ease-out',
    }),
    leaveFrom: css({
        opacity: 1,
    }),
    leaveTo: css({
        opacity: 0,
    }),
};

const DefaultCompletionItem = (props: DefaultCompletionItemProps) => {
    const { getDefaultCompletion, onClick } = props;
    const itemRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        const parentEl = itemRef.current.parentElement;
        const hoveredEl = parentEl.querySelector('.hovered');
        if (hoveredEl) {
            hoveredEl.classList.remove('hovered');
        }
        itemRef.current.classList.add('hovered');
    }

    const handleClick = () => {
        onClick();
    }

    return (
        <DropdownItemContainer
            ref={itemRef}
            className="hovered"
            id="default-completion"
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
        >
            {getDefaultCompletion()}
        </DropdownItemContainer>
    );
}

const DropdownItem = (props: DropdownItemProps) => {
    const { item, firstItem, onClick } = props;
    const itemRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        const superParentEl = itemRef.current.parentElement.parentElement;
        const hoveredEl = superParentEl.querySelector('.hovered');
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
            <TitleContainer>
                {getIcon(item.kind)}
                {item.tag && <StyledTag>{item.tag}</StyledTag>}
                <Typography variant="body3" sx={{ fontWeight: 600 }}>
                    {item.label}
                </Typography>
            </TitleContainer>
            <Typography id="description" variant="caption">
                {item.description}
            </Typography>
        </DropdownItemContainer>
    );
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const { items, showDefaultCompletion, getDefaultCompletion, onCompletionSelect, onDefaultCompletionSelect, isSavable, sx } = props;
    const listBoxRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => listBoxRef.current);

    return (
        <DropdownBody sx={sx}>
            {showDefaultCompletion && (
                <DefaultCompletionItem
                    getDefaultCompletion={getDefaultCompletion}
                    onClick={async () => await onDefaultCompletionSelect()}
                />
            )}
            <DropdownItemBody ref={listBoxRef}>
                {items.map((item, index) => {
                    return (
                        <DropdownItem
                            key={`dropdown-item-${index}`}
                            {...(!showDefaultCompletion && index === 0 && { firstItem: true })}
                            item={item}
                            onClick={async () => await onCompletionSelect(item)}
                        />
                    );
                })}
            </DropdownItemBody>
            <Divider />
            <DropdownFooter>
                <DropdownFooterSection>
                    <KeyContainer>
                        <Codicon
                            name="arrow-small-up"
                            sx={{ display: 'flex', height: '12px', width: '12px' }}
                            iconSx={{
                                fontSize: '12px',
                                fontWeight: '600',
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
                                fontWeight: '600',
                            }}
                        />
                    </KeyContainer>
                    <DropdownFooterText>to navigate.</DropdownFooterText>
                </DropdownFooterSection>
                <DropdownFooterSection>
                    <KeyContainer>
                        <DropdownFooterKey>ENTER</DropdownFooterKey>
                    </KeyContainer>
                    <DropdownFooterText>{isSavable ? 'to select/save.' : 'to select.'}</DropdownFooterText>
                </DropdownFooterSection>
                <DropdownFooterSection>
                    <KeyContainer>
                        <DropdownFooterKey>ESC</DropdownFooterKey>
                    </KeyContainer>
                    <DropdownFooterText>to close.</DropdownFooterText>
                </DropdownFooterSection>
            </DropdownFooter>
        </DropdownBody>
    );
});
Dropdown.displayName = 'Dropdown';

const FnSignatureEl = (props: FnSignatureElProps) => {
    const { label, args, currentArgIndex, sx } = props;
    const selectedArgRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (selectedArgRef.current) {
            selectedArgRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentArgIndex]);

    return (
        <>
            {label && (
                <DropdownBody sx={sx}>
                    <SyntaxBody>
                        <Typography variant="body3" sx={{ fontWeight: 600 }}>
                            {`${label}(`}
                        </Typography>
                        {args?.map((arg, index) => {
                            const lastArg = index === args.length - 1;
                            if (index === currentArgIndex) {
                                return (
                                    <Fragment key={`arg-${index}`}>
                                        <SelectedArg ref={selectedArgRef}>{arg}</SelectedArg>
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
                </DropdownBody>
            )}
        </>
    );
};

export const ExpressionEditor = forwardRef<ExpressionBarRef, ExpressionBarProps>((props, ref) => {
    const {
        value,
        disabled,
        sx,
        completions,
        showDefaultCompletion,
        getDefaultCompletion,
        onChange,
        onSave,
        onCancel,
        onCompletionSelect,
        onDefaultCompletionSelect,
        extractArgsFromFunction,
        useTransaction,
        onFocus,
        onBlur,
        shouldDisableOnSave = true,
        ...rest
    } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listBoxRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const skipFocusCallback = useRef<boolean>(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>();
    const [fnSignature, setFnSignature] = useState<FnSignatureProps | undefined>();
    const SUGGESTION_REGEX = {
        prefix: /((?:\w|')*)$/,
        suffix: /^((?:\w|')*)/,
    };

    const isDropdownOpen = showDefaultCompletion || completions?.length > 0 || !!fnSignature;
    const isFocused = document.activeElement === inputRef.current;

    const handleResize = throttle(() => {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.top + rect.height,
                left: rect.left,
            });
        }
    }, 100);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementRef, isDropdownOpen]);

    const handleClose = () => {
        onCancel();
        setFnSignature(undefined);
    };

    // This allows us to update the Function Signature UI
    const updateFnSignature = async (value: string, cursorPosition: number) => {
        const fnSignature = await extractArgsFromFunction(value, cursorPosition);
        setFnSignature(fnSignature);
    };

    const handleChange = async (text: string, cursorPosition?: number) => {
        const updatedCursorPosition =
            cursorPosition ?? inputRef.current.shadowRoot.querySelector('input').selectionStart;
        // Update the text field value
        await onChange(text, updatedCursorPosition);

        const cursorInFunction = checkCursorInFunction(text, updatedCursorPosition);
        if (cursorInFunction) {
            // Update function signature if the cursor is inside a function
            await updateFnSignature(text, updatedCursorPosition);
        } else if (fnSignature) {
            // Clear the function signature if the cursor is not in a function
            setFnSignature(undefined);
        }
    };

    const handleCompletionSelect = async (item: CompletionItem) => {
        const replacementSpan = item.replacementSpan ?? 0;
        const cursorPosition = inputRef.current.shadowRoot.querySelector('input').selectionStart;
        const prefixMatches = value.substring(0, cursorPosition).match(SUGGESTION_REGEX.prefix);
        const suffixMatches = value.substring(cursorPosition).match(SUGGESTION_REGEX.suffix);
        const prefix = value.substring(0, cursorPosition - prefixMatches[1].length - replacementSpan);
        const suffix = value.substring(cursorPosition + suffixMatches[1].length);
        const newCursorPosition = prefix.length + item.value.length;
        const newTextValue = prefix + item.value + suffix;

        await handleChange(newTextValue, newCursorPosition);
        onCompletionSelect && await onCompletionSelect(newTextValue);

        return { newTextValue, newCursorPosition };
    };

    const handleExpressionSave = async (value: string) => {
        const valueWithClosingBracket = addClosingBracketIfNeeded(value);
        onSave && await onSave(valueWithClosingBracket);
        handleClose();
    }

    // Mutation functions
    const {
        data: completionSelectResponse,
        isLoading: isSelectingCompletion,
        mutate: handleCompletionSelectMutation
    } = useTransaction(handleCompletionSelect);
    const {
        isLoading: isSavingExpression,
        mutate: handleExpressionSaveMutation
    } = useTransaction(handleExpressionSave);

    useEffect(() => {
        if (completionSelectResponse) {
            // Post completion select actions
            skipFocusCallback.current = true;
            setCursor(inputRef, completionSelectResponse.newCursorPosition);
        }
    }, [completionSelectResponse]);

    const navigateUp = throttle((hoveredEl: Element) => {
        if (hoveredEl) {
            hoveredEl.classList.remove('hovered');
            const parentEl = hoveredEl.parentElement as HTMLElement;
            if (hoveredEl.id === 'default-completion') {
                const lastEl = listBoxRef.current.lastElementChild as HTMLElement;
                if (lastEl) {
                    lastEl.classList.add('hovered');
                    lastEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else if (parentEl.firstElementChild === hoveredEl) {
                const defaultCompletionEl = dropdownRef.current.querySelector('#default-completion');
                if (defaultCompletionEl) {
                    defaultCompletionEl.classList.add('hovered');
                    defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else {
                const prevEl = hoveredEl.previousElementSibling as HTMLElement;
                if (prevEl) {
                    prevEl.classList.add('hovered');
                    prevEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                } else {
                    const lastEl = listBoxRef.current.lastElementChild as HTMLElement;
                    if (lastEl) {
                        lastEl.classList.add('hovered');
                        lastEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    }
                }
            }
        } else {
            const lastEl = listBoxRef.current.lastElementChild as HTMLElement;
            if (lastEl) {
                lastEl.classList.add('hovered');
                lastEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }, 100);

    const navigateDown = throttle((hoveredEl: Element) => {
        if (hoveredEl) {
            hoveredEl.classList.remove('hovered');
            const parentEl = hoveredEl.parentElement as HTMLElement;
            if (hoveredEl.id === 'default-completion') {
                const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.classList.add('hovered');
                    firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else if (parentEl.lastElementChild === hoveredEl) {
                const defaultCompletionEl = dropdownRef.current.querySelector('#default-completion');
                if (defaultCompletionEl) {
                    defaultCompletionEl.classList.add('hovered');
                    defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
                const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else {
                const nextEl = hoveredEl.nextElementSibling as HTMLElement;
                if (nextEl) {
                    nextEl.classList.add('hovered');
                    nextEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                } else {
                    const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                    if (firstEl) {
                        firstEl.classList.add('hovered');
                        firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    }
                }
            }
        } else {
            const defaultCompletionEl = dropdownRef.current.querySelector('#default-completion');
            if (defaultCompletionEl) {
                defaultCompletionEl.classList.add('hovered');
                defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            } else {
                const firstEl = listBoxRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.classList.add('hovered');
                    firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            }
        }
    }, 100);

    const handleInputKeyDown = async (e: React.KeyboardEvent) => {
        if (dropdownRef.current) {
            const hoveredEl = dropdownRef.current.querySelector('.hovered');
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    handleClose();
                    return;
                case 'ArrowDown': {
                    e.preventDefault();
                    navigateDown(hoveredEl);
                    return;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    navigateUp(hoveredEl);
                    return;
                }
                case 'Tab':
                    e.preventDefault();
                    if (hoveredEl) {
                        if (hoveredEl.id === 'default-completion') {
                            onDefaultCompletionSelect?.();
                        } else {
                            const item = completions.find(
                                (item: CompletionItem) => `${item.tag ?? ''}${item.label}` === hoveredEl.firstChild.textContent
                            );
                            if (item) {
                                await handleCompletionSelectMutation(item);
                            }
                        }
                    }
                    return;
                case 'Enter':
                    e.preventDefault();
                    if (hoveredEl) {
                        if (hoveredEl.id === 'default-completion') {
                            onDefaultCompletionSelect?.();
                        } else {
                            const item = completions.find(
                                (item: CompletionItem) => `${item.tag ?? ''}${item.label}` === hoveredEl.firstChild.textContent
                            );
                            if (item) {
                                await handleCompletionSelectMutation(item);
                            }
                        }
                    }
                    return;
                case 'Esc':
                    e.preventDefault();
                    handleClose();
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            await handleExpressionSaveMutation(value);
            return;
        }
    };

    const handleRefFocus = () => {
        if (document.activeElement !== elementRef.current) {
            inputRef.current?.focus();
        }
    }

    const handleRefBlur = async (value?: string) => {
        if (document.activeElement === elementRef.current) {
            // Trigger save event on blur
            if (value !== undefined) {
                await handleExpressionSaveMutation(value);
            }
            inputRef.current?.blur();
        }
    }

    const handleTextFieldFocus = async () => {
        if (skipFocusCallback.current) {
            skipFocusCallback.current = false;
            return;
        }
        await onFocus?.();
    }

    const handleTextFieldBlur = (e: React.FocusEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    useImperativeHandle(ref, () => ({
        shadowRoot: inputRef.current?.shadowRoot,
        focus: handleRefFocus,
        blur: handleRefBlur,
        saveExpression: async (value?: string) => {
            await handleExpressionSaveMutation(value);
        }
    }));

    useEffect(() => {
        // Prevent blur event when clicking on the dropdown
        const handleOutsideClick = async (e: any) => {
            if (
                document.activeElement === inputRef.current &&
                !inputRef.current?.contains(e.target) &&
                !dropdownRef.current?.contains(e.target)
            ) {
                await onBlur?.();
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    }, [onBlur]);

    return (
        <Container ref={elementRef}>
            <StyledTextField
                ref={inputRef}
                value={value}
                onTextChange={handleChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleTextFieldFocus}
                onBlur={handleTextFieldBlur}
                sx={{ width: '100%', ...sx }}
                disabled={disabled || (shouldDisableOnSave && (isSelectingCompletion || isSavingExpression))}
                {...rest}
            />
            {shouldDisableOnSave && (isSelectingCompletion || isSavingExpression) && <ProgressIndicator barWidth={6} sx={{ top: "100%" }} />}
            {isFocused &&
                createPortal(
                    <DropdownContainer ref={dropdownRef} sx={{ ...dropdownPosition }}>
                        <Transition show={isDropdownOpen} {...ANIMATION}>
                            <Codicon
                                sx={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    width: '16px',
                                    margin: '-4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--vscode-activityBar-background)',
                                    zIndex: '5',
                                }}
                                iconSx={{ color: 'var(--vscode-activityBar-foreground)' }}
                                name="close"
                                onClick={handleClose}
                            />
                            <Dropdown
                                ref={listBoxRef}
                                isSavable={!!onSave}
                                items={completions}
                                showDefaultCompletion={showDefaultCompletion}
                                getDefaultCompletion={getDefaultCompletion}
                                onCompletionSelect={handleCompletionSelectMutation}
                                onDefaultCompletionSelect={onDefaultCompletionSelect}
                            />
                            <FnSignatureEl
                                label={fnSignature?.label}
                                args={fnSignature?.args}
                                currentArgIndex={fnSignature?.currentArgIndex ?? 0}
                            />
                        </Transition>
                    </DropdownContainer>,
                    document.body
                )}
        </Container>
    );
});
ExpressionEditor.displayName = 'ExpressionEditor';
