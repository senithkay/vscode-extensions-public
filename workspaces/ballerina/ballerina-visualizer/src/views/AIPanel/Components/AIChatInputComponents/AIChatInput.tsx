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

import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import styled from "@emotion/styled";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import {
    COMMAND_DATAMAP,
    COMMAND_GENERATE,
    COMMAND_TESTS,
    COMMAND_TYPECREATOR,
    COMMAND_NATURAL_PROGRAMMING,
    getFileTypesForCommand,
} from "../../AIChat";
import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import AttachmentBox, { AttachmentsContainer } from "../AttachmentBox";
import { DataMapperAttachment } from "../../../../utils/datamapperAttachment";
import { GenerateAttachment } from "../../../../utils/generateAttachment";
import { TestAttachment } from "../../../../utils/testAttachment";
import { StyledInputComponent, StyledInputRef } from "./StyledInput";

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
    background-color: var(--vscode-dropdown-listBackground);
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
    padding: 6px 12px;
    cursor: pointer;
    background-color: ${(props: SuggestionItemProps) =>
        props.active ? "var(--vscode-editorActionList-focusBackground)" : "var(--vscode-editorActionList-background)"};
    color: ${(props: SuggestionItemProps) =>
        props.active ? "var(--vscode-editorActionList-focusForeground)" : "var(--vscode-editorActionList-foreground)"};

    &:hover {
        background-color: ${(props: SuggestionItemProps) =>
            props.active ? "var(--vscode-editorActionList-focusBackground)" : "var(--vscode-list-hoverBackground)"};
    }
