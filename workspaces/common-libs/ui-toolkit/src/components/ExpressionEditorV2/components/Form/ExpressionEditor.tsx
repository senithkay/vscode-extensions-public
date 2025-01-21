/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { throttle } from 'lodash';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import { ANIMATION } from '../constants';
import { CompletionItem } from '../../types/common';
import { FormExpressionEditorProps, FormExpressionEditorRef } from '../../types/form';
import { addClosingBracketIfNeeded, checkCursorInFunction, setCursor } from '../../utils';
import { Codicon } from '../../../Codicon/Codicon';
import { ProgressIndicator } from '../../../ProgressIndicator/ProgressIndicator';
import { AutoResizeTextArea } from '../../../TextArea/TextArea';
import { FnSignatureEl } from '../Common/FnSignature';
import { Dropdown } from '../Common';
import { StyleBase, FnSignatureProps } from '../Common/types';
import { Icon } from '../../../Icon/Icon';
import { Button } from '../../../Button/Button';

/* Styled components */
const Container = styled.div`
    width: 100%;
    position: relative;
    display: flex;
`;

const ActionButtons = styled.div`
    position: absolute;
    top: -14px;
    right: 0;
    display: flex;
    gap: 4px;
`

const StyledTextArea = styled(AutoResizeTextArea)`
    ::part(control) {
        font-family: monospace;
        font-size: 12px;
        min-height: 20px;
        padding: 5px 8px;
    }
`;

const DropdownContainer = styled.div<StyleBase>`
    position: absolute;
    z-index: 10000;
    ${(props: StyleBase) => props.sx}
`;

const TransitionContainer = styled.div`
    position: fixed;
`;

const TransitionWrapper = forwardRef<HTMLDivElement, React.PropsWithChildren<object>>((props, ref) => {
    return (
        <TransitionContainer ref={ref}>
            {props.children}
        </TransitionContainer>
    )
})
TransitionWrapper.displayName = 'TransitionWrapper';

