/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styled from '@emotion/styled';

import { ResizeHandle } from './ResizeHandle';

import { ActionButtons } from '../Common/ActionButtons';
import HelperPane from '../Common/HelperPane';
import { StyleBase } from '../Common/types';

import {
    extractExpressions,
    getHelperPaneWithEditorArrowPosition,
    getHelperPaneWithEditorPosition,
    setValue,
    transformExpressions
} from '../../utils';
import { TokenEditorProps } from '../../types';

import { Button } from '../../../Button/Button';
import { Icon } from '../../../Icon/Icon';

import { ThemeColors } from '../../../../styles/ThemeColours';
import { HELPER_PANE_WITH_EDITOR_HEIGHT, HELPER_PANE_WITH_EDITOR_WIDTH } from '../../constants';
import { TextArea } from '../../../TextArea/TextArea';

/* Styles */
namespace S {
    export const Container = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
    `;

    export const EditorWithHandle = styled.div`
        position: relative;
        flex: 1 1 auto;
        padding-block: 4px;
    `;

    export const Editor = styled.div<StyleBase & { isFocused: boolean }>`
        box-sizing: border-box;
        position: relative;
        color: var(--input-foreground);
        background: var(--input-background);
        border-radius: calc(var(--corner-radius) * 1px);
        border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
        font-style: inherit;
        font-variant: inherit;
        font-weight: inherit;
        font-stretch: inherit;
        font-family: monospace !important;
        font-optical-sizing: inherit;
        font-size-adjust: inherit;
        font-kerning: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        font-size: 12px;
        line-height: var(--type-ramp-base-line-height);
        padding: 5px 8px;
        width: 100%;
        min-height: 26px;
        min-width: var(--input-min-width);
        outline: none;
        resize: vertical;

        * {
            font-family: monospace !important;
        }

        ${(props: { isFocused: boolean }) => props.isFocused && `
            border-color: var(--focus-border);
        `}

        .expression-token {
            color: var(--vscode-button-foreground);
            background-color: var(--vscode-button-background);
            font-weight: 600;
            margin-inline: 2px;
            padding-left: 4px;
            border-radius: 2px;
            margin: 0 4px;
            display: inline-block;
            user-select: none;
            cursor: pointer;
        }

        .expression-token-close {
            opacity: 0.7;
            font-size: 12px;
            padding: 0 4px;
            border-left: 1px solid var(--vscode-button-foreground);
            color: color-mix(in srgb, var(--vscode-button-foreground) 70%, transparent);
            background-color: color-mix(in srgb, var(--vscode-button-background) 70%, transparent);

            &:hover {
                color: var(--vscode-button-foreground);
                background-color: var(--vscode-button-background);
            }
        }

        /* Hide zero-width space character but keep it functional */
        .expression-token + br {
            display: none;
        }

