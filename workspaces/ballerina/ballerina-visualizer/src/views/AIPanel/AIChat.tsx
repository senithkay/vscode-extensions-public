/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import React, { useEffect, useState } from "react";
import { VisualizerLocation, GetWorkspaceContextResponse, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TextArea, Button, Switch, Icon, ProgressRing, Codicon } from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Collapse } from 'react-collapse';
import { VSCodeButton, VSCodeTextArea, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';

import styled from "@emotion/styled";
import {
    materialDark,
    materialLight,
    oneLight,
    okaidia,
    tomorrow,
    twilight,
    coy,
    funky,
    dark,
    dracula,
    materialOceanic,
} from 'react-syntax-highlighter/dist/cjs/styles/prism'



interface MarkdownRendererProps {
    markdownContent: string;
}

interface ChatEntry {
    actor: string;
    message: string;
}

interface ApiResponse {
    event: string;
    error: string | null;
    questions: string[];
}

var chatArray: ChatEntry[] = [];

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
    return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

const Footer = styled.footer({
    padding: "20px",
});

const FlexRow = styled.div({
    display: "flex",
    flexDirection: "row",
});

const AIChatView = styled.div({
    display: "flex",
    flexDirection: "column",
    height: "100%",
});

const Header = styled.header({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '10px',
    gap: '10px',
});

const HeaderButtons = styled.div({
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: '10px',
});

const Main = styled.main({
    flex: 1,
    flexDirection: "column",
    overflowY: "auto",
});

const RoleContainer = styled.div({
    display: "flex",
    flexDirection: "row",
    gap: "6px",
});

const ChatMessage = styled.div({
    padding: "20px",
    borderTop: "1px solid var(--vscode-editorWidget-border)",
});

const Welcome = styled.div({
    padding: "0 20px",
});

const Badge = styled.div`
    padding: 5px;
    margin-left: 10px;
    display: inline-block;
    text-align: left;
`;

const PreviewContainer = styled.div`
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    font-size: 0.8em; 
    padding: 2px 5px; 
    border-radius: 3px; 
    display: inline-block; 
    margin-left: 2px; 
`;

const ResetsInBadge = styled.div`
    font-size: 10px; 
`;

// A string array to store all code blocks
const codeBlocks: string[] = [];
var projectUuid = "";
var backendRootUri = "";

let controller = new AbortController();
let signal = controller.signal;

var remainingTokenPercentage: string | number;
var remaingTokenLessThanOne: boolean = false;

var timeToReset: number;

//TOOD: Add the backend URL
//TODO: Add better error handling from backend. stream error type and non 200 status codes

export function AIChat() {
    const { rpcClient } = useRpcContext();
    const [state, setState] = useState<VisualizerLocation | null>(null);
    const [messages, setMessages] = useState<Array<{ role: string; content: string; type: string }>>([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
    const messagesEndRef = React.createRef<HTMLDivElement>();
    const [isOpen, setIsOpen] = useState(false);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState({ fileName: '', fileContent: '' });
    const [fileUploadStatus, setFileUploadStatus] = useState({ type: '', text: '' });

    async function fetchBackendUrl() {
        try {
            backendRootUri = (await rpcClient.getAiPanelRpcClient().getBackendURL());
            // Do something with backendRootUri
        } catch (error) {
            console.error('Failed to fetch backend URL:', error);
        }
    }
    useEffect(() => {

        fetchBackendUrl();

    }, []);

    useEffect(() => {
        rpcClient?.getAiPanelRpcClient().getProjectUuid().then((response) => {
            projectUuid = response;
            // projectUuid = "123";
            const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
            const storedChatArray = localStorage.getItem(localStorageFile);
            rpcClient.getAiPanelRpcClient().getAiPanelState().then((machineView: any) => {
                if (storedChatArray) {
                    const chatArrayFromStorage = JSON.parse(storedChatArray);
                    chatArray = chatArrayFromStorage;

                    // Add the messages from the chat array to the view
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        ...chatArray.map((entry: ChatEntry) => {
                            let role, type;
                            if (entry.actor === 'user') {
                                role = 'User';
                                type = 'user_message';
                            } else if (entry.actor === 'assistant') {
                                role = 'Eggplant Copilot';
                                type = 'assistant_message';
                            }
                            return {
                                role: role,
                                type: type,
                                content: entry.message,
                            };
                        }),
                    ]);

                    // Set initial messages only if chatArray's length is 0
                } else {
                    if (chatArray.length === 0) {
                        setMessages((prevMessages) => [
                            ...prevMessages
                        ]);
                    }
                }
                // }
            });
        });
    }, []);

    function addChatEntry(role: string, content: string): void {
        chatArray.push({
            actor: role,
            message: content,
        });

        localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));

    }

    // useEffect(() => {
    //     // This code will run after isCodeLoading updates
    //     console.log(isCodeLoading);
    // }, [isCodeLoading]); // The dependency array ensures this effect runs whenever isCodeLoading changes

    useEffect(() => {
        // Step 2: Scroll into view when messages state changes
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getAiPanelRpcClient().getAiPanelState().then((initialState) => {
                //setState(initialState);
            });
        }
    }, [rpcClient]);

    // useEffect(() => {
    //     console.log("Suggestions: " + isSuggestionLoading);
    // }, [isSuggestionLoading]);

    // useEffect(() => {
    //     console.log("is Loading: " + isLoading);
    // }, [isLoading]);

    function getStatusText(status: number) {
        switch (status) {
            case 400: return 'Bad Request';
            case 401: return 'Unauthorized';
            case 403: return 'Forbidden';
            case 404: return 'Not Found';
            case 429: return 'Token Count Exceeded';
            // Add more status codes as needed
            default: return '';
        }
    }

    async function handleSend(isQuestion: boolean = false, isInitialPrompt: boolean = false) {
        // Step 1: Add the user input to the chat array
        if (userInput === "" && !isQuestion && !isInitialPrompt) {
            return;
        }
        var context: GetWorkspaceContextResponse[] = [];
        setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'label'));
        setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'question'));
        setIsLoading(true);
        let assistant_response = "";
        setUserInput("");
        setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
        if (isQuestion) {
            setLastQuestionIndex(messages.length - 4);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: "Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
            ]);
        } else {
            if (userInput != "") {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "User", content: userInput, type: "user_message" },
                    { role: "Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
                ]);
            } else {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
                ]);
            }
        }

        const token = await rpcClient.getAiPanelRpcClient().getAccessToken();
        console.log("Used token : " + token);
        async function fetchWithToken(url: string, options: RequestInit) {
            let response = await fetch(url, options);
            if (response.status === 401) {
                console.log("Token expired. Refreshing token...");
                // await rpcClient.getAiPanelRpcClient().refreshAccessToken();
                const newToken = await rpcClient.getAiPanelRpcClient().getRefreshToken();
                console.log("refreshed token : " + newToken);
                if (newToken) {
                    options.headers = {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                    };
                    response = await fetch(url, options);
                }
            }
            return response;
        }



        const response = await fetchWithToken(backendRootUri + "/code", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ "usecase": userInput, "chatHistory": chatArray }),
            signal: signal,
        });

        if (!response.ok) {
            setIsLoading(false);
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                const statusText = getStatusText(response.status);
                let error = `Failed to fetch response. Status: ${statusText}`;
                console.log("Response status: ", response.status);
                if (response.status == 429) {
                    response.json().then(body => {
                        console.log(body.detail);
                        error += body.detail;
                        console.log("Error: ", error);
                    });
                }
                newMessages[newMessages.length - 1].content += error;
                newMessages[newMessages.length - 1].type = 'Error';
                return newMessages;
            });
            throw new Error('Failed to fetch response');
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = '';
        let buffer = '';
        let codeBuffer = '';
        let codeLoad = false;
        remainingTokenPercentage = "Unlimited";
        let inCodeBlock = false;
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                setIsLoading(false);
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
                const chunk = buffer.slice(0, boundary + 2);
                buffer = buffer.slice(boundary + 2);

                try {
                    const event = parseSSEEvent(chunk);
                    // console.log(`Event: ${event.event}`);
                    if (event.event == "content_block_delta") {
                        let textDelta = event.body.text;
                        assistant_response += (textDelta);
                        // console.log("Text Delta: " + textDelta);

                        if (textDelta.includes("```ballerina")) {
                            console.log("Here backticks" + textDelta);
                            setIsCodeLoading(true);
                            inCodeBlock = true;
                        } else if (inCodeBlock) {
                            codeBlocks.push(textDelta);
                            console.log("Code block " + textDelta);
                            inCodeBlock = false;
                        } else if (textDelta.includes("```")) {
                            console.log("Ending backtick" + textDelta);
                            setIsCodeLoading(false);
                        }

                        setMessages(prevMessages => {
                            const newMessages = [...prevMessages];
                            newMessages[newMessages.length - 1].content += textDelta;
                            return newMessages;
                        });
                    } else if (event.event == "error") {
                        console.log("Streaming Error: " + event.body);
                        setIsLoading(false);
                        setMessages(prevMessages => {
                            const newMessages = [...prevMessages];
                            newMessages[newMessages.length - 1].content += 'Unknown error occurred while streaming. Please retry';
                            newMessages[newMessages.length - 1].type = 'Error';
                            return newMessages;
                        });
                        throw new Error('Streaming error');
                    }
                } catch (error) {
                    console.error("Failed to parse SSE event:", error);
                }

                boundary = buffer.indexOf("\n\n");
            }
            // console.log(assistant_response);

        }
        addChatEntry("user", userInput);
        addChatEntry("assistant", assistant_response);
    }

    const handleAddSelectiveCodetoWorkspace = async (codeSegment: string) => {

        // var selectiveCodeBlocks: string[] = [];
        // selectiveCodeBlocks.push(codeSegment);
        // console.log("TODO: Write to file");
        await rpcClient.getAiPanelRpcClient().addToProject({ content: codeSegment });

    }

    async function handleStop() {
        // Abort the fetch
        controller.abort();

        // Create a new AbortController for future fetches
        controller = new AbortController();
        signal = controller.signal;

        setIsLoading(false);
        setIsCodeLoading(false);
    }

    

    async function handleLogout() {
        await rpcClient.getAiPanelRpcClient().logout();
    }

    function handleClearChat(): void {
        codeBlocks.length = 0;
        chatArray.length = 0;

        setMessages((prevMessages) => []);

        //generateSuggestions();

        //clear the local storage
        localStorage.removeItem(`chatArray-AIGenerationChat-${projectUuid}`);
    }

    const questionMessages = messages.filter(message => message.type === "question");
    if (questionMessages.length > 0) {
        localStorage.setItem(`Question-AIGenerationChat-${projectUuid}`, questionMessages[questionMessages.length - 1].content);
    }
    const otherMessages = messages.filter(message => message.type !== "question");

    const handleTextKeydown = (event: any) => {
        if (event.key === "Enter" && !event.shiftKey && userInput !== "") {
            event.preventDefault();
            handleSend(false, false);
            setUserInput("");
        }
    };

    const handleFileAttach = (e: any) => {
        const file = e.target.files[0];
        const validTypes = ["text/plain", "application/json", "application/x-yaml", "application/xml", "text/xml"];

        if (file && validTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const fileContents = event.target.result;
                setUploadedFile({ fileName: file.name, fileContent: fileContents });
                setFileUploadStatus({ type: 'success', text: 'File uploaded successfully.' });
            };
            reader.readAsText(file);
            e.target.value = '';
        } else {
            setFileUploadStatus({ type: 'error', text: 'Please select a valid XML, JSON, YAML, or text file.' });
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile({ fileName: '', fileContent: '' });
        setFileUploadStatus({ type: '', text: '' });
    };

    return (
        <AIChatView>
            <Header>
                <Badge>
                    Remaining Free Usage: {'Unlimited'}
                    <br />
                    <ResetsInBadge>
                        {`Resets in: 30 days`}
                    </ResetsInBadge>
                </Badge>
                <HeaderButtons>
                    <Button
                        appearance="icon"
                        onClick={() => handleClearChat()}
                        tooltip="Clear Chat"
                        disabled={isLoading}
                    >
                        <Codicon name="clear-all" />&nbsp;&nbsp;Clear
                    </Button>
                    <Button
                        appearance="icon"
                        onClick={() => handleLogout()}
                        tooltip="Logout"
                        disabled={isLoading}
                    >
                        <Codicon name="sign-out" />&nbsp;&nbsp;Logout
                    </Button>
                </HeaderButtons>
            </Header>
            <main style={{ flex: 1, overflowY: "auto" }}>
                {Array.isArray(otherMessages) && otherMessages.length === 0 && (<Welcome>
                    <h3>Welcome to Eggplant Copilot <PreviewContainer>Preview</PreviewContainer></h3>
                    <p>
                        What do you want to integrate today?
                    </p>
                </Welcome>
                )}
                {otherMessages.map((message, index) => (
                    <ChatMessage>
                        {message.type !== "question" && message.type !== "label" && <RoleContainer>
                            {message.role === "User" ? <Codicon name="account" /> : <><Codicon name="hubot" /></>}
                            {message.role === "User" ?
                                <h3 style={{ margin: 0 }}>{message.role}</h3>
                                :
                                <>
                                    <h3 style={{ margin: 0 }}>{message.role}</h3>
                                    <PreviewContainer>Preview</PreviewContainer>
                                </>
                            }
                        </RoleContainer>
                        }
                        {splitContent(message.content).map((segment, i) =>
                            segment.isCode ? (
                                <CodeSegment
                                    key={i}
                                    segmentText={segment.text}
                                    loading={segment.loading}
                                    handleAddSelectiveCodetoWorkspace={handleAddSelectiveCodetoWorkspace}
                                />
                            ) : (
                                message.type == "Error" ? (
                                    <div style={{ color: 'red', marginTop: "10px" }}>{segment.text}</div>
                                ) : (
                                    <MarkdownRenderer key={i} markdownContent={segment.text} />
                                )

                            )
                        )}

                    </ChatMessage>
                ))}
                <div style={{ paddingTop: "15px", marginLeft: "10px" }}>
                    {isLoading && !isSuggestionLoading && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%" }}>
                            <ProgressRing sx={{ position: "relative" }} />
                            <Icon name="sync" sx={{ animation: "spin 2s linear infinite" }} />
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </main>
            <Footer>
                {isLoading && isSuggestionLoading && (
                    <div style={{ marginBottom: "5px" }}>
                        Generating suggestions ...
                    </div>
                )}
                {questionMessages.map((message, index) => (<>
                    <div key={index} style={{ marginBottom: "5px" }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                //handleQuestionClick(message.content);
                            }}
                            style={{ textDecoration: 'none' }}
                        >
                            <FlexRow>
                                <Icon name="wand-magic-sparkles-solid" sx="marginRight:5px" />&nbsp;
                                <div>{message.content.replace(/^\d+\.\s/, "")}</div>
                            </FlexRow>
                        </a>
                    </div>
                </>
                ))}
                {uploadedFile && uploadedFile.fileName && (
                    <FlexRow style={{ alignItems: 'center' }}>
                        <span>{uploadedFile.fileName}</span>
                        <Button
                            appearance="icon"
                            onClick={handleRemoveFile}
                        >
                            <span className="codicon codicon-close"></span>
                        </Button>
                    </FlexRow>
                )}
                <FlexRow>
                    <VSCodeTextArea
                        value={userInput}
                        onInput={(e: any) => {
                            setUserInput(e.target.value);
                            // Dynamically adjust the number of rows based on the input length
                            const lines = e.target.value.split('\n').length;
                            const maxLines = 8;
                            e.target.rows = lines < maxLines ? lines : maxLines;
                        }}
                        onKeyDown={(event: any) => handleTextKeydown(event)}
                        placeholder="Type a command"
                        innerHTML="true"
                        style={{ width: "calc(100% - 35px)", overflowY: 'auto' }} // Add overflowY for scrolling
                        rows={1} // Start with a single row
                        {...(isLoading ? { disabled: true } : {})}
                    >
                    </VSCodeTextArea>
                    <VSCodeButton
                        appearance="secondary"
                        onClick={() => isLoading ? handleStop() : handleSend(false, false)}
                        style={{ width: "35px", marginBottom: "4px" }}>
                        <span className={`codicon ${isLoading ? 'codicon-debug-stop' : 'codicon-send'}`}></span>
                    </VSCodeButton>
                </FlexRow>
                {fileUploadStatus.text && (
                    <div style={{ color: fileUploadStatus.type === 'error' ? 'red' : 'green' }}>
                        {fileUploadStatus.text}
                    </div>
                )}
            </Footer>
        </AIChatView>
    );
}

