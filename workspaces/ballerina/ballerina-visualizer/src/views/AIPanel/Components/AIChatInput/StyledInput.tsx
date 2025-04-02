/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */

import React, {
    forwardRef,
    useRef,
    useState,
    useCallback,
    useImperativeHandle,
    useLayoutEffect,
    useEffect,
} from "react";
import styled from "@emotion/styled";
import { decodeHTML } from "./utils";

const StyledInput = styled.div`
    flex: 1;
    border: none;
    background: transparent;
    color: var(--vscode-inputForeground);
    font-size: 1em;
    line-height: calc(1em + 8px);
    padding: 4px;
    outline: none;
    white-space: pre-wrap;
    overflow-y: auto;
    max-height: calc(1em * 8);
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;

    &:focus {
        outline: none;
        box-shadow: none;
        border: none;
        background: transparent;
    }

    &:empty:before {
        content: attr(data-placeholder);
        color: var(--vscode-input-placeholderForeground);
        pointer-events: none;
        display: block;
    }

    ::selection {
        background: var(--vscode-editor-selectionBackground);
        color: var(--vscode-editor-selectionForeground);
    }
`;

export interface StyledInputRef {
    focus: () => void;
    getCursorPosition: () => number;
    setCursorToPosition: (element: HTMLDivElement, position: number) => void;
    ref: React.RefObject<HTMLDivElement>;
}

interface StyledInputProps {
    value: string;
    onChange: (value: string) => void;
    onInput: (e: React.ChangeEvent<HTMLDivElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
    placeholder: string;
    onPostDOMUpdate?: () => void;
}

export const StyledInputComponent = forwardRef<StyledInputRef, StyledInputProps>(
    ({ value, onChange, onInput, onKeyDown, onBlur, placeholder, onPostDOMUpdate }, ref) => {
        const [internalContent, setInternalContent] = useState<string>(value);
        const divRef = useRef<HTMLDivElement>(null);

        /**
         * Returns the current cursor position (number of characters from start).
         */
        const getCursorPosition = useCallback(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                if (divRef.current) {
                    preCaretRange.selectNodeContents(divRef.current);
                }
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                return preCaretRange.toString().length;
            }
            return 0;
        }, []);

        /**
         * Moves cursor to the specified `position` within `element`.
         */
        const setCursorToPosition = useCallback((element: HTMLDivElement, position: number) => {
            const range = document.createRange();
            const selection = window.getSelection();

            // Clamp the position.
            const maxLength = element.textContent?.length ?? 0;
            position = Math.max(Math.min(position, maxLength), 0);

            let currentPos = 0;
            let found = false;

            for (const node of element.childNodes) {
                const nodeTextLength = node.textContent?.length ?? 0;

                // If the position is inside this node
                if (currentPos + nodeTextLength >= position) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        range.setStart(node, position - currentPos);
                    } else {
                        range.setStart(node, Math.min(position - currentPos, node.childNodes.length));
                    }
                    found = true;
                    break;
                }
                currentPos += nodeTextLength;
            }

            // If position exceeds total text, place cursor at the end.
            if (!found) {
                range.setStart(element, element.childNodes.length);
            }

            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }, []);

        /**
         * Focus the content-editable div.
         */
        const focusDiv = useCallback(() => {
            divRef.current?.focus();
        }, []);

        /**
         * Expose methods to parent via ref.
         */
        useImperativeHandle(
            ref,
            () => ({
                focus: focusDiv,
                getCursorPosition,
                setCursorToPosition,
                ref: divRef,
            }),
            [focusDiv, getCursorPosition, setCursorToPosition]
        );

        /**
         * Handle paste events to ensure only plain text is inserted.
         */
        const handlePaste = useCallback(
            (event: React.ClipboardEvent<HTMLDivElement>) => {
                event.preventDefault();
                const text = event.clipboardData.getData("text/plain");

                const selection = window.getSelection();
                if (!selection || !divRef.current) return;

                const range = selection.getRangeAt(0);
                range.deleteContents();

                const textNode = document.createTextNode(text);
                range.insertNode(textNode);

                // Move cursor after newly inserted text node
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                // Update internal state and call onChange
                const newValue = divRef.current.innerHTML;
                setInternalContent(newValue);
                onChange?.(newValue);
            },
            [onChange]
        );

        /**
         * Whenever the internal content changes, reflect it in the DOM,
         * and preserve the cursor position.
         *
         * Using `useLayoutEffect` so cursor changes happen before paint.
         */
        useLayoutEffect(() => {
            if (!divRef.current) return;

            // Only update if there is an actual difference:
            if (divRef.current.innerHTML !== internalContent) {
                const prevCursorPos = getCursorPosition();
                const oldDecoded = decodeHTML(divRef.current.innerHTML);
                const newDecoded = decodeHTML(internalContent);

                // Calculate difference in length to adjust cursor position.
                // This is a naive approach which often works for text differences.
                const diff = newDecoded.length - oldDecoded.length;

                divRef.current.innerHTML = internalContent;
                setCursorToPosition(divRef.current, prevCursorPos + diff + 1);
            }

            if (typeof onPostDOMUpdate === "function") {
                onPostDOMUpdate();
            }

        }, [internalContent, getCursorPosition, setCursorToPosition]);

        /**
         * Keep internal state up to date with the `value` prop.
         */
        useEffect(() => {
            if (value !== internalContent) {
                setInternalContent(value);
            }
        }, [value, internalContent]);

        /**
         * Handle user typing, update internal state, and propagate changes upward.
         */
        const handleInput = useCallback(
            (event: React.ChangeEvent<HTMLDivElement>) => {
                if (divRef.current) {
                    const html = divRef.current.innerHTML;
                    setInternalContent(html);
                    onChange?.(html);
                }
                onInput(event);
            },
            [onChange, onInput]
        );

        return (
            <StyledInput
                ref={divRef}
                contentEditable
                spellCheck="true"
                onInput={handleInput}
                onKeyDown={onKeyDown}
                onPaste={handlePaste}
                onBlur={onBlur}
                suppressContentEditableWarning={true}
                role="textbox"
                aria-multiline="true"
                data-placeholder={placeholder}
            />
        );
    }
);
