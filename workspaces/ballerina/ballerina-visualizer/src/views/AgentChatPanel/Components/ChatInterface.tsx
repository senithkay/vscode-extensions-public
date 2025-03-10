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

import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import ChatInput from "./ChatInput";
import LoadingIndicator from "./LoadingIndicator";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

enum ChatMessageType {
    MESSAGE = "message",
    ERROR = "error",
}

interface ChatMessage {
    type: ChatMessageType;
    text: string;
    isUser: boolean;
}

// ---------- WATER MARK ----------
const Watermark = styled.div`
    position: absolute;
    width: 80%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
    user-select: none;
`;

const Codicon = styled.span`
    font-size: 60px !important;
    width: 60px;
    height: 60px;
    display: block;
    margin: 0 0;
`;

const WatermarkTitle = styled.div`
    font-size: 1.5em;
    font-weight: bold;
`;

const WatermarkSubTitle = styled.div`
    font-size: 14px;
    margin-top: 24px;
    color: var(--vscode-descriptionForeground);
`;

// ---------- CHAT AREA ----------
const ChatWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
`;

const ChatContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    margin: 16px 0;
`;

const Messages = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    z-index: 1;
    padding: 8px 20px;
`;

const MessageBubble = styled.div<{ isUser: boolean; isError?: boolean }>`
    background-color: ${({ isUser }: { isUser: boolean }) =>
        isUser ? "var(--vscode-button-background)" : "var(--vscode-editorWidget-background)"};
    padding: 10px 14px;
    /* For user: top-left: 16, top-right: 16, bottom-right: 0, bottom-left: 16 */
    /* For non-user: top-left: 16, top-right: 16, bottom-right: 16, bottom-left: 0 */
    border-radius: ${({ isUser }: { isUser: boolean }) => (isUser ? "16px 16px 0px 16px" : "16px 16px 16px 0px")};
    max-width: 70%;
    align-self: ${({ isUser }: { isUser: boolean }) => (isUser ? "flex-end" : "flex-start")};
    
    /* Preserve line breaks, let text wrap, and insert hyphens if needed */
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;

    /* Browser prefixes for safety */
    -webkit-hyphens: auto;
    -moz-hyphens: auto;

    text-align: left;
    color: ${({ isError }: { isError: boolean }) => (isError ? "var(--vscode-errorForeground)" : "inherit")};
`;


// ---------- CHAT FOOTER ----------
const ChatFooter = styled.div`
    position: sticky;
    bottom: 20px;
    width: 100%;
    padding: 0 20px;
`;

const SmallInfoIcon = styled.span`
    font-size: 16px;
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 8px;
`;

const FooterText = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 12px;
    padding: 6px 0;
    color: var(--vscode-input-placeholderForeground);
    width: calc(100% - 40px);
`;

const ChatInterface: React.FC = () => {
    const { rpcClient } = useRpcContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        setMessages((prev) => [...prev, { type: ChatMessageType.MESSAGE, text, isUser: true }]);
        setIsLoading(true);

        try {
            const chatResponse = await rpcClient.getAgentChatRpcClient().getChatMessage({ message: text });

            setMessages((prev) => [
                ...prev,
                { type: ChatMessageType.MESSAGE, text: chatResponse.message, isUser: false },
            ]);
        } catch (error) {
            const errorMessage =
                error && typeof error === "object" && "message" in error
                    ? String(error.message)
                    : "An unknown error occurred";

            setMessages((prev) => [...prev, { type: ChatMessageType.ERROR, text: errorMessage, isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = () => {
        rpcClient.getAgentChatRpcClient().abortChatRequest();
        setIsLoading(false);
    };

    return (
        <ChatWrapper>
            <ChatContainer>
                {messages.length === 0 && (
                    <Watermark>
                        <Codicon className="codicon codicon-comment-discussion" />
                        <WatermarkTitle>Agent Chat</WatermarkTitle>
                        <WatermarkSubTitle>
                            The chat interface serves as a testing environment to evaluate and refine the flow of the AI
                            agent.
                        </WatermarkSubTitle>
                    </Watermark>
                )}
                <Messages>
                    {/* Render each message */}
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} isUser={msg.isUser} isError={msg.type === "error"}>
                            {msg.text}
                        </MessageBubble>
                    ))}

                    {/* If waiting on a response, show the loading bubble */}
                    {isLoading && (
                        <MessageBubble isUser={false}>
                            <LoadingIndicator />
                        </MessageBubble>
                    )}
                    <div ref={messagesEndRef} />
                </Messages>
            </ChatContainer>
            <ChatFooter>
                <ChatInput value="" onSend={handleSendMessage} onStop={handleStop} isLoading={isLoading} />
                {/* <FooterText>
                    <SmallInfoIcon className="codicon codicon-info" />
                    <span>Add chat to external application.</span>
                    <a
                        href="https://example.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            marginLeft: "8px",
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                    >
                        More info
                    </a>
                </FooterText> */}
            </ChatFooter>
        </ChatWrapper>
    );
};

export default ChatInterface;