export const ExpressionEditor = forwardRef<FormExpressionEditorRef, FormExpressionEditorProps>((props, ref) => {
    const {
        buttonRef,
        value,
        disabled,
        sx,
        completions,
        showDefaultCompletion,
        autoSelectFirstItem,
        getDefaultCompletion,
        isHelperPaneOpen,
        changeHelperPaneState,
        getHelperPane,
        actionButtons,
        onChange,
        onSave,
        onCancel,
        onClose,
        onCompletionSelect,
        onDefaultCompletionSelect,
        onManualCompletionRequest,
        extractArgsFromFunction,
        onFunctionEdit,
        useTransaction,
        onFocus,
        onBlur,
        ...rest
    } = props;

    const elementRef = useRef<HTMLDivElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);
    const textBoxRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownContainerRef = useRef<HTMLDivElement>(null);
    const helperPaneContainerRef = useRef<HTMLDivElement>(null);
    const [fnSignature, setFnSignature] = useState<FnSignatureProps | undefined>();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const SUGGESTION_REGEX = {
        prefix: /((?:\w|')*)$/,
        suffix: /^((?:\w|')*)/,
    };

    const showCompletions = !isHelperPaneOpen && (showDefaultCompletion || completions?.length > 0);

    const handleCancel = () => {
        onCancel();
        changeHelperPaneState?.(false);
        setFnSignature(undefined);
    };

    const handleClose = () => {
        onClose ? onClose() : handleCancel();
    };

    // This allows us to update the Function Signature UI
    const updateFnSignature = async (value: string, cursorPosition: number) => {
        if (extractArgsFromFunction) {
            const fnSignature = await extractArgsFromFunction(value, cursorPosition);
            setFnSignature(fnSignature);
        }
    };

    const handleChange = async (text: string, cursorPosition?: number) => {
        const updatedCursorPosition =
            cursorPosition ?? textBoxRef.current.shadowRoot.querySelector('textarea').selectionStart;
        // Update the text field value
        await onChange(text, updatedCursorPosition);

        const { cursorInFunction, functionName } = checkCursorInFunction(text, updatedCursorPosition);
        if (cursorInFunction) {
            // Update function signature if the cursor is inside a function
            await updateFnSignature(text, updatedCursorPosition);
            // Update function name if the cursor is inside a function name
            await onFunctionEdit?.(functionName);
        } else if (fnSignature) {
            // Clear the function signature if the cursor is not in a function
            setFnSignature(undefined);
        }

        if (!cursorInFunction) {
            // Clear the function name if the cursor is not in a function name
            await onFunctionEdit?.(undefined);
        }
    };

    const handleCompletionSelect = async (item: CompletionItem) => {
        const replacementSpan = item.replacementSpan ?? 0;
        const cursorPosition = textBoxRef.current.shadowRoot.querySelector('textarea').selectionStart;
        const prefixMatches = value.substring(0, cursorPosition).match(SUGGESTION_REGEX.prefix);
        const suffixMatches = value.substring(cursorPosition).match(SUGGESTION_REGEX.suffix);
        const prefix = value.substring(0, cursorPosition - prefixMatches[1].length - replacementSpan);
        const suffix = value.substring(cursorPosition + suffixMatches[1].length);
        const newCursorPosition = prefix.length + (item.cursorOffset || item.value.length);
        const newTextValue = prefix + item.value + suffix;

        await handleChange(newTextValue, newCursorPosition);
        onCompletionSelect && await onCompletionSelect(newTextValue, item);
        setCursor(textBoxRef, 'textarea', newTextValue, newCursorPosition);
    };

    const handleExpressionSave = async (value: string, ref?: React.MutableRefObject<string>) => {
        if(ref) value = ref.current;
        const valueWithClosingBracket = addClosingBracketIfNeeded(value);
        onSave && await onSave(valueWithClosingBracket);
        handleCancel();
    }

    // Mutation functions
    const {
        isLoading: isSavingExpression = false,
        mutate: expressionSaveMutate
    } = useTransaction?.(handleExpressionSave) ?? {};

    const handleExpressionSaveMutation = async (value: string, ref?: React.MutableRefObject<string>) => {
        expressionSaveMutate ? await expressionSaveMutate(value, ref) : await handleExpressionSave(value, ref);
    }

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
                await handleCompletionSelect(item);
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

        if (helperPaneContainerRef.current) {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
                return;
            }
        }

        if (onManualCompletionRequest && e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            await onManualCompletionRequest();
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

    const handleRefSetCursor = (value: string, cursorPosition: number) => {
        setCursor(textBoxRef, 'textarea', value, cursorPosition);
    }

    const handleTextAreaFocus = async () => {
        // Additional actions to be performed when the expression editor gains focus
        setIsFocused(true);
        changeHelperPaneState?.(true);

        await onFocus?.();
    }

    const handleTextAreaBlur = (e: React.FocusEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    useImperativeHandle(ref, () => ({
        shadowRoot: textBoxRef.current?.shadowRoot,
        inputElement: textBoxRef.current?.shadowRoot?.querySelector('textarea'),
        focus: handleRefFocus,
        blur: handleRefBlur,
        setCursor: handleRefSetCursor,
        saveExpression: async (value?: string, ref?: React.MutableRefObject<string>) => {
            await handleExpressionSaveMutation(value, ref);
        }
    }));

    useEffect(() => {
        // Prevent blur event when clicking on the dropdown
        const handleOutsideClick = async (e: any) => {
            if (
                document.activeElement === textBoxRef.current &&
                !buttonRef.current?.contains(e.target) &&
                !actionButtonsRef.current?.contains(e.target) &&
                !textBoxRef.current?.contains(e.target) &&
                !dropdownContainerRef.current?.contains(e.target) &&
                !helperPaneContainerRef.current?.contains(e.target)
            ) {
                // Additional actions to be performed when the expression editor loses focus
                setIsFocused(false);
                changeHelperPaneState?.(false);

                await onBlur?.(e);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onBlur, changeHelperPaneState, buttonRef.current]);

    return (
        <Container ref={elementRef}>
            {/* Action buttons at the top of the expression editor */}
            {actionButtons?.length > 0 && (
                <ActionButtons ref={actionButtonsRef}>
                    {actionButtons.map((actBtn, index) => {
                        let icon: React.ReactNode;
                        if (actBtn.iconType === 'codicon') {
                            icon = (
                                <Codicon
                                    key={index}
                                    name={actBtn.name}
                                    iconSx={{ fontSize: '12px', color: 'var(--vscode-button-background)' }}
                                    sx={{ height: '14px', width: '18px' }}
                                />
                            );
                        } else {
                            icon = (
                                <Icon
                                    key={index}
                                    name={actBtn.name}
                                    iconSx={{ fontSize: '12px', color: 'var(--vscode-button-background)' }}
                                    sx={{ height: '14px', width: '18px' }}
                                />
                            );
                        }
                        
                        return (
                            <Button
                                key={index}
                                tooltip={actBtn.tooltip}
                                onClick={actBtn.onClick}
                                appearance='icon'
                                sx={{ height: '14px', width: '18px' }}
                            >
                                {icon}
                            </Button>
                        )
                    })}
                </ActionButtons>
            )}

            {/* Expression editor component */}
            <StyledTextArea
                {...rest}
                ref={textBoxRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onTextChange={handleChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleTextAreaFocus}
                onBlur={handleTextAreaBlur}
                sx={{ width: '100%', ...sx }}
                disabled={disabled || isSavingExpression}
                growRange={{ start: 1, offset: 7 }}
                resize='vertical'
            />
            {isSavingExpression && <ProgressIndicator barWidth={6} sx={{ top: "100%" }} />}
            {isFocused && (
                <DropdownContainer ref={dropdownContainerRef} sx={{ top: "100%" }}>
                    <Transition as={TransitionWrapper} show={showCompletions} {...ANIMATION}>
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
                            onCompletionSelect={handleCompletionSelect}
                            onDefaultCompletionSelect={onDefaultCompletionSelect}
                        />
                    </Transition>
                </DropdownContainer>
            )}
            {isFocused && getHelperPane && (
                <DropdownContainer ref={helperPaneContainerRef} sx={{ top: "100%" }}>
                    <Transition as={TransitionWrapper} show={isHelperPaneOpen} {...ANIMATION}>
                        {getHelperPane(value, handleChange)}
                    </Transition>
                </DropdownContainer>
            )}
            {isFocused && (
                <DropdownContainer sx={{ top: "-24px" }}>
                    <Transition as={TransitionWrapper} show={!!fnSignature} {...ANIMATION}>
                        <FnSignatureEl
                            label={fnSignature?.label}
                            args={fnSignature?.args}
                            currentArgIndex={fnSignature?.currentArgIndex ?? 0}
                        />
                    </Transition>
                </DropdownContainer>
            )}
        </Container>
    );
});
ExpressionEditor.displayName = 'ExpressionEditor';
