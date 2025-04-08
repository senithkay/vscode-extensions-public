/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useRef, KeyboardEvent, useEffect, useLayoutEffect } from "react";
import styled from "@emotion/styled";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import AttachmentBox, { AttachmentsContainer } from "../AttachmentBox";
import { StyledInputComponent, StyledInputRef } from "./StyledInput";
import { AttachmentOptions, useAttachments } from "./hooks/useAttachments";
import { Suggestion, SuggestionType, useCommands } from "./hooks/useCommands";
import { BadgeType } from "../Badge";
import { Input } from "./utils/input";
import SuggestionsList from "./SuggestionsList";
import { Command } from "../../commandTemplates/models/command.enum";
import { CommandTemplates } from "../../commandTemplates/data/commandTemplates.const";
import { Tag } from "../../commandTemplates/models/tag.model";
import { getFirstOccurringPlaceholder, matchCommandTemplate } from "./utils/utils";
import { getAllCommands, getTags, getTemplateDefinitionsByCommand } from "../../commandTemplates/utils/utils";
import { PlaceholderTagMap } from "../../commandTemplates/data/placeholderTags.const";

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

const ActionRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

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

interface TagOptions {
    placeholderTags: PlaceholderTagMap;
    loadGeneralTags: () => Promise<Tag[]>;
    injectPlaceholderTags: (command: Command, templateId: string) => Promise<void>;
}

interface AIChatInputProps {
    initialCommandTemplate: CommandTemplates;
    getInitialInput: () => { command: Command; templateId?: string } | string;
    tagOptions: TagOptions;
    attachmentOptions: AttachmentOptions;
    onSend: (content: [Input[], AttachmentResult[]]) => void;
    onStop: () => void;
    isLoading: boolean;
}

