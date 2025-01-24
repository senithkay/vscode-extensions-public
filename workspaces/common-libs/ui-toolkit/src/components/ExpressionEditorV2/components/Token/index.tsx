/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useEffect } from 'react';
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
    `;

    export const Editor = styled.div<StyleBase>`
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

        &:focus {
            border-color: var(--focus-border);
        }

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
    onChange,
    getHelperPane,
    helperPaneOrigin,
    isHelperPaneOpen,
    changeHelperPaneState
}: TokenEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const helperPaneContainerRef = useRef<HTMLDivElement>(null);

    const handleInput = () => {
        const element = editorRef.current;
        if (!element) return;

        // Extract expressions from the content
        const content = element.innerHTML;
        const transformedContent = transformExpressions(content);

        // Update the value
        onChange?.(extractExpressions(transformedContent));

        if (content !== transformedContent) {
            // Store selection state
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);
            const currentNode = range?.startContainer;
            const currentNodeIndex = Array.from(element.childNodes).indexOf(currentNode as ChildNode);

            // Update content
            element.innerHTML = transformedContent;

            /* Add close event listener to the tokens */
            const tokens = element.querySelectorAll('.expression-token');
            tokens.forEach(token => {
                token.querySelector('.expression-token-close')!.addEventListener('click', e => {
                    e.stopPropagation();
                    token.remove();
                    onChange?.(extractExpressions(element.innerHTML));
                });
            });

            // Restore cursor position
            if (selection && range && currentNode) {
                const newRange = document.createRange();
                const newCurrentNode = element.childNodes[currentNodeIndex + 1];

                try {
                    newRange.setStartAfter(newCurrentNode);
                    newRange.setEndAfter(newCurrentNode);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } catch (e) {
                    // Fallback to end of editor if something goes wrong
                    const lastChild = element.lastChild;
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

    const getHelperPaneComponent = (): JSX.Element => {
        const helperPanePosition = getHelperPanePosition(editorRef, helperPaneOrigin);
        const arrowPosition = getArrowPosition(editorRef, helperPaneOrigin, helperPanePosition);

        return createPortal(
            <S.HelperPane ref={helperPaneContainerRef} sx={{ ...helperPanePosition }}>
                {getHelperPane(value, onChange)}
                {arrowPosition && <HelperPane.Arrow origin={helperPaneOrigin} sx={{ ...arrowPosition }} />}
            </S.HelperPane>,
            document.body
        );
    };

    const handleHelperPaneToggle = () => {
        changeHelperPaneState?.(!isHelperPaneOpen);
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        if (value) {
            setValue(editor, value);
        }

        const onInput = () => handleInput();
        const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e);

        editor.addEventListener('input', onInput);
        editor.addEventListener('keydown', onKeyDown);

        return () => {
            editor.removeEventListener('input', onInput);
            editor.removeEventListener('keydown', onKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <S.Container>
            <S.EditorWithHandle>
                <S.Editor ref={editorRef} contentEditable suppressContentEditableWarning />
                <ResizeHandle editorRef={editorRef} />
            </S.EditorWithHandle>
            <Button
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
            {isHelperPaneOpen && getHelperPaneComponent()}
        </S.Container>
    );
};
