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
import { VisualizerLocation, CreateProjectRequest, GetWorkspaceContextResponse, MACHINE_VIEW, EVENT_TYPE } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { TextArea, Button, Switch, Icon, ProgressRing, Codicon } from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { MI_ARTIFACT_EDIT_BACKEND_URL, MI_ARTIFACT_GENERATION_BACKEND_URL, MI_SUGGESTIVE_QUESTIONS_BACKEND_URL, COPILOT_ERROR_MESSAGES } from "../../constants";
import { Collapse } from 'react-collapse';
import { AI_MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { VSCodeButton, VSCodeTextArea, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import styled from "@emotion/styled";
import { handleFileAttach } from "../../utils/fileAttach";

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
import { pad, set } from "lodash";
import { time } from "console";


interface MarkdownRendererProps {
    markdownContent: string;
}

interface ChatEntry {
    role: string;
    content: string;
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

export function AIProjectGenerationChat() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = useState<VisualizerLocation | null>(null);
    const [messages, setMessages] = useState<Array<{ role: string; content: string; type: string }>>([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
    const messagesEndRef = React.createRef<HTMLDivElement>();
    const [isOpen, setIsOpen] = useState(false);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [images, setImages] = useState([]);
    const [fileUploadStatus, setFileUploadStatus] = useState({ type: '', text: '' });
    const [initialPromptLoaded, setInitialPromptLoaded] = useState(false);

    async function fetchBackendUrl() {
        try {
            backendRootUri = (await rpcClient.getMiDiagramRpcClient().getBackendRootUrl()).url;
            // Do something with backendRootUri
        } catch (error) {
            console.error('Failed to fetch backend URL:', error);
        }
    }
    useEffect(() => {
        fetchBackendUrl();
    }, []);

    useEffect(() => {
        rpcClient?.getMiDiagramRpcClient().getProjectUuid().then((response) => {
            projectUuid = response.uuid;
            const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
            const localStorageQuestionFile = `Question-AIGenerationChat-${projectUuid}`;
            const storedChatArray = localStorage.getItem(localStorageFile);
            const storedQuestion = localStorage.getItem(localStorageQuestionFile);
            const storedCodeBlocks = localStorage.getItem(`codeBlocks-AIGenerationChat-${projectUuid}`);
            rpcClient.getAIVisualizerState().then((machineView: any) => {
                timeToReset = machineView.userTokens.time_to_reset;
                timeToReset = timeToReset / (60 * 60 * 24);
                const maxTokens = machineView.userTokens.max_usage;
                if (maxTokens == -1) {
                    remainingTokenPercentage = "Unlimited";
                } else {
                    const remainingTokens = machineView.userTokens.remaining_tokens;
                    remainingTokenPercentage = (remainingTokens / maxTokens) * 100;
                    if (remainingTokenPercentage < 1 && remainingTokenPercentage > 0) {
                        remaingTokenLessThanOne = true;
                    } else {
                        remaingTokenLessThanOne = false;
                    }
                    remainingTokenPercentage = Math.round(remainingTokenPercentage);
                    if (remainingTokenPercentage < 0) {
                        remainingTokenPercentage = 0;
                    }
                }

                if (machineView.initialPrompt.aiPrompt) {
                    setMessages(prevMessages => [
                        ...prevMessages,
                        { role: "User", content: machineView.initialPrompt.aiPrompt, type: "initial_prompt" },
                    ]);
                    addChatEntry("user", machineView.initialPrompt.aiPrompt);

                    const initialFiles = machineView.initialPrompt.files || [];
                    const initialImages = machineView.initialPrompt.images || [];

                    setFiles(initialFiles);
                    setImages(initialImages);
                    setInitialPromptLoaded(true);

                } else {
                    if (storedChatArray) {
                        if (storedQuestion) {
                            setMessages(prevMessages => [
                                ...prevMessages,
                                { role: "", content: storedQuestion, type: "question" },
                            ]);
                        }
                        if (storedCodeBlocks) {
                            const codeBlocksFromStorage = JSON.parse(storedCodeBlocks);
                            codeBlocks.push(...codeBlocksFromStorage);
                        }
                        console.log("Code Blocks: " + codeBlocks);
                        const chatArrayFromStorage = JSON.parse(storedChatArray);
                        chatArray = chatArrayFromStorage;

                        // Add the messages from the chat array to the view
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            ...chatArray.map((entry: ChatEntry) => {
                                let role, type;
                                if (entry.role === 'user') {
                                    role = 'User';
                                    type = 'user_message';
                                } else if (entry.role === 'assistant') {
                                    role = 'MI Copilot';
                                    type = 'assistant_message';
                                }
                                return {
                                    role: role,
                                    type: type,
                                    content: entry.content,
                                };
                            }),
                        ]);

                        // Set initial messages only if chatArray's length is 0
                    } else {
                        if (chatArray.length === 0) {
                            setMessages((prevMessages) => [
                                ...prevMessages
                            ]);
                            if (storedQuestion) {
                                setMessages(prevMessages => [
                                    ...prevMessages,
                                    { role: "", content: storedQuestion, type: "question" },
                                ]);
                            } else {
                                console.log("Fetching initial questions");
                                generateSuggestions();
                            }
                        }
                    }
                }
            });
        });
    }, []);

    useEffect(() => {
        if (initialPromptLoaded) {
            handleSend(false, true);
            setInitialPromptLoaded(false);
            rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.clearAIPrompt"] });
        }
    }, [initialPromptLoaded]);

    function addChatEntry(role: string, content: string): void {
        chatArray.push({
            role,
            content,
        });

        localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));

    }

    useEffect(() => {
        // This code will run after isCodeLoading updates
        console.log(isCodeLoading);
    }, [isCodeLoading]); // The dependency array ensures this effect runs whenever isCodeLoading changes

    useEffect(() => {
        // Step 2: Scroll into view when messages state changes
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((initialState) => {
                setState(initialState);
            });
        }
    }, [rpcClient]);

    useEffect(() => {
        console.log("Suggestions: " + isSuggestionLoading);
    }, [isSuggestionLoading]);

    useEffect(() => {
        console.log("is Loading: " + isLoading);
    }, [isLoading]);

    function getStatusText(status: number) {
        switch (status) {
            case 400: return COPILOT_ERROR_MESSAGES.BAD_REQUEST;
            case 401: return COPILOT_ERROR_MESSAGES.UNAUTHORIZED;
            case 403: return COPILOT_ERROR_MESSAGES.FORBIDDEN;
            case 404: return COPILOT_ERROR_MESSAGES.NOT_FOUND;
            case 429: return COPILOT_ERROR_MESSAGES.TOKEN_COUNT_EXCEEDED;
            // Add more status codes as needed
            default: return '';
        }
    }

    function handleFetchError(response: Response) {
        setIsLoading(false);
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const statusText = getStatusText(response.status);
            let error = `Failed to fetch response. Status: ${statusText}`;
            if (response.status == 429) {
                response.json().then(body => {
                    error += body.detail;
                });
            } else if (response.status == 422) {
                error = COPILOT_ERROR_MESSAGES.ERROR_422;
            }
            newMessages[newMessages.length - 1].content += error;
            newMessages[newMessages.length - 1].type = 'Error';
            return newMessages;
        });
    }

    async function generateSuggestions() {
        try {
            setIsLoading(true);
            setIsSuggestionLoading(true); // Set loading state to true at the start
            const url = backendRootUri + MI_SUGGESTIVE_QUESTIONS_BACKEND_URL;
            var context: GetWorkspaceContextResponse[] = [];
            //Get machine view
            const machineView = await rpcClient.getVisualizerState();
            switch (machineView?.view) {
                case MACHINE_VIEW.Overview:
                    await rpcClient?.getMiDiagramRpcClient()?.getWorkspaceContext().then((response) => {
                        context = [response]; // Wrap the response in an array
                    });
                    break;
                default:
                    console.log("Other");
                    await rpcClient?.getMiDiagramRpcClient()?.getSelectiveWorkspaceContext().then((response) => {
                        context = [response]; // Wrap the response in an array
                    });
            }
            console.log(JSON.stringify({ messages: chatArray, context: context[0].context }));
            const token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
            let retryCount = 0;
            const maxRetries = 2;

            const fetchSuggestions = async (): Promise<Response> => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.token}`,
                    },
                    body: JSON.stringify({ messages: chatArray, context: context[0].context, num_suggestions: 1, type: "artifact_gen" }),
                    signal: signal,
                });

                if (response.status == 404) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return await fetchSuggestions(); // Retry the request
                    } else {
                        openUpdateExtensionView();
                        return;
                    }
                } else if (!response.ok) {
                    throw new Error("Failed to fetch initial questions");
                }
                return response;
            };
            const response = await fetchSuggestions();
            const data = await response.json() as ApiResponse;
            if (data.event === "suggestion_generation_success") {
                // Extract questions from the response
                const initialQuestions = data.questions.map(question => ({
                    role: "",
                    content: question,
                    type: "question"
                }));
                // Update the state with the fetched questions
                setMessages(prevMessages => [...prevMessages, ...initialQuestions]);
            } else {
                throw new Error("Failed to generate suggestions: " + data.error);
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setIsSuggestionLoading(false);
        } finally {
            setIsLoading(false);
            setIsSuggestionLoading(false); // Set loading state to false after fetch is successful or if an error occurs
        }
    }

    async function handleSend(isQuestion: boolean = false, isInitialPrompt: boolean = false) {
        if (userInput === "" && !isQuestion && !isInitialPrompt) {
            return;
        }
        console.log(chatArray);
        var context: GetWorkspaceContextResponse[] = [];
        setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'label'));
        setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'question'));
        setIsLoading(true);
        let assistant_response = "";
        if (!isQuestion && !isInitialPrompt) {
            addChatEntry("user", userInput);
        }
        setUserInput("");
        setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
        if (isQuestion) {
            setLastQuestionIndex(messages.length - 4);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: "MI Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
            ]);
        } else {
            if (userInput != "") {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "User", content: userInput, type: "user_message" },
                    { role: "MI Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
                ]);
            } else {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "MI Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
                ]);
            }

        }
        var backendUrl = ""
        var view = ""
        //Get machine view
        const machineView = await rpcClient.getVisualizerState();
        switch (machineView?.view) {
            case MACHINE_VIEW.Overview:
            case MACHINE_VIEW.ADD_ARTIFACT:
                backendUrl = MI_ARTIFACT_GENERATION_BACKEND_URL;
                view = "Overview";
                break;
            default:
                backendUrl = MI_ARTIFACT_EDIT_BACKEND_URL;
                view = "Artifact";
        }
        if (view == "Overview") {
            await rpcClient?.getMiDiagramRpcClient()?.getWorkspaceContext().then((response) => {
                context = [response]; // Wrap the response in an array
            });
        } else if (view == "Artifact") {
            await rpcClient?.getMiDiagramRpcClient()?.getSelectiveWorkspaceContext().then((response) => {
                context = [response]; // Wrap the response in an array
            });
        }
        console.log(context[0].context);
        const token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
        const stringifiedUploadedFiles = files.map(file => JSON.stringify(file));
        const imageBase64Array = images.map(image => image.imageBase64);

        let retryCount = 0;
        const maxRetries = 2;

        const fetchWithRetry = async (): Promise<Response> => {
            let response = await fetch(backendRootUri + backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.token}`,
                },
                body: JSON.stringify({ messages: chatArray, context: context[0].context, files: stringifiedUploadedFiles, images: imageBase64Array }),
                signal: signal,
            });

            if (response.status == 401) {
                await rpcClient.getMiDiagramRpcClient().refreshAccessToken();
                const token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
                response = await fetch(backendRootUri + backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.token}`,
                    },
                    body: JSON.stringify({ messages: chatArray, context: context[0].context, files: stringifiedUploadedFiles, images: imageBase64Array }),
                    signal: signal,
                });
                if (!response.ok) {
                    handleFetchError(response);
                    throw new Error('Failed to fetch response after refreshing token');
                }
            } else if (response.status == 404) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithRetry(); // Retry the request
                } else {
                    openUpdateExtensionView();
                }
            } else if (!response.ok) {
                handleFetchError(response);
            }
            return response;
        };

        try {
            const response = await fetchWithRetry();

            // Remove the user uploaded files and images after sending them to the backend.
            removeAllFiles();
            removeAllImages();

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = '';
            let codeBuffer = '';
            let codeLoad = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setIsLoading(false);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                result += chunk;

                const lines = result.split('\n');
                for (let i = 0; i < lines.length - 1; i++) {
                    try {
                        const json = JSON.parse(lines[i]);
                        const tokenUsage = json.usage;
                        const maxTokens = tokenUsage.max_usage;
                        if (maxTokens == -1) {
                            remainingTokenPercentage = "Unlimited";
                        } else {
                            const remainingTokens = tokenUsage.remaining_tokens;
                            remainingTokenPercentage = (remainingTokens / maxTokens) * 100;
                            if (remainingTokenPercentage < 1 && remainingTokenPercentage > 0) {
                                remaingTokenLessThanOne = true;
                            } else {
                                remaingTokenLessThanOne = false;
                            }
                            remainingTokenPercentage = Math.round(remainingTokenPercentage);
                            if (remainingTokenPercentage < 0) {
                                remainingTokenPercentage = 0;
                            }
                        }
                        if (json.content == null) {
                            addChatEntry("assistant", assistant_response);
                            const questions = json.questions
                                .map((question: string, index: number) => {
                                    return { type: "question", role: "Question", content: question, id: index };
                                });

                            setMessages(prevMessages => [
                                ...prevMessages,
                                ...questions,
                            ]);
                        } else {
                            assistant_response += json.content;
                            if (json.content.includes("``")) {
                                setIsCodeLoading(prevIsCodeLoading => !prevIsCodeLoading);
                            }

                            setMessages(prevMessages => {
                                const newMessages = [...prevMessages];
                                newMessages[newMessages.length - 1].content += json.content;
                                return newMessages;
                            });

                            const regex = /```[\s\S]*?```/g;
                            let match;
                            while ((match = regex.exec(assistant_response)) !== null) {
                                if (!codeBlocks.includes(match[0])) {
                                    codeBlocks.push(match[0]);
                                }
                            }
                        }
                    } catch (error) {
                        setIsLoading(false);
                        console.error('Error parsing JSON:', error);
                    }
                }
                result = lines[lines.length - 1];

            }
            if (result) {
                try {
                    const json = JSON.parse(result);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
            localStorage.setItem(`codeBlocks-AIGenerationChat-${projectUuid}`, JSON.stringify(codeBlocks));

        } catch (error) {
            setIsLoading(false);
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content += 'Network error. Please check your connectivity.';
                newMessages[newMessages.length - 1].type = 'Error';
                return newMessages;
            });
            console.error('Network error:', error);
        }
    };


    async function handleStop() {
        // Abort the fetch
        controller.abort();

        // Create a new AbortController for future fetches
        controller = new AbortController();
        signal = controller.signal;

        setIsLoading(false);
        setIsCodeLoading(false);
    }

    const handleAddtoWorkspace = async () => {

        await rpcClient.getMiDiagramRpcClient().writeContentToFile({ content: codeBlocks }).then((response) => {
            console.log(response);
        });

        rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.refresh"] });
    }

    const handleAddSelectiveCodetoWorkspace = async (codeSegment: string) => {

        var selectiveCodeBlocks: string[] = [];
        selectiveCodeBlocks.push(codeSegment);
        await rpcClient.getMiDiagramRpcClient().writeContentToFile({ content: selectiveCodeBlocks }).then((response) => {
            console.log(response);
        });

    }

    function splitHalfGeneratedCode(content: string) {
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

    function splitContent(content: string) {
        if (!content) {
            return [];
        }
        const segments = [];
        let match;
        const regex = /```xml([\s\S]*?)```/g;
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

    async function handleLogout() {
        await rpcClient.getMiDiagramRpcClient().logoutFromMIAccount();
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    function handleQuestionClick(content: string) {
        const question = content;

        //remove numbering from question and take only the text of it
        const questionText = question.replace(/^\d+\.\s/, "");
        setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
        setLastQuestionIndex(messages.length);

        if (questionText) {
            addChatEntry("user", questionText);

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "User", content: questionText, type: "user_message" },
            ]);

            handleSend(true, false);
        }
    }

    function handleClearChat(): void {
        codeBlocks.length = 0;
        chatArray.length = 0;

        setMessages((prevMessages) => []);

        generateSuggestions();

        //clear the local storage
        localStorage.removeItem(`chatArray-AIGenerationChat-${projectUuid}`);
        localStorage.removeItem(`Question-AIGenerationChat-${projectUuid}`);

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

    const handleRemoveFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((file, i) => i !== index));
    };

    const handleRemoveImage = (index: number) => {
        setImages(prevImages => prevImages.filter((image, i) => i !== index));
    };

    const removeAllFiles = () => {
        setFiles([]);
        setFileUploadStatus({ type: '', text: '' });
    }

    const removeAllImages = () => {
        setImages([]);
        setFileUploadStatus({ type: '', text: '' });
    }

    const openUpdateExtensionView = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.UpdateExtension } });
    };

    return (
        <AIChatView>
            <Header>
                <Badge>
                    Remaining Free Usage: {
                        remainingTokenPercentage === 'Unlimited' ? remainingTokenPercentage :
                            (remaingTokenLessThanOne ? '<1%' : `${remainingTokenPercentage}%`)
                    }
                    <br />
                    <ResetsInBadge>
                        {remainingTokenPercentage !== "Unlimited" &&
                            `Resets in: ${timeToReset < 1 ? "< 1 day" : `${Math.round(timeToReset)} days`}`}
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
                    <h3>Welcome to MI Copilot <PreviewContainer>Preview</PreviewContainer></h3>
                    <p>
                        You may use this chat to generate new artifacts
                        or to make changes to existing artifacts simply using text-based prompts.
                        The context of your generation will always be the window you have currently opened.
                    </p>
                    <p>
                        I am powered by AI, therefore mistakes and surprises are inevitable.
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
                                handleQuestionClick(message.content);
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
                {files.map((file, index) => (
                    <FlexRow style={{ alignItems: 'center' }} key={index}>
                        <span>{file.fileName}</span>
                        <Button
                            appearance="icon"
                            onClick={() => handleRemoveFile(index)}
                        >
                            <Codicon name="close"/>
                        </Button>
                    </FlexRow>
                ))}
                {images.map((image, index) => (
                    <FlexRow style={{ alignItems: 'center' }} key={index}>
                        <span>{image.imageName}</span>
                        <Button
                            appearance="icon"
                            onClick={() => handleRemoveImage(index)}
                        >
                            <Codicon name="close"/>
                        </Button>
                    </FlexRow>
                ))}
                <FlexRow>
                    <VSCodeButton
                        appearance="secondary"
                        onClick={() => document.getElementById('fileInput').click()}
                        style={{ width: "35px", marginBottom: "4px" }}>
                        <Codicon name="new-file"/>
                    </VSCodeButton>
                    <input
                        id="fileInput"
                        type="file"
                        style={{ display: "none" }}
                        multiple
                        onChange={(e: any) => handleFileAttach(e, setFiles, setImages, setFileUploadStatus)}
                    />
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

    const language = identifyLanguage(segmentText);
    let name = "";

    switch (language) {
        case "xml":
            const xmlMatch = segmentText.match(/(name|key)="([^"]+)"/);
            name = xmlMatch ? xmlMatch[2] : "XML File";
            break;
        case "toml":
            name = "deployment.toml"; // Default name
            break;
        default:
            name = `${language} file`;
            break;
    }

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
                    {!loading && language === 'xml' &&
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
