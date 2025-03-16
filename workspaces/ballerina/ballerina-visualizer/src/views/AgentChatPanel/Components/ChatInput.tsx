/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, KeyboardEvent, useCallback } from "react";
import styled from "@emotion/styled";

const Container = styled.div`
    width: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    position: relative;
`;

const FlexRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
`;

/**
 * Updated:
 * - `align-items: center;` so the button is centered vertically
 *   relative to the final height of the textbox.
 */
const InputArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 4px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    cursor: text;

    &:focus-within {
        border-color: var(--vscode-button-background);
    }
`;

const ActionButton = styled.button`
    width: 24px;
    height: 24px;
    background-color: transparent;
    color: var(--vscode-input-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    box-sizing: border-box;

    &:hover {
        background-color: var(--vscode-badge-background);
    }

    &:disabled {
        color: var(--vscode-disabledForeground);
        background-color: transparent;
        cursor: default;
    }

    &:disabled:hover {
        background-color: transparent;
    }
`;

// ----------------------------------------------------
//  Basic content-editable ref
// ----------------------------------------------------
interface StyledInputRef {
    focus: () => void;
}

interface StyledInputProps {
    value: string;
    onChange: (val: string) => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    placeholder: string;
}

const StyledInput = forwardRef<StyledInputRef, StyledInputProps>(({ value, onChange, onKeyDown, placeholder }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);

    // Provide a focus method to parent
    useImperativeHandle(ref, () => ({
        focus: () => {
            divRef.current?.focus();
        },
    }));

    // Keep div's text in sync with parent
    useEffect(() => {
        if (divRef.current && divRef.current.innerText !== value) {
            divRef.current.innerText = value;
        }
    }, [value]);

    // On user input, update parent's state
    const handleInput = useCallback(() => {
        if (divRef.current) {
            onChange(divRef.current.innerText);
        }
    }, [onChange]);

    // Only allow plain-text paste (no HTML)
    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLDivElement>) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");

            // Insert text at caret position
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            // Create a text node and insert it
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);

            // Move caret to end of inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            // Update parent's state
            if (divRef.current) {
                onChange(divRef.current.innerText);
            }
        },
        [onChange]
    );

    return (
        <div
            ref={divRef}
            contentEditable
            spellCheck
            suppressContentEditableWarning
            style={{
                flex: 1,
                outline: "none",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                hyphens: "auto",
                // Limit to about 5 lines:
                lineHeight: "1.4",
                maxHeight: "calc(1.4em * 5)",
                overflowY: "auto",
                // Left-align text:
                textAlign: "left",
            }}
            onInput={handleInput}
            onKeyDown={onKeyDown}
            onPaste={handlePaste}
            data-placeholder={placeholder}
        />
    );
});

interface ChatInputProps {
    /** initial text if any */
    value?: string;
    /** callback when user hits send */
    onSend: (content: string) => void;
    /** callback when user clicks "Stop" */
    onStop: () => void;
    /** show "Stop" instead of "Send"? */
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value = "", onSend, onStop, isLoading }) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<StyledInputRef>(null);

    // Keep internal state in sync with prop `value`
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    /**
     * SHIFT + ENTER => new line
     * ENTER => send
     *
     * We only preventDefault on Enter if shift isn't pressed,
     * so normal typing (including repeated keys) won't be affected.
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            if (!isLoading) {
                e.preventDefault();
                if (inputValue.trim()) {
                    handleSend();
                }
            }
        }
    };

    const handleSend = () => {
        const toSend = inputValue.trim();
        if (!toSend) return;
        onSend(toSend);
        setInputValue("");
    };

    return (
        <Container>
            <FlexRow>
                <InputArea>
                    <StyledInput
                        ref={inputRef}
                        value={inputValue}
                        onChange={setInputValue}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                    />
                    <ActionButton
                        title={isLoading ? "Stop" : "Send"}
                        disabled={!inputValue.trim() && !isLoading}
                        onClick={isLoading ? onStop : handleSend}
                    >
                        <span className={`codicon ${isLoading ? "codicon-stop-circle" : "codicon-send"}`} />
                    </ActionButton>
                </InputArea>
            </FlexRow>
        </Container>
    );
};

export default ChatInput;