        ${(props: StyleBase) => props.sx};
    `;

    export const HelperPane = styled.div<StyleBase>`
        height: ${HELPER_PANE_WITH_EDITOR_HEIGHT}px;
        width: ${HELPER_PANE_WITH_EDITOR_WIDTH}px;
        position: absolute;
        z-index: 2001;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background-color: var(--vscode-dropdown-background);
        box-sizing: border-box;
        filter: drop-shadow(0 3px 8px rgb(0 0 0 / 0.2));
        ${(props: StyleBase) => props.sx}

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
    `;

    export const HelperPaneButtons = styled.div`
        margin-top: auto;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    `;
}

export const TokenEditor = ({
    value,
    actionButtons,
    onChange,
    getHelperPane,
    helperPaneOrigin,
    isHelperPaneOpen,
    changeHelperPaneState,
    onFocus,
    onBlur,
    getExpressionEditorIcon
}: TokenEditorProps) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const helperPaneContainerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const currentNodeRef = useRef<Node | null>(null);
    const currentNodeOffsetRef = useRef<number | null>(null);
    const textAreaCursorPositionRef = useRef<number>(0);
    const [tokenValue, setTokenValue] = useState<string>('');
    const selectedTokenRef = useRef<HTMLSpanElement | null>(null);

    const addEventListeners = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const tokens = editor.querySelectorAll('.expression-token');
        tokens.forEach(token => {
            // Edit event listener
            token.querySelector('.expression-token-text')!.addEventListener('click', e => {
                e.stopPropagation();
                // Open the helper pane
                changeHelperPaneState?.(true);
                
                setTokenValue((e.target as HTMLSpanElement).textContent?.trim() || '');
                textAreaRef.current?.focus();
                selectedTokenRef.current = e.target as HTMLSpanElement;
            });

            // Close event listener
            token.querySelector('.expression-token-close')!.addEventListener('click', e => {
                e.stopPropagation();
                token.remove();
                selectedTokenRef.current = null;
                onChange?.(extractExpressions(editor.innerHTML));
            });
        });
    };

    const handleInput = () => {
        const editor = editorRef.current;
        if (!editor) return;

        // Extract expressions from the content
        const content = editor.innerHTML;
        const transformedContent = transformExpressions(content);

        // Update the value
        onChange?.(extractExpressions(transformedContent));

        if (content !== transformedContent) {
            // Store selection state
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);
            const currentNode = range?.startContainer;
            const currentNodeIndex = Array.from(editor.childNodes).indexOf(currentNode as ChildNode);

            // Update content
            editor.innerHTML = transformedContent;

            // Add event listeners to the tokens
            addEventListeners();

            // Restore cursor position
            if (selection && range && currentNode) {
                const newRange = document.createRange();
                const newCurrentNode = editor.childNodes[currentNodeIndex + 1];

                try {
                    newRange.setStartAfter(newCurrentNode);
                    newRange.setEndAfter(newCurrentNode);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } catch (e) {
                    // Fallback to end of editor if something goes wrong
                    const lastChild = editor.lastChild;
                    if (lastChild) {
                        newRange.setStartAfter(lastChild);
                        newRange.setEndAfter(lastChild);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                }
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);

            if (!selection || !range) return;

            // Get the element before cursor
            const previousNode = range.startContainer.previousSibling;

            // If cursor is at start of text node and previous node is a token
            if (
                range.startContainer.nodeType === Node.TEXT_NODE &&
                range.startOffset === 0 &&
                previousNode?.nodeType === Node.ELEMENT_NODE &&
                (previousNode as HTMLElement).classList?.contains('expression-token')
            ) {
                e.preventDefault();
                previousNode.remove();
            }

            onChange?.(extractExpressions(editorRef.current?.innerHTML || ''));
        }
    };

    const handleFocus = () => {
        // Additional actions to be performed when the token editor is focused
        setIsFocused(true);

        onFocus?.();
    }

    const handleHelperPaneWithEditorClose = () => {
        // Clearing operations
        changeHelperPaneState?.(false);
        setTokenValue('');
        selectedTokenRef.current = null;
    }

    const handleHelperPaneWithEditorEdit = () => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection || !selectedTokenRef.current) {
            return;
        }

        // If empty value, remove the token
        if (tokenValue.trim() === '') {
            selectedTokenRef.current.parentElement?.remove();

            // Clearing operations
            changeHelperPaneState?.(false);
            setTokenValue('');
            selectedTokenRef.current = null;

            return;
        }
        
        // Update the token value
        selectedTokenRef.current.innerHTML = tokenValue;

        // Update cursor position
        const range = document.createRange();
        try {
            range.setStartAfter(selectedTokenRef.current);
            range.setEndAfter(selectedTokenRef.current);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            // Fallback to end of editor if something goes wrong
            const lastChild = editor.lastChild;
            if (lastChild) {
                range.setStartAfter(lastChild);
                range.setEndAfter(lastChild);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        // Add event listeners to the tokens
        addEventListeners();

        // Update the value
        onChange?.(extractExpressions(editor.innerHTML));

        // Clearing operations
        changeHelperPaneState?.(false);
        setTokenValue('');
        selectedTokenRef.current = null;
    }

    const handleHelperPaneWithEditorSave = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection) return;

        // If empty value, remove the token
        if (tokenValue.trim() === '') {
            // Clearing operations
            changeHelperPaneState?.(false);
            setTokenValue('');
            selectedTokenRef.current = null;

            return;
        }

        // Create a new range using the stored node and offset
        const range = document.createRange();
        if (currentNodeRef.current && currentNodeOffsetRef.current !== null) {
            range.setStart(currentNodeRef.current, currentNodeOffsetRef.current);
            range.setEnd(currentNodeRef.current, currentNodeOffsetRef.current);
        } else {
            // Fallback to the end of the editor if no valid position is stored
            range.selectNodeContents(editor);
            range.collapse(false);
        }

        // Insert the new text node at the current cursor position
        const textNode = new DOMParser()
            .parseFromString(transformExpressions(`\${${tokenValue}}`), 'text/html')
            .body
            .firstChild;

        try {
            range.insertNode(textNode);
            // Move the cursor to the end of the inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            // Fallback to end of editor if something goes wrong and insert the text node at the end
            const lastChild = editor.lastChild;
            if (lastChild) {
                range.setStartAfter(lastChild);
                range.setEndAfter(lastChild);
                range.insertNode(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        
        // Add event listeners to the tokens
        addEventListeners();

        // Update the value
        onChange?.(extractExpressions(editor.innerHTML));

        // Clearing operations
        changeHelperPaneState?.(false);
        setTokenValue('');
        selectedTokenRef.current = null;
    };

    const handleHelperPaneChange = (value: string) => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        // Focus the text area
        textArea.focus();
        
        // Update the token value
        const cursorPosition = textAreaCursorPositionRef.current;
        const newTokenValue = tokenValue.slice(0, cursorPosition) + value + tokenValue.slice(cursorPosition);
        setTokenValue(newTokenValue);

        // Update the cursor position
        const textAreaElement = textArea.shadowRoot.querySelector('textarea')!;
        const newCursorPosition = cursorPosition + value.length;
        textAreaCursorPositionRef.current = newCursorPosition;
        textAreaElement.value = newTokenValue;
        textAreaElement.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    const getHelperPaneWithEditorComponent = (): JSX.Element => {
        const helperPanePosition = getHelperPaneWithEditorPosition(containerRef, helperPaneOrigin);
        const arrowPosition = getHelperPaneWithEditorArrowPosition(containerRef, helperPaneOrigin, helperPanePosition);

        return createPortal(
            <S.HelperPane ref={helperPaneContainerRef} sx={{ ...helperPanePosition }}>
                {/* Editor to edit the token */}
                <TextArea ref={textAreaRef} value={tokenValue} onTextChange={setTokenValue} rows={3} />

                {/* Helper pane content */}
                {getHelperPane(handleHelperPaneChange)}

                {/* Action buttons for the helper pane */}
                <S.HelperPaneButtons>
                    <Button appearance="secondary" onClick={handleHelperPaneWithEditorClose}>
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={() =>
                            selectedTokenRef.current
                                ? handleHelperPaneWithEditorEdit()
                                : handleHelperPaneWithEditorSave()
                        }
                    >
                        Save
                    </Button>
                </S.HelperPaneButtons>

                {/* Side arrow of the helper pane */}
                {arrowPosition && <HelperPane.Arrow origin={helperPaneOrigin} sx={{ ...arrowPosition }} />}
            </S.HelperPane>,
            document.body
        );
    };

    const handleHelperPaneToggle = () => {
        changeHelperPaneState?.(!isHelperPaneOpen);
    };

    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection) return;
        const range = selection.getRangeAt(0);

        if (range.startContainer.contains(textAreaRef.current)) {
            // Update cursor position for text area
            textAreaCursorPositionRef.current =
                textAreaRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        }

        if (
            range.startContainer !== editorRef.current &&
            !editorRef.current?.contains(range.startContainer)
        ) {
            // If selection is outside of the editor, do nothing
            return;
        } else if (
            range.startContainer.nodeType === Node.TEXT_NODE ||
            range.startContainer.nodeType === Node.ELEMENT_NODE
        ) {
            currentNodeRef.current = range.startContainer;
            currentNodeOffsetRef.current = range.startOffset;
        } else {
            // Fallback to end of editor if something goes wrong
            const lastChild = editorRef.current?.lastChild;
            if (lastChild) {
                currentNodeRef.current = lastChild;
                currentNodeOffsetRef.current = lastChild.textContent?.length;
            }
        }
    };

    useEffect(() => {
        const handleOutsideClick = async (e: any) => {
            if (
                isFocused &&
                !editorRef.current?.contains(e.target) &&
                !actionButtonsRef.current?.contains(e.target) &&
                !buttonRef.current?.contains(e.target) &&
                !helperPaneContainerRef.current?.contains(e.target)
            ) {
                // Additional actions to be performed when the token editor loses focus
                setIsFocused(false);
                changeHelperPaneState?.(false);
                setTokenValue('');
                selectedTokenRef.current = null;

                onBlur?.();
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onBlur, changeHelperPaneState, buttonRef.current, helperPaneContainerRef.current]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        if (value) {
            setValue(editor, value);
            addEventListeners();
        }

        const onInput = () => handleInput();
        const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e);

        editor.addEventListener('input', onInput);
        editor.addEventListener('keydown', onKeyDown);
        editor.addEventListener('focus', handleFocus);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            editor.removeEventListener('input', onInput);
            editor.removeEventListener('keydown', onKeyDown);
            editor.removeEventListener('focus', onFocus);
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <S.Container ref={containerRef}>
            <S.EditorWithHandle>
                {/* Action buttons at the top of the expression editor */}
                {actionButtons?.length > 0 && (
                    <ActionButtons
                        ref={actionButtonsRef}
                        isHelperPaneOpen={isHelperPaneOpen}
                        actionButtons={actionButtons}
                    />
                )}
                <S.Editor
                    ref={editorRef}
                    isFocused={isFocused}
                    tabIndex={0}
                    contentEditable
                    suppressContentEditableWarning
                />
                <ResizeHandle editorRef={editorRef} />
            </S.EditorWithHandle>
            {getExpressionEditorIcon
                ? getExpressionEditorIcon()
                : (
                    <Button
                        ref={buttonRef}
                        appearance="icon"
                        onClick={handleHelperPaneToggle}
                        tooltip="Open Helper View"
                        {...(isHelperPaneOpen && {
                            sx: { backgroundColor: ThemeColors.PRIMARY, borderRadius: '2px' }
                        })}
                    >
                        <Icon
                            name="function-icon"
                            sx={{
                                height: '19px',
                                width: '17px',
                                ...(isHelperPaneOpen && { color: ThemeColors.ON_PRIMARY })
                            }}
                            iconSx={{ fontSize: '16px' }}
                        />
                    </Button>
                )}
            {isHelperPaneOpen && getHelperPaneWithEditorComponent()}
        </S.Container>
    );
};
