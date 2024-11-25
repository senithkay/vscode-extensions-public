/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, Fragment, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import { css } from '@emotion/css';
import { Typography } from '../Typography/Typography';
import { Codicon } from '../Codicon/Codicon';
import { ExpressionBarProps, CompletionItem, ExpressionBarRef } from './ExpressionBar';
import { throttle } from 'lodash';
import { createPortal } from 'react-dom';
import { addClosingBracketIfNeeded, checkCursorInFunction, getIcon, setCursor } from './utils';
import { VSCodeTag } from '@vscode/webview-ui-toolkit/react';
import { ProgressIndicator } from '../ProgressIndicator/ProgressIndicator';
import { AutoResizeTextArea } from '../TextArea/TextArea';
import { TextField } from '../TextField/TextField';

// Types
type StyleBase = {
    sx?: React.CSSProperties;
};

type DropdownProps = StyleBase & {
    items: CompletionItem[];
    showDefaultCompletion?: boolean;
    autoSelectFirstItem?: boolean;
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
    isSelected?: boolean;
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

const StyledTextArea = styled(AutoResizeTextArea)`
    ::part(control) {
        font-family: monospace;
        font-size: 12px;
        min-height: 20px;
        padding: 5px 8px;
    }
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

const FnSignatureBody = styled.div<StyleBase>`
    width: 350px;
    margin-block: 2px;
    padding-block: 8px;
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
    const { item, isSelected, onClick } = props;
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
            {...(isSelected && { className: 'hovered' })}
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
            {item.description && (
                <Typography id="description" variant="caption">
                    {item.description}
                </Typography>)
            }
        </DropdownItemContainer>
    );
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
    const { items, showDefaultCompletion, autoSelectFirstItem, getDefaultCompletion, onCompletionSelect, onDefaultCompletionSelect, isSavable, sx } = props;
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
                            {...(autoSelectFirstItem && { isSelected: index === 0 })}
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
                    <DropdownFooterText>to cancel.</DropdownFooterText>
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
                <FnSignatureBody sx={sx}>
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
                        <Typography variant="body3" sx={{ fontWeight: 600 }}>{`)`}</Typography>
                    </SyntaxBody>
                </FnSignatureBody>
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
        autoSelectFirstItem,
        getDefaultCompletion,
        onChange,
        onSave,
        onCancel,
        onClose,
        onCompletionSelect,
        onDefaultCompletionSelect,
        onManualCompletionRequest,
        extractArgsFromFunction,
        useTransaction,
        onFocus,
        onBlur,
        shouldDisableOnSave = true,
        ...rest
    } = props;

    let textBoxType: 'TextField' | 'TextArea' = 'TextArea';
    let inputElementType: 'input' | 'textarea' = 'textarea';
    if(props.textBoxType === 'TextField') {
        textBoxType = 'TextField';
        inputElementType = 'input';
    }

    const elementRef = useRef<HTMLDivElement>(null);
    const textBoxRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownContainerRef = useRef<HTMLDivElement>(null);
    const skipFocusCallback = useRef<boolean>(false);
    const [dropdownElPosition, setDropdownElPosition] = useState<{ top: number; left: number }>();
    const [fnSignatureElPosition, setFnSignatureElPosition] = useState<{ top: number; left: number }>();
    const [fnSignature, setFnSignature] = useState<FnSignatureProps | undefined>();
    const SUGGESTION_REGEX = {
        prefix: /((?:\w|')*)$/,
        suffix: /^((?:\w|')*)/,
    };

    const showCompletions = useMemo(() => {
        if (textBoxType === 'TextField') {
            return showDefaultCompletion || completions?.length > 0 || !!fnSignature;
        }
        return showDefaultCompletion || completions?.length > 0;
    }, [showDefaultCompletion, completions, fnSignature, textBoxType]);
    const isFocused = document.activeElement === textBoxRef.current;

    const handleResize = throttle(() => {
        if (elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            setDropdownElPosition({
                top: rect.top + rect.height,
                left: rect.left,
            });
            setFnSignatureElPosition({
                top: rect.top - 32,
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
    }, [elementRef, showCompletions]);

    const handleCancel = () => {
        onCancel();
        setFnSignature(undefined);
    };

    const handleClose = () => {
        onClose ? onClose() : handleCancel();
    };

    // This allows us to update the Function Signature UI
    const updateFnSignature = async (value: string, cursorPosition: number) => {
        const fnSignature = await extractArgsFromFunction(value, cursorPosition);
        setFnSignature(fnSignature);
    };

    const handleChange = async (text: string, cursorPosition?: number) => {
        const updatedCursorPosition =
            cursorPosition ?? textBoxRef.current.shadowRoot.querySelector(inputElementType).selectionStart;
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
        const cursorPosition = textBoxRef.current.shadowRoot.querySelector(inputElementType).selectionStart;
        const prefixMatches = value.substring(0, cursorPosition).match(SUGGESTION_REGEX.prefix);
        const suffixMatches = value.substring(cursorPosition).match(SUGGESTION_REGEX.suffix);
        const prefix = value.substring(0, cursorPosition - prefixMatches[1].length - replacementSpan);
        const suffix = value.substring(cursorPosition + suffixMatches[1].length);
        const newCursorPosition = prefix.length + (item.cursorOffset || item.value.length);
        const newTextValue = prefix + item.value + suffix;

        await handleChange(newTextValue, newCursorPosition);
        onCompletionSelect && await onCompletionSelect(newTextValue);

        return { newTextValue, newCursorPosition };
    };

    const handleExpressionSave = async (value: string, ref?: React.MutableRefObject<string>) => {
        if(ref) value = ref.current;
        const valueWithClosingBracket = addClosingBracketIfNeeded(value);
        onSave && await onSave(valueWithClosingBracket);
        handleCancel();
    }

    // Mutation functions
    const {
        data: completionSelectResponse,
        // isLoading: isSelectingCompletion,
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
            setCursor(textBoxRef, inputElementType, completionSelectResponse.newCursorPosition);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completionSelectResponse]);

    const navigateUp = throttle((hoveredEl: Element) => {
        if (hoveredEl) {
            hoveredEl.classList.remove('hovered');
            const parentEl = hoveredEl.parentElement as HTMLElement;
            if (hoveredEl.id === 'default-completion') {
                const lastEl = dropdownRef.current.lastElementChild as HTMLElement;
                if (lastEl) {
                    lastEl.classList.add('hovered');
                    lastEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else if (parentEl.firstElementChild === hoveredEl) {
                const defaultCompletionEl = dropdownContainerRef.current.querySelector('#default-completion');
                if (defaultCompletionEl) {
                    defaultCompletionEl.classList.add('hovered');
                    defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                } else {
                    const lastEl = dropdownRef.current.lastElementChild as HTMLElement;
                    if (lastEl) {
                        lastEl.classList.add('hovered');
                        lastEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    } 
                }
            } else {
                const prevEl = hoveredEl.previousElementSibling as HTMLElement;
                prevEl.classList.add('hovered');
                prevEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        } else {
            const lastEl = dropdownRef.current.lastElementChild as HTMLElement;
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
                const firstEl = dropdownRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.classList.add('hovered');
                    firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            } else if (parentEl.lastElementChild === hoveredEl) {
                const defaultCompletionEl = dropdownContainerRef.current.querySelector('#default-completion');
                if (defaultCompletionEl) {
                    defaultCompletionEl.classList.add('hovered');
                    defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                } else {
                    const firstEl = dropdownRef.current.firstElementChild as HTMLElement;
                    if (firstEl) {
                        firstEl.classList.add('hovered');
                        firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    }
                }
            } else {
                const nextEl = hoveredEl.nextElementSibling as HTMLElement;
                nextEl.classList.add('hovered');
                nextEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        } else {
            const defaultCompletionEl = dropdownContainerRef.current.querySelector('#default-completion');
            if (defaultCompletionEl) {
                defaultCompletionEl.classList.add('hovered');
                defaultCompletionEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            } else {
                const firstEl = dropdownRef.current.firstElementChild as HTMLElement;
                if (firstEl) {
                    firstEl.classList.add('hovered');
                    firstEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
            }
        }
    }, 100);

    const onCompletionSelectKeyStroke = async (hoveredEl: Element) => {
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

    const handleInputKeyDown = async (e: React.KeyboardEvent) => {
        if (dropdownContainerRef.current) {
            const hoveredEl = dropdownContainerRef.current.querySelector('.hovered');
            if (dropdownRef.current) {
                // Actions that can only be performed when the dropdown is open
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        handleCancel();
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
                        if (hoveredEl) {
                            e.preventDefault();
                            onCompletionSelectKeyStroke(hoveredEl);
                        }
                        return;
                    case 'Enter':
                        if (hoveredEl) {
                            e.preventDefault();
                            onCompletionSelectKeyStroke(hoveredEl);
                        }
                        return;
                }
            }
        }

        if (onManualCompletionRequest && e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            await onManualCompletionRequest();
            return;
        }

        if (e.key === 'Enter') {
            if (textBoxType === 'TextField') {
                e.preventDefault();
                await handleExpressionSaveMutation(value);
            }
           
            return;
        }
    };

    const handleRefFocus = () => {
        if (document.activeElement !== elementRef.current) {
            textBoxRef.current?.focus();
        }
    }

    const handleRefBlur = async (value?: string) => {
        if (document.activeElement === elementRef.current) {
            // Trigger save event on blur
            if (value !== undefined) {
                await handleExpressionSaveMutation(value);
            }
            textBoxRef.current?.blur();
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
        shadowRoot: textBoxRef.current?.shadowRoot,
        inputElement: textBoxRef.current?.shadowRoot?.querySelector(inputElementType),
        focus: handleRefFocus,
        blur: handleRefBlur,
        saveExpression: async (value?: string, ref?: React.MutableRefObject<string>) => {
            await handleExpressionSaveMutation(value, ref);
        },
        setCursor: (position: number) => {
            setCursor(textBoxRef, inputElementType, position);
        }
    }));

    useEffect(() => {
        // Prevent blur event when clicking on the dropdown
        const handleOutsideClick = async (e: any) => {
            if (
                document.activeElement === textBoxRef.current &&
                !textBoxRef.current?.contains(e.target) &&
                !dropdownContainerRef.current?.contains(e.target)
            ) {
                await onBlur?.(e);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    }, [onBlur]);

    return (
        <Container ref={elementRef}>
            {textBoxType === 'TextField' ? (
                <StyledTextField
                    ref={textBoxRef as React.RefObject<HTMLInputElement>}
                    value={value}
                    onTextChange={handleChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleTextFieldBlur}
                    sx={{ width: '100%', ...sx }}
                    disabled={disabled || (shouldDisableOnSave && isSavingExpression)}
                    {...rest}
                />
            ) : (
                <StyledTextArea
                    {...rest}
                    ref={textBoxRef as React.RefObject<HTMLTextAreaElement>}
                    value={value}
                    onTextChange={handleChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={handleTextFieldFocus}
                    onBlur={handleTextFieldBlur}
                    sx={{ width: '100%', ...sx }}
                    disabled={disabled || (shouldDisableOnSave && isSavingExpression)}
                    growRange={{ start: 1, offset: 7 }}
                    resize='vertical'
                />
            )}

            {shouldDisableOnSave && isSavingExpression && <ProgressIndicator barWidth={6} sx={{ top: "100%" }} />}
            {isFocused &&
                createPortal(
                    <DropdownContainer ref={dropdownContainerRef} sx={{ ...dropdownElPosition }}>
                        <Transition show={showCompletions} {...ANIMATION}>
                            <Codicon
                                id='expression-editor-close'
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
                                ref={dropdownRef}
                                isSavable={!!onSave}
                                items={completions}
                                showDefaultCompletion={showDefaultCompletion}
                                autoSelectFirstItem={autoSelectFirstItem}
                                getDefaultCompletion={getDefaultCompletion}
                                onCompletionSelect={handleCompletionSelectMutation}
                                onDefaultCompletionSelect={onDefaultCompletionSelect}
                            />
                            {textBoxType === 'TextField' && (
                                <FnSignatureEl
                                    label={fnSignature?.label}
                                    args={fnSignature?.args}
                                    currentArgIndex={fnSignature?.currentArgIndex ?? 0}
                                />
                            )}
                        </Transition>
                    </DropdownContainer>,
                    document.body
                )
            }
            {isFocused && textBoxType === 'TextArea' &&
                createPortal(
                    <DropdownContainer sx={{ ...fnSignatureElPosition }}>
                        <Transition show={!!fnSignature} {...ANIMATION}>
                            <FnSignatureEl
                                label={fnSignature?.label}
                                args={fnSignature?.args}
                                currentArgIndex={fnSignature?.currentArgIndex ?? 0}
                            />
                        </Transition>
                    </DropdownContainer>,
                    document.body
                )
            }
        </Container>
    );
});
ExpressionEditor.displayName = 'ExpressionEditor';