`;

const ActionButton = styled.button`
    width: 24px;
    height: 24px;
    background-color: transparent;
    color: var(--vscode-icon-foreground);
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
        background-color: var(--vscode-toolbar-hoverBackground);
    }

    &:active {
        background-color: var(--vscode-toolbar-activeBackground);
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

// UTIL Functions ----
function decodeHTML(str: string): string {
    const element = document.createElement("div");
    element.innerHTML = str;
    return element.innerText;
}

interface AIChatInputProps {
    value: string;
    baseCommands: Map<string, string[]>;
    onSend: (content: [string, AttachmentResult[]]) => void;
    onStop: () => void;
    isLoading: boolean;
    loadMentions?: (command: string, template: string) => Promise<string[]>;
}

const AIChatInput: React.FC<AIChatInputProps> = ({
    value = "",
    baseCommands,
    onSend,
    onStop,
    isLoading,
    loadMentions,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [activeSuggestionValue, setActiveSuggestionValue] = useState<string | null>(null);
    const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<AttachmentResult[]>([]);
    const [activeCommand, setActiveCommand] = useState<string | null>(null);
    const [mentions, setMentions] = useState<string[]>([]);
    const [isMentionMode, setIsMentionMode] = useState(false);

    const suggestionsRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<StyledInputRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeSuggestionRef = useRef<HTMLLIElement | null>(null);
    const shouldLogCursorAfterUpdate = useRef(false);
    const [commandMode, setCommandMode] = useState<number>(0);

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
            const command = value.slice().split(" ")[0];
            const commandValue = value.split(" ").slice(1).join(" ");
            if (baseCommands.has(command)) {
                setInputValue("");
                selectSuggestion(command);
                if (fileInputRef.current) {
                    setActiveCommand(command);
                    fileInputRef.current.accept = getFileTypesForCommand(command).join(",");
                }

                setInputValue((currentInputValue) => {
                    return currentInputValue + encodeHTML(commandValue);
                });
                setSelectedCommand(null);
            }
        }
    }, [value]);

    useEffect(
        function autoScrollForActiveSuggestionOnList() {
            if (activeSuggestionRef.current) {
                activeSuggestionRef.current.scrollIntoView({
                    block: "nearest",
                    inline: "nearest",
                });
            }
        },
        [activeSuggestionIndex]
    );

    useEffect(
        function resetInputOnEmptyState() {
            if (inputValue === "<br>") {
                setInputValue("");
            }
            if (inputValue === "") {
                setIsMentionMode(false);
            }
        },
        [inputValue]
    );

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

                // Handle @ - Mentions
                handleAtMentions(normalizedValue);
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

    const handleAtMentions = (normalizedValue: string) => {
        const currentCursorPosition = inputRef.current.getCursorPosition();
        const valueUpToCursor = normalizedValue.slice(0, currentCursorPosition);
        const atIndex = valueUpToCursor.lastIndexOf("@");
        if (atIndex !== -1) {
            const query = valueUpToCursor.slice(atIndex + 1).toLowerCase();
            const filteredMentions = mentions.filter((mention) => mention.toLowerCase().startsWith(query));

            setFilteredSuggestions(filteredMentions);
            setShowSuggestions(filteredMentions.length > 0);
            setIsMentionMode(filteredMentions.length > 0);
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
                    if (fileInputRef.current && baseCommands.has(selectedCommand)) {
                        setActiveCommand(selectedCommand);
                        fileInputRef.current.accept = getFileTypesForCommand(selectedCommand).join(",");
                    }
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

        // Replace <div> tags with <badge> tags
        const divRegex = /<div[^>]*>(.*?)<\/div>/gs;
        const badgeTag = `&lt;badge&gt;$1&lt;/badge&gt;`;
        const badgeTaggedMessage = message.replace(divRegex, badgeTag);

        // Send the message and attachments
        onSend([decodeHTML(badgeTaggedMessage), filteredAttachments]);
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
            background: var(--vscode-toolbar-hoverBackground);
            color: var(--vscode-icon-foreground);
            padding: 4px 0;
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

    function mapDecodedIndexToOriginal(html: string, decodedIndex: number): number {
        const tempElement = document.createElement("div");
        tempElement.innerHTML = html;
        const decodedText = tempElement.innerText; // Get decoded text

        let decodedPos = 0;
        let originalPos = 0;

        while (originalPos < html.length && decodedPos < decodedText.length) {
            // Extract the next character in both decoded and original text
            let currentChar = "";
            if (html[originalPos] === "<") {
                // Skip over entire HTML tag
                while (originalPos < html.length && html[originalPos] !== ">") {
                    originalPos++;
                }
                originalPos++; // Move past '>'
                continue;
            } else {
                currentChar = html[originalPos];
            }

            // If this matches the decoded text, track position
            if (currentChar === decodedText[decodedPos]) {
                if (decodedPos === decodedIndex) {
                    return originalPos; // Return corresponding original index
                }
                decodedPos++;
            }

            originalPos++; // Move forward in the original string
        }

        return -1; // Return -1 if index is out of bounds
    }

    // Select suggestion and handle accordingly
    const selectSuggestion = async (suggestion: string) => {
        const encodedSuggestion = encodeHTML(suggestion);

        if (isMentionMode) {
            const currentCursorPosition = inputRef.current.getCursorPosition();
            let decodedIdx = decodeHTML(inputValue).lastIndexOf("@");
            let originalIdx = mapDecodedIndexToOriginal(inputValue, decodedIdx);

            const replaceSubstring = decodeHTML(inputValue).substring(decodedIdx, currentCursorPosition);

            const textBeforeAt = inputValue.substring(0, originalIdx);
            const textAfterAt = inputValue.substring(originalIdx);

            const highlightedBadge = `<div style="
                background: var(--vscode-toolbar-hoverBackground);
                color: var(--vscode-icon-foreground);
                padding: 4px 0;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                line-height: 1;
                font-family: 'Source Code Pro', monospace;
                margin-right: 2px;
            " contentEditable="false">${encodedSuggestion}</div>`;

            setInputValue(textBeforeAt + textAfterAt.replace(replaceSubstring, highlightedBadge));

            setIsMentionMode(false);
            setShowSuggestions(false);
            await new Promise((resolve) => setTimeout(resolve, 0));
            setCommandMode((currentValue) => {
                return currentValue + 1;
            });
            return;
        }

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

            try {
                const loadedMentions = await loadMentions(selectedCommand, suggestion);
                setMentions(loadedMentions);
                setCommandMode((currentValue) => {
                    return currentValue + 1;
                });
            } catch (err) {
                console.error("Error fetching data:", err);
            }
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
        if (suggestion.startsWith("/")) {
            setActiveCommand(suggestion);
        }
    };

    const handleSuggestionMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    function encodeHTML(str: string): string {
        const element = document.createElement("div");
        element.innerText = str;
        return element.innerHTML;
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
            case COMMAND_GENERATE:
            case COMMAND_NATURAL_PROGRAMMING:
                attachmentHandler = new GenerateAttachment(activeCommand);
                break;
            case COMMAND_TESTS:
                attachmentHandler = new TestAttachment(activeCommand);
                break;
            default:
                attachmentHandler = new GenerateAttachment(activeCommand);
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

    const executeOnPostDOMUpdate = () => {
        if (shouldLogCursorAfterUpdate.current) {
            shouldLogCursorAfterUpdate.current = false;
            const cleaned = decodeHTML(inputValue);
            const atPosition = cleaned.indexOf("@");
            if (atPosition !== -1) {
                inputRef.current?.setCursorToPosition(inputRef.current.ref.current, atPosition + 1);
                handleAtMentions(cleaned);
            }
        }
    };

    useEffect(() => {
        setInputValue((currentInputValue) => {
            const updatedValue = inputValue.replace(/&lt;.*?&gt;/, "@");
            return updatedValue;
        });
        shouldLogCursorAfterUpdate.current = true;
    }, [commandMode]);

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
                        onBlur={() => setShowSuggestions(false)}
                        placeholder="Describe your integration..."
                        onPostDOMUpdate={executeOnPostDOMUpdate}
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
                                accept={
                                    activeCommand
                                        ? getFileTypesForCommand(activeCommand).join(",")
                                        : getFileTypesForCommand("").join(",")
                                }
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
                    {filteredSuggestions.map((suggestion, index) => {
                        const isActive = index === activeSuggestionIndex;
                        return (
                            <SuggestionItem
                                key={suggestion}
                                ref={isActive ? activeSuggestionRef : null}
                                active={isActive}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseDown={handleSuggestionMouseDown}
                                role="option"
                                aria-selected={isActive}
                            >
                                {suggestion}
                            </SuggestionItem>
                        );
                    })}
                </SuggestionsList>
            )}
        </Container>
    );
};

export default AIChatInput;
