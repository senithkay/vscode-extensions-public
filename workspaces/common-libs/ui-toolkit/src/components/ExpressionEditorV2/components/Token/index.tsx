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
import { StyleBase } from '../Common/types';
import { ResizeHandle } from './ResizeHandle';
import {
    extractExpressions,
    setValue,
    transformExpressions,
    getArrowPosition,
    getHelperPanePosition
} from '../../utils';
import { TokenEditorProps } from '../../types';
import { Icon } from '../../../Icon/Icon';
import { Button } from '../../../Button/Button';
import HelperPane from '../Common/HelperPane';
import { ThemeColors } from '../../../../styles/ThemeColours';
import { Codicon } from '../../../Codicon/Codicon';

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

    export const ActionButtons = styled.div`
        position: absolute;
        top: -14px;
        right: 0;
        display: flex;
        gap: 4px;
    `

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
            padding-left: 4px;
            border-radius: 2px;
            margin: 0 4px;
            display: inline-block;
            user-select: none;
        }

        .expression-token-close {
            cursor: pointer;
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

        .normal-text {
            display: inline-block;
            margin: 0;
            padding: 0;
            font-family: inherit;
            min-width: 1px; /* Ensures cursor is visible in empty paragraphs */
        }

        /* Remove extra spacing between p elements */
        p {
            margin: 0;
            padding: 0;
        }

        ${(props: StyleBase) => props.sx};
    `;

    export const HelperPane = styled.div<StyleBase>`
        position: absolute;
        z-index: 2001;
        filter: drop-shadow(0 3px 8px rgb(0 0 0 / 0.2));
        ${(props: StyleBase) => props.sx}

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
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
    const editorRef = useRef<HTMLDivElement>(null);
    const actionButtonsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const helperPaneContainerRef = useRef<HTMLDivElement>(null);
    const currentNodeRef = useRef<Node | null>(null);
    const currentNodeOffsetRef = useRef<number | null>(null);

    const addCloseEventListeners = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const tokens = editor.querySelectorAll('.expression-token');
        tokens.forEach(token => {
            token.querySelector('.expression-token-close')!.addEventListener('click', e => {
                e.stopPropagation();
                token.remove();
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

            /* Add close event listener to the tokens */
            addCloseEventListeners();

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

    const handleHelperPaneChange = (value: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection) return;

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
            .parseFromString(transformExpressions(`\${${value}}`), 'text/html')
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
        
        // Add close event listener to the tokens
        addCloseEventListeners();

        // Update the value
        onChange?.(extractExpressions(editor.innerHTML));
    };

    const getHelperPaneComponent = (): JSX.Element => {
        const helperPanePosition = getHelperPanePosition(editorRef, helperPaneOrigin);
        const arrowPosition = getArrowPosition(editorRef, helperPaneOrigin, helperPanePosition);

        return createPortal(
            <S.HelperPane ref={helperPaneContainerRef} sx={{ ...helperPanePosition }}>
                {getHelperPane(value, handleHelperPaneChange)}
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
            addCloseEventListeners();
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
        <S.Container>
            <S.EditorWithHandle>
                {/* Action buttons at the top of the expression editor */}
                {actionButtons?.length > 0 && (
                    <S.ActionButtons ref={actionButtonsRef}>
                        {actionButtons.map((actBtn, index) => {
                            let icon: React.ReactNode;
                            if (actBtn.iconType === 'codicon') {
                                icon = (
                                    <Codicon
                                        key={index}
                                        name={actBtn.name}
                                        iconSx={{
                                            fontSize: "12px",
                                            color: isHelperPaneOpen
                                                ? "var(--vscode-button-foreground)"
                                                : "var(--vscode-button-background)",
                                        }}
                                        sx={{ height: '14px', width: '16px' }}
                                    />
                                );
                            } else {
                                icon = (
                                    <Icon
                                        key={index}
                                        name={actBtn.name}
                                        iconSx={{
                                            fontSize: '12px',
                                            color: isHelperPaneOpen
                                                ? 'var(--vscode-button-foreground)'
                                                : 'var(--vscode-button-background)',
                                        }}
                                        sx={{ height: '14px', width: '16px' }}
                                    />
                                );
                            }
                            
                            return (
                                <Button
                                    key={index}
                                    tooltip={actBtn.tooltip}
                                    onClick={actBtn.onClick}
                                    appearance='icon'
                                    buttonSx={{
                                        height: '14px',
                                        width: '22px',
                                        ...(isHelperPaneOpen && {
                                            backgroundColor: 'var(--vscode-button-background)',
                                            borderRadius: '2px',
                                        })
                                    }}
                                >
                                    {icon}
                                </Button>
                            )
                        })}
                    </S.ActionButtons>
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
            {isHelperPaneOpen && getHelperPaneComponent()}
        </S.Container>
    );
};
