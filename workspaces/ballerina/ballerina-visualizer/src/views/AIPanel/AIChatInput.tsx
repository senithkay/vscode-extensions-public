/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */

import React, {
    useState,
    useRef,
    KeyboardEvent,
    ChangeEvent,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useCallback,
} from "react";
import styled from "@emotion/styled";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { COMMAND_DATAMAP, COMMAND_NATURAL_PROGRAMMING, COMMAND_SCAFFOLD, COMMAND_TESTS, COMMAND_TYPECREATOR, getFileTypesForCommand } from "../AIPanel/AIChat";
import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import AttachmentBox, { AttachmentsContainer } from "./Components/AttachmentBox";
import { DataMapperAttachment } from "../../utils/datamapperAttachment";
import { ScaffoldAttachment } from "../../utils/scaffoldAttachment";
import { TestAttachment } from "../../utils/testAttachment";

// Styled Components

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const FlexRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch; /* Ensures both children stretch to the same height */
`;

// Add this styled component for the action row
const ActionRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

// Modify InputArea to have flex-direction: column
const InputArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    cursor: text;
    flex: 1;

    &:focus-within {
        border-color: var(--vscode-button-background);
    }
`;

const SuggestionsList = styled.ul`
    position: absolute;
    bottom: 100%;
    left: 0;
    background-color: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    list-style: none;
    padding: 0;
    margin: 4px 0 0 0;
    max-height: 150px;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
    z-index: 1000;
`;

// Suggestion item styling
interface SuggestionItemProps {
    active: boolean;
}

const SuggestionItem = styled.li<SuggestionItemProps>`
    padding: 8px 12px;
    cursor: pointer;
    background-color: ${(props: SuggestionItemProps) =>
        props.active ? "var(--vscode-list-activeSelectionBackground)" : "var(--vscode-editor-background)"};
    color: ${(props: SuggestionItemProps) =>
        props.active ? "var(--vscode-list-activeSelectionForeground)" : "var(--vscode-editor-foreground)"};
`;

