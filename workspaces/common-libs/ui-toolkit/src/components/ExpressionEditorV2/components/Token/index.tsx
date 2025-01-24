/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { StyleBase } from '../Common/types';
import { ResizeHandle } from './ResizeHandle';
import { transformExpressions } from '../../utils/token';

const handleInput = (element: HTMLDivElement) => {
    const content = element.innerHTML;
    const transformedContent = transformExpressions(content);

    if (content !== transformedContent) {
        // Store selection state
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const currentNode = range?.startContainer;
        const currentNodeIndex = Array.from(element.childNodes).indexOf(currentNode as ChildNode);

        // Update content
        element.innerHTML = transformedContent;

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
    }
};

/* Styles */
namespace S {
    export const Container = styled.div`
        position: relative;
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
        font-family: monospace;
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

        &:focus {
            border-color: var(--focus-border);
        }

        .expression-token {
            background-color: lightgreen;
            padding: 0 4px;
            border-radius: 2px;
            margin: 0 2px;
            display: inline-block;
            user-select: none; // Prevent selection of token content
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
}

export const TokenEditor = () => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const onInput = () => handleInput(editor);
        const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e);

        editor.addEventListener('input', onInput);
        editor.addEventListener('keydown', onKeyDown);

        return () => {
            editor.removeEventListener('input', onInput);
            editor.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <S.Container>
            <S.Editor ref={editorRef} contentEditable suppressContentEditableWarning />
            <ResizeHandle editorRef={editorRef} />
        </S.Container>
    );
};