interface CodeSegmentProps {
    segmentText: string;
    loading: boolean;
    handleAddSelectiveCodetoWorkspace: (codeSegment: string) => void;
}

interface EntryContainerProps {
    isOpen: boolean;
}

//@ts-ignore
const EntryContainer = styled.div<EntryContainerProps>(({ isOpen }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    cursor: 'pointer',
    padding: '10px',
    backgroundColor: isOpen ? 'var(--vscode-list-hoverBackground)' : 'var(--vscode-editorHoverWidget-background)',
    '&:hover': {
        backgroundColor: 'var(--vscode-list-hoverBackground)',
    },
}));

function identifyLanguage(segmentText: string): string {
    if (segmentText.includes('<') && segmentText.includes('>') && /(?:name|key)="([^"]+)"/.test(segmentText)) {
        return "xml";
    } else if (segmentText.includes('```toml')) {
        return "toml";
    } else if (segmentText.startsWith('```ballerina')) {
        return "ballerina";
    } else if (segmentText.startsWith('```')) {
        // Split the string to get the first line
        const firstLine = segmentText.split('\n', 1)[0];
        // Remove the starting ```
        return firstLine.substring(3).trim();
    } else {
        return "";
    }
}


const CodeSegment: React.FC<CodeSegmentProps> = ({ segmentText, loading, handleAddSelectiveCodetoWorkspace }) => {
    const [isOpen, setIsOpen] = useState(false);

    // const language = identifyLanguage(segmentText);
    const language = "ballerina";
    let name = "Ballerina file";

    // switch (language) {
    //     case "xml":
    //         const xmlMatch = segmentText.match(/(name|key)="([^"]+)"/);
    //         name = xmlMatch ? xmlMatch[2] : "XML File";
    //         break;
    //     case "toml":
    //         name = "deployment.toml"; // Default name
    //         break;
    //     case "ballerina":
    //         name = "Ballerina file";
    //         break;
    //     default:
    //         name = `${language} file`;
    //         break;
    // }

    if (loading) {
        name = "Generating " + name + "...";
    }

    return (
        <div>
            <EntryContainer isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                <div style={{ width: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                    <Codicon name={isOpen ? "chevron-down" : "chevron-right"} />
                </div>
                <div style={{ flex: 9, fontWeight: 'bold' }}>
                    {name}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    {!loading && language === 'ballerina' &&
                        <Button
                            appearance="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddSelectiveCodetoWorkspace(segmentText);
                            }}>
                            <Codicon name="add" />&nbsp;&nbsp;Add to Project
                        </Button>
                    }
                </div>
            </EntryContainer>
            <Collapse isOpened={isOpen}>
                <SyntaxHighlighter language={language} style={{ ...materialOceanic, 'pre[class*="language-"]': { ...materialOceanic['pre[class*="language-"]'], marginTop: 0 } }}>
                    {segmentText.trim()}
                </SyntaxHighlighter>
            </Collapse>
        </div>
    );
};