const ActionButton = styled.button`
    width: 24px;
    height: 24px;
    background-color: transparent;
    color: var(--vscode-input-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 4px;
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

// ---------- STYLED INPUT ----------
// Styled input to blend with the InputArea and remove its own outline
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

interface StyledInputRef {
    focus: () => void;
    ref: React.RefObject<HTMLDivElement>;
}

interface StyledInputProps {
    value: string;
    onChange: (value: string) => void;
    onInput: (e: React.ChangeEvent<HTMLDivElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    placeholder: string;
}

const StyledInputComponent = forwardRef<StyledInputRef, StyledInputProps>(
    ({ value, onChange, onInput, onKeyDown, placeholder }, ref) => {
        const [content, setContent] = useState<string>(value);
        const [isFocused, setIsFocused] = useState<boolean>(false);
        const divRef = useRef<HTMLDivElement>(null);

        // Expose the focus, bold, and highlight methods to parent components
        useImperativeHandle(ref, () => ({
            focus: () => {
                if (divRef.current) {
                    divRef.current.focus();
                    setCursorToEnd(divRef.current);
                }
            },
            ref: divRef,
        }));

        // Function to set the cursor to the end of the content
        const setCursorToEnd = (element: HTMLDivElement) => {
            const range = document.createRange();
            const selection = window.getSelection();

            if (element.childNodes.length > 0) {
                range.setStart(element, element.childNodes.length);
            } else {
                range.setStart(element, 0);
            }

            range.collapse(true); // Collapse the range to the end point
            selection?.removeAllRanges();
            selection?.addRange(range);
        };

        const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");

            const selection = window.getSelection();
            if (!selection || !divRef.current) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            const textNode = document.createTextNode(text);
            range.insertNode(textNode);

            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            const newValue = divRef.current.innerText;
            setContent(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }, []);

        // Sync prop `value` with internal state
        useEffect(() => {
            if (divRef.current && divRef.current.innerHTML !== content) {
                divRef.current.innerHTML = content;
                setCursorToEnd(divRef.current);
            }
        }, [content]);

        // Update content when `value` prop changes
        useEffect(() => {
            if (value !== content) {
                setContent(value);
            }
        }, [value, content]);

        // Handle input changes
        const handleInput = (event: React.ChangeEvent<HTMLDivElement>) => {
            if (divRef.current) {
                const html = divRef.current.innerHTML;
                setContent(html);
                if (onChange) {
                    onChange(html);
                }
            }
            onInput(event);
        };

        return (
            <StyledInput
                ref={divRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={onKeyDown}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
                role="textbox"
                aria-multiline="true"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-placeholder={placeholder}
            />
        );
    }
);

interface AIChatInputProps {
    value: string;
    baseCommands: Map<string, string[]>;
    onSend: (content: [string, AttachmentResult[]]) => void;
    onStop: () => void;
    isLoading: boolean;
}

const AIChatInput: React.FC<AIChatInputProps> = ({ value = "", baseCommands, onSend, onStop, isLoading }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [activeSuggestionValue, setActiveSuggestionValue] = useState<string | null>(null);
    const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<AttachmentResult[]>([]);
    const [activeCommand, setActiveCommand] = useState<string | null>(null);

    const suggestionsRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<StyledInputRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const setActiveSuggestion = (newIndex: number, suggestionList: string[]) => {
        setActiveSuggestionIndex(newIndex);
        setActiveSuggestionValue(suggestionList[newIndex] || null);
    };

    // Sync prop `value` with internal state
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (value.startsWith("/")) {
            const command = value.slice().split(' ')[0];
            const commandValue = value.split(' ').slice(1).join(' ');
            if (baseCommands.has(command)) {
                setInputValue("");
                selectSuggestion(command);

                setInputValue((currentInputValue) => {
                    return currentInputValue + encodeHTML(commandValue);
                });
                setSelectedCommand(null);
            }
        }
    }, [value]);

    // Handle input changes
    const handleInputChange = (event: ChangeEvent<HTMLDivElement>) => {
        const value = event.target.innerText;
        const normalizedValue = value.replace(/\u00A0/g, " ");
        const htmlValue = event.target.innerHTML;

        let filtered: string[] = [];

        if (selectedCommand) {
            // Show suggestions based on the selected command's value array
            const commandValues = baseCommands.get(selectedCommand) || [];
            const query = normalizedValue.toLowerCase();
            filtered = commandValues.filter((item) => {
                return item.toLowerCase().startsWith(query.substring(selectedCommand.length + 1));
            });
        } else {
            // Show command suggestions only if input starts with '/' and no badges are present
            if (normalizedValue.startsWith("/") && !htmlValue.startsWith("<div")) {
                const query = normalizedValue.toLowerCase();
                const allCommands = Array.from(baseCommands.keys());
                filtered = allCommands.filter((command) => command.toLowerCase().startsWith(query));
            } else {
                setShowSuggestions(false);
                setFilteredSuggestions([]);
                setActiveSuggestionIndex(0);
                setActiveSuggestionValue(null);
                return;
            }
        }

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);

        // Update activeSuggestionIndex and activeSuggestionValue
        if (filtered.length > 0) {
            if (activeSuggestionValue && filtered.includes(activeSuggestionValue)) {
                const newIndex = filtered.indexOf(activeSuggestionValue);
                setActiveSuggestion(newIndex, filtered);
            } else {
                setActiveSuggestion(0, filtered);
            }
        } else {
            setActiveSuggestionIndex(0);
            setActiveSuggestionValue(null);
        }
    };

    // Handle key down events
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Backspace" && inputValue.endsWith("</div>")) {
            if (selectedCommand) {
                setSelectedCommand(null);
                setShowSuggestions(false);
            }
        } else if (showSuggestions) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                const newIndex = activeSuggestionIndex + 1 < filteredSuggestions.length ? activeSuggestionIndex + 1 : 0;
                setActiveSuggestion(newIndex, filteredSuggestions);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const newIndex =
                    activeSuggestionIndex - 1 >= 0 ? activeSuggestionIndex - 1 : filteredSuggestions.length - 1;
                setActiveSuggestion(newIndex, filteredSuggestions);
            } else if (
                event.key === "Enter" ||
                event.key === "Tab" ||
                (event.key === " " && inputValue.trim() && baseCommands.has(inputValue.trim()))
            ) {
                event.preventDefault();
                if (filteredSuggestions.length > 0) {
                    selectSuggestion(filteredSuggestions[activeSuggestionIndex]);
                }
            } else if (event.key === "Escape") {
                setShowSuggestions(false);
            }
        } else if (event.key === "Enter" && !event.shiftKey && !isLoading) {
            event.preventDefault();
            if (inputValue.trim() !== "") {
                handleSend();
            }
        } else if (event.key === "Escape" && isLoading) {
            event.preventDefault();
            handleStop();
        }
    };

    // Handle sending the message
    const handleSend = () => {
        const message = inputValue.trim();
        const filteredAttachments = attachments.filter((attachment) => attachment.status === AttachmentStatus.Success);
        onSend([decodeHTML(message), filteredAttachments]);
        setInputValue("");
        setAttachments([]);
        setShowSuggestions(false);
        setSelectedCommand(null);
    };

    const handleStop = () => {
        onStop();
    };

    const handleCommandClick = () => {
        setInputValue("/");

        const query = inputValue.toLowerCase();
        const allCommands = Array.from(baseCommands.keys());
        const filtered = allCommands.filter((command) => command.toLowerCase().startsWith(query));

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);

        // Update activeSuggestionIndex and activeSuggestionValue
        if (filtered.length > 0) {
            if (activeSuggestionValue && filtered.includes(activeSuggestionValue)) {
                const newIndex = filtered.indexOf(activeSuggestionValue);
                setActiveSuggestion(newIndex, filtered);
            } else {
                setActiveSuggestion(0, filtered);
            }
        } else {
            setActiveSuggestionIndex(0);
            setActiveSuggestionValue(null);
        }
    };

    // Add badge (for commands only)
    const addBadge = (badge: string) => {
        const highlightedBadge = `<div style="
            background-color: var(--vscode-editorWidget-background);
            color: var(--vscode-editorWidget-foreground);
            padding: 4px;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            line-height: 1;
            font-family: 'Source Code Pro', monospace;
            margin-right: 2px;
        " contentEditable="false">${badge}</div> `;

        setInputValue((currentInputValue) => {
            const maxOverlap = Math.min(currentInputValue.length, badge.length);

            for (let i = maxOverlap; i > 0; i--) {
                if (currentInputValue.endsWith(badge.substring(0, i))) {
                    return currentInputValue.slice(0, currentInputValue.length - i) + highlightedBadge;
                }
            }

            return currentInputValue + highlightedBadge;
        });

        // Focus the editable div and move cursor to the end
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setShowSuggestions(false);
    };

    // Select suggestion and handle accordingly
    const selectSuggestion = (suggestion: string) => {
        const encodedSuggestion = encodeHTML(suggestion);
        if (selectedCommand) {
            // If a command is already selected, treat the suggestion as a value
            setInputValue((currentInputValue) => {
                const maxOverlap = Math.min(currentInputValue.length, encodedSuggestion.length);

                for (let i = maxOverlap; i > 0; i--) {
                    if (currentInputValue.endsWith(encodedSuggestion.substring(0, i))) {
                        return currentInputValue.slice(0, currentInputValue.length - i) + encodedSuggestion;
                    }
                }

                return currentInputValue + encodedSuggestion;
            });
            setSelectedCommand(null); // Reset selected command
            setShowSuggestions(false); // Dismiss the suggestion list
        } else {
            // Treat the suggestion as a command
            addBadge(encodedSuggestion);
            setSelectedCommand(encodedSuggestion); // Set the selected command
        }

        // Focus the input field for continued typing
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        selectSuggestion(suggestion);
        if(suggestion.startsWith("/")){
            setActiveCommand(suggestion);
        }
    };

    function encodeHTML(str: string): string {
        const element = document.createElement("div");
        element.innerText = str;
        return element.innerHTML;
    }

    function decodeHTML(str: string): string {
        const element = document.createElement("div");
        element.innerHTML = str;
        return element.innerText;
    }

    // useEffect to handle showing second suggestion list
    useEffect(() => {
        if (selectedCommand) {
            // Automatically show the suggestion list for the selected command
            const commandValues = baseCommands.get(selectedCommand) || [];
            setFilteredSuggestions(commandValues);
            setShowSuggestions(commandValues.length > 0);
            setActiveSuggestionIndex(0);
        }
    }, [selectedCommand, baseCommands]);

    const handleAttachClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelection = async (e: ChangeEvent<HTMLInputElement>) => {
        let attachmentHandler;
        switch (activeCommand) {
            case COMMAND_DATAMAP:
            case COMMAND_TYPECREATOR:
                attachmentHandler = new DataMapperAttachment(activeCommand);
                break;
            case COMMAND_SCAFFOLD:
            case COMMAND_NATURAL_PROGRAMMING:
                attachmentHandler = new ScaffoldAttachment(activeCommand);
                break;
            case COMMAND_TESTS:
                attachmentHandler = new TestAttachment(activeCommand);
                break;
            default:
                attachmentHandler = new ScaffoldAttachment(activeCommand); 
        }
        const results = await attachmentHandler.handleFileAttach(e);
        setAttachments((prevAttachments) => {
            const updatedAttachments = [...prevAttachments];

            results.forEach((newFile: AttachmentResult) => {
                const existingIndex = updatedAttachments.findIndex(
                    (existingFile) => existingFile.name === newFile.name && existingFile.content === newFile.content
                );

                if (existingIndex !== -1) {
                    updatedAttachments.splice(existingIndex, 1);
                }
                updatedAttachments.push(newFile);
            });

            return updatedAttachments;
        });
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Container ref={containerRef}>
            <FlexRow>
                <InputArea>
                    <StyledInputComponent
                        ref={inputRef}
                        value={inputValue}
                        onChange={setInputValue}
                        onInput={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask BI Copilot"
                    />
                    {/* 3. Attachments Display */}
                    {attachments.length > 0 && (
                        <AttachmentsContainer>
                            {attachments.map((file, index) => (
                                <AttachmentBox
                                    key={index}
                                    status={file.status}
                                    fileName={file.name}
                                    index={index}
                                    removeAttachment={removeAttachment}
                                />
                            ))}
                        </AttachmentsContainer>
                    )}

                    <ActionRow>
                        <div style={{ display: "flex" }}>
                            <ActionButton
                                title="Chat with Command"
                                disabled={inputValue !== ""}
                                onClick={handleCommandClick}
                            >
                                /
                            </ActionButton>
                            <input
                                type="file"
                                multiple
                                accept={activeCommand ? getFileTypesForCommand(activeCommand).join(",") : getFileTypesForCommand("").join(",")}
                                style={{ display: "none" }}
                                ref={fileInputRef}
                                onChange={handleFileSelection}
                            />
                            <ActionButton title="Attach Context" onClick={handleAttachClick}>
                                <Codicon name="new-file" />
                            </ActionButton>
                        </div>
                        <div>
                            <ActionButton
                                title={isLoading ? "Stop (Escape)" : "Send (Enter)"}
                                disabled={inputValue.trim() === "" && !isLoading}
                                onClick={isLoading ? handleStop : handleSend}
                            >
                                <span
                                    className={`codicon ${isLoading ? "codicon-stop-circle" : "codicon-send"}`}
                                ></span>
                            </ActionButton>
                        </div>
                    </ActionRow>
                </InputArea>
            </FlexRow>
            {showSuggestions && (
                <SuggestionsList ref={suggestionsRef} role="listbox">
                    {filteredSuggestions.map((suggestion, index) => (
                        <SuggestionItem
                            key={suggestion}
                            active={index === activeSuggestionIndex}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setActiveSuggestion(index, filteredSuggestions)}
                            role="option"
                            aria-selected={index === activeSuggestionIndex}
                        >
                            {suggestion}
                        </SuggestionItem>
                    ))}
                </SuggestionsList>
            )}
        </Container>
    );
};

export default AIChatInput;