const AIChatInput: React.FC<AIChatInputProps> = ({
    initialCommandTemplate,
    getInitialInput,
    tagOptions,
    attachmentOptions,
    onSend,
    onStop,
    isLoading,
}) => {
    const [inputValue, setInputValue] = useState<{
        text: string;
        [key: string]: any;
    }>({
        text: "",
    });
    const [generalTags, setGeneralTags] = useState<Tag[]>([]);
    const [placeholderTagsRefreshKey, setPlaceholderTagsRefreshKey] = useState<number>(0);

    // Refs
    const inputRef = useRef<StyledInputRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeSuggestionRef = useRef<HTMLLIElement | null>(null);

    // custom hooks: commands + attachments
    const {
        filteredSuggestions,
        activeSuggestionIndex,
        activeCommand,
        setActiveCommand,
        handleSuggestionOnTextChange,
        setActiveSuggestion,
        completeSuggestionSelection,
    } = useCommands({
        commandTemplate: initialCommandTemplate,
    });

    const {
        attachments,
        fileInputRef,
        handleAttachClick,
        onAttachmentSelection,
        removeAttachment,
        removeAllAttachments,
    } = useAttachments({
        attachmentOptions: attachmentOptions,
        activeCommand,
    });

    /**
     * Effect: Initialize general tags on mount
     */
    useEffect(() => {
        const fetchGeneralTags = async () => {
            const generalTags = await tagOptions.loadGeneralTags();
            setGeneralTags(generalTags);
        };

        fetchGeneralTags();
    }, []);

    /**
     * Effect: On mount, check if there's an initial input (command or plain string).
     */
    useEffect(() => {
        const initialInput = getInitialInput();

        requestAnimationFrame(async () => {
            if (!inputRef.current || !inputRef.current.ref?.current) return;

            // If it's a string, just set it
            if (typeof initialInput === "string") {
                setInputValue({ text: initialInput });
                inputRef.current.focus();
                return;
            }

            // If it's an object { command, templateId? }, insert the command as a badge
            inputRef.current.setCursorToPosition(inputRef.current.ref.current, 0);
            insertCommand(initialInput.command, " ", { initialCommand: true });
            setActiveCommand(initialInput.command);
        });
    }, []);

    /**
     * Effect: Auto-clean up input if it only has "<br>" or no text.
     */
    useEffect(
        function removeInputValueOnBRTag() {
            if (!inputValue.text || inputValue.text === "<br>") {
                setInputValue((prev) => ({ ...prev, text: "" }));
                setActiveCommand(null);
            }
        },
        [inputValue.text]
    );

    /**
     * Effect: Handles text changes in the input field and updates suggestions or placeholders accordingly.
     * This effect is triggered whenever the input value changes.
     */
    useLayoutEffect(() => {
        const id = requestAnimationFrame(async () => {
            const text = inputRef.current.ref.current.innerText;
            const html = inputRef.current.ref.current.innerHTML;
            const templateInserted = inputValue.templateInserted || false;
            const tagInserted = inputValue.tagInserted || false;
            const isInitialCommand = inputValue.initialCommand || false;
            const currentCursorPosition = inputRef.current.getCursorPosition();
            const isCursorNextToDiv = inputRef.current.isCursorNextToDiv();
            handleSuggestionOnTextChange(
                initialCommandTemplate,
                tagOptions.placeholderTags,
                isCursorNextToDiv,
                text,
                html,
                templateInserted,
                currentCursorPosition,
                generalTags
            );

            if (activeCommand && (templateInserted || tagInserted)) {
                const templateQuery = text.substring(activeCommand.length + 1);
                const matchResult = matchCommandTemplate(
                    templateQuery,
                    getTemplateDefinitionsByCommand(initialCommandTemplate, activeCommand)
                );
                if (matchResult) {
                    const { match, template } = matchResult;
                    const placeholderDefs = template.placeholders;
                    const firstPlaceholderDef = getFirstOccurringPlaceholder(templateQuery, placeholderDefs);
                    if (firstPlaceholderDef) {
                        const tags = getTags(activeCommand, template.id, firstPlaceholderDef.id);
                        if (tags && tags.length > 0) {
                            inputRef.current.replaceTextWith(firstPlaceholderDef.text, "@");
                        } else {
                            inputRef.current.selectText(firstPlaceholderDef.text);
                        }
                    }
                }
            }

            if (isInitialCommand) {
                const initialInput = getInitialInput();

                if (typeof initialInput !== "string" && initialInput.templateId) {
                    const { command, templateId } = initialInput;

                    const template = getTemplateDefinitionsByCommand(initialCommandTemplate, activeCommand).find(
                        (template) => template.id === templateId
                    );

                    if (template) {
                        inputRef.current?.insertTextAtCursor({ text: template.text, templateInserted: true });

                        await tagOptions.injectPlaceholderTags(activeCommand, template.id);
                        setPlaceholderTagsRefreshKey(prev => prev + 1)
                    }
                }
            }
        });

        return () => cancelAnimationFrame(id);
    }, [inputValue, placeholderTagsRefreshKey]);

    /**
     * Effect: If the user navigates suggestions with keyboard, keep the active suggestion visible.
     */
    useLayoutEffect(
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

    /**
     * Inserts a command badge at the current cursor position in the input field.
     */
    const insertCommand = (command: Command, suffix: string, additionalProps?: { [key: string]: any }) => {
        inputRef.current?.insertBadgeAtCursor({
            badgeText: command,
            badgeType: BadgeType.Command,
            suffixText: " ",
            ...additionalProps,
        });
        setActiveCommand(command);
        fileInputRef.current.accept = attachmentOptions.acceptResolver(command);
    };

    /**
     * Called after we select a suggestion from the list (click or keyboard).
     */
    const selectSuggestion = async (suggestion: Suggestion) => {
        // complete suggestion selection
        completeSuggestionSelection();

        if (suggestion.type === SuggestionType.Command) {
            insertCommand(suggestion.command, " ");
        }

        // insert the selected suggestion (Template)
        if (suggestion.type === SuggestionType.Template) {
            inputRef.current?.insertTextAtCursor({ text: suggestion.text, templateInserted: true });

            // load placeholder tags
            await tagOptions.injectPlaceholderTags(activeCommand, suggestion.templateId);
            setPlaceholderTagsRefreshKey(prev => prev + 1)
        }

        // insert the selected suggestion (Tag)
        if (suggestion.type === SuggestionType.Tag) {
            inputRef.current?.insertBadgeAtCursor({
                badgeText: suggestion.text,
                badgeType: BadgeType.Tag,
                suffixText: "",
                tagInserted: true,
            });
        }
    };

    /**
     * Handler for key down events in the contentEditable.
     * - Navigates or selects suggestions
     * - Sends message on Enter
     * - Stops on Escape
     */
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (filteredSuggestions.length > 0) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                const newIndex = activeSuggestionIndex + 1 < filteredSuggestions.length ? activeSuggestionIndex + 1 : 0;
                setActiveSuggestion(newIndex, filteredSuggestions);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const newIndex =
                    activeSuggestionIndex - 1 >= 0 ? activeSuggestionIndex - 1 : filteredSuggestions.length - 1;
                setActiveSuggestion(newIndex, filteredSuggestions);
            } else if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                if (filteredSuggestions.length > 0) {
                    selectSuggestion(filteredSuggestions[activeSuggestionIndex]);
                }
            } else if (event.key === "Escape") {
                completeSuggestionSelection();
            } else if (event.key === " ") {
                const trimmedText = inputValue.text.trim();
                if (trimmedText && getAllCommands(initialCommandTemplate).includes(trimmedText as Command)) {
                    event.preventDefault();
                    if (filteredSuggestions.length > 0) {
                        selectSuggestion(filteredSuggestions[activeSuggestionIndex]);
                    }
                }
            }
        } else if (event.key === "Enter" && !event.shiftKey && !isLoading) {
            event.preventDefault();
            if (inputValue.text.trim() !== "") {
                handleSend();
            }
        } else if (event.key === "Escape" && isLoading) {
            event.preventDefault();
            handleStop();
        }
    };

    /**
     * Clears the chat input and attachments after sending
     */
    const cleanChatInput = () => {
        setInputValue({ text: "" });
        removeAllAttachments();
    };

    /**
     * Reusable logic for sending the user's current text+attachments.
     */
    const handleSend = () => {
        const input = inputRef.current?.getContentAsInputList();
        const filteredAttachments = attachments.filter((attachment) => attachment.status === AttachmentStatus.Success);
        onSend([input, filteredAttachments]);
        cleanChatInput();
    };

    /**
     * Reusable logic for stopping the ongoing process.
     */
    const handleStop = () => {
        onStop();
    };

    /**
     * Called after DOM updates in the StyledInput
     */
    const executeOnPostDOMUpdate = () => {
        // Any post-render logic you need, e.g. measuring DOM, etc.
    };

    /**
     * Called when user clicks on a suggestion item in the list.
     */
    const handleSuggestionClick = (suggestion: Suggestion) => {
        selectSuggestion(suggestion);
    };

    return (
        <Container ref={containerRef}>
            <FlexRow>
                <InputArea>
                    <StyledInputComponent
                        ref={inputRef}
                        value={inputValue}
                        onChange={setInputValue}
                        onKeyDown={handleKeyDown}
                        onBlur={() => completeSuggestionSelection()}
                        placeholder="Describe your integration..."
                        onPostDOMUpdate={executeOnPostDOMUpdate}
                    />
                    {/* Attachments Display */}
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
                                disabled={inputValue.text !== ""}
                                onClick={() => {
                                    inputRef.current?.insertTextAtCursor({ text: "/" });
                                }}
                            >
                                /
                            </ActionButton>
                            <input
                                type="file"
                                multiple={attachmentOptions.multiple}
                                accept={attachmentOptions.acceptResolver(activeCommand)}
                                style={{ display: "none" }}
                                ref={fileInputRef}
                                onChange={onAttachmentSelection}
                            />
                            <ActionButton title="Attach Context" onClick={handleAttachClick}>
                                <Codicon name="new-file" />
                            </ActionButton>
                        </div>
                        <div>
                            <ActionButton
                                title={isLoading ? "Stop (Escape)" : "Send (Enter)"}
                                disabled={inputValue.text.trim() === "" && !isLoading}
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
            {filteredSuggestions.length > 0 && (
                <SuggestionsList
                    suggestions={filteredSuggestions}
                    activeSuggestionIndex={activeSuggestionIndex}
                    activeSuggestionRef={activeSuggestionRef}
                    onSuggestionClick={handleSuggestionClick}
                    onSuggestionMouseDown={(e) => e.preventDefault()}
                />
            )}
        </Container>
    );
};

export default AIChatInput;