// Define the different event body types
interface ContentBlockDeltaBody {
    text: string;
}

interface OtherEventBody {
    // Define properties for other event types as needed
    [key: string]: any;
}

// Define the SSEEvent type with a discriminated union for the body
type SSEEvent =
    | { event: "content_block_delta"; body: ContentBlockDeltaBody }
    | { event: string; body: OtherEventBody };

/**
 * Parses a chunk of text to extract the SSE event and body.
 * @param chunk - The chunk of text from the SSE stream.
 * @returns The parsed SSE event containing the event name and body (if present).
 * @throws Will throw an error if the data field is not valid JSON.
 */
export function parseSSEEvent(chunk: string): SSEEvent {
    let event: string | undefined;
    let body: any;

    chunk.split("\n").forEach(line => {
        if (line.startsWith("event: ")) {
            event = line.slice(7);
        } else if (line.startsWith("data: ")) {
            try {
                body = JSON.parse(line.slice(6));
            } catch (e) {
                throw new Error("Invalid JSON data in SSE event");
            }
        }
    });

    if (!event) {
        throw new Error("Event field is missing in SSE event");
    }

    if (event === "content_block_delta") {
        return { event, body: body as ContentBlockDeltaBody };
    } else {
        return { event, body: body as OtherEventBody };
    }
}

export function splitHalfGeneratedCode(content: string) {
    const segments = [];
    const regex = /```([\s\S]*?)$/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ isCode: false, loading: false, text: content.slice(lastIndex, match.index) });
        }
        segments.push({ isCode: true, loading: true, text: match[0] });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
        segments.push({ isCode: false, loading: false, text: content });
    }
    return segments;
}

export function splitContent(content: string) {
    const segments = [];
    let match;
    const regex = /```ballerina([\s\S]*?)```/g;
    let start = 0;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > start) {
            const segment = content.slice(start, match.index);
            segments.push(...splitHalfGeneratedCode(segment));
        }
        segments.push({ isCode: true, loading: false, text: match[1] });
        start = regex.lastIndex;
    }
    if (start < content.length) {
        segments.push(...splitHalfGeneratedCode(content.slice(start)));
    }
    return segments;
}
