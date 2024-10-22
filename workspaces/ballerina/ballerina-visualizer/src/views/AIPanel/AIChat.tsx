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
import {
    VisualizerLocation,
    GetWorkspaceContextResponse,
    MACHINE_VIEW,
    ProjectSource,
    SourceFile,
    ProjectDiagnostics,
    InitialPrompt,
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TextArea, Button, Switch, Icon, ProgressRing, Codicon } from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Collapse } from "react-collapse";

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
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import AIChatInput from "./AIChatInput";
import ProgressTextSegment from "./Components/ProgressTextSegment";
import RoleContainer, { PreviewContainer } from "./Components/RoleContainter";
import { AttachmentResult, AttachmentStatus } from "../../utils/attachmentUtils";
import AttachmentBox, { AttachmentsContainer } from "./Components/AttachmentBox";
import { add } from "lodash";

interface MarkdownRendererProps {
    markdownContent: string;
}

interface CodeBlock {
    filePath: string;
    content: string;
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "10px",
    gap: "10px",
});

const HeaderButtons = styled.div({
    display: "flex",
    justifyContent: "flex-end",
    marginRight: "10px",
});

const Main = styled.main({
    flex: 1,
    flexDirection: "column",
    overflowY: "auto",
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

const commandToTemplate = new Map<string, string[]>([
    ["/scaffolding", ["generate code for the use-case: <use-case>"]],
    ["/test", ["generate test using <servicename> service"]],
    // [
    //     "/datamapper",
    //     [
    //         "generate mapping using the uploaded file",
    //         "generate mapping using input as <recordname(s)> and output as <recordname> using the function <functionname>",
    //         "generate mapping using input as <recordname(s)> and output as <recordname>",
    //     ],
    // ],
    // ["/typecreator", ["generate types from the <filename> file"]],
]);

//TOOD: Add the backend URL
//TODO: Add better error handling from backend. stream error type and non 200 status codes

export function AIChat() {
    const { rpcClient } = useRpcContext();
    const [state, setState] = useState<VisualizerLocation | null>(null);
    const [messages, setMessages] = useState<Array<{ role: string; content: string; type: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
    const messagesEndRef = React.createRef<HTMLDivElement>();
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [fileUploadStatus, setFileUploadStatus] = useState({ type: '', text: '' });
    const [files, setFiles] = useState([]);
    const [currentGeneratingPromptIndex, setCurrentGeneratingPromptIndex] = useState(-1);
    const [isSyntaxError, setIsSyntaxError] = useState(false);
    let codeSegmentRendered = false; 
    let tempStorage: { [filePath: string]: string } = {}; 

    async function fetchBackendUrl() {
        try {
            backendRootUri = await rpcClient.getAiPanelRpcClient().getBackendURL();
            // Do something with backendRootUri
        } catch (error) {
            console.error("Failed to fetch backend URL:", error);
        }
    }
    useEffect(() => {
        fetchBackendUrl();
    }, []);

    useEffect(() => {
        rpcClient
            ?.getAiPanelRpcClient()
            .getProjectUuid()
            .then((response) => {
                projectUuid = response;
                const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
                const storedChatArray = localStorage.getItem(localStorageFile);
                rpcClient
                    .getAiPanelRpcClient()
                    .getInitialPrompt()
                    .then((initPrompt: InitialPrompt) => {
                        if (initPrompt.exists) {
                            // setUserInput(initPrompt.text);
                        }
                    });
                rpcClient
                    .getAiPanelRpcClient()
                    .getAiPanelState()
                    .then((machineView: any) => {
                        if (storedChatArray) {
                            const chatArrayFromStorage = JSON.parse(storedChatArray);
                            chatArray = chatArrayFromStorage;

                            // Add the messages from the chat array to the view
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                ...chatArray.map((entry: ChatEntry) => {
                                    let role, type;
                                    if (entry.actor === "user") {
                                        role = "User";
                                        type = "user_message";
                                    } else if (entry.actor === "assistant") {
                                        role = "Copilot";
                                        type = "assistant_message";
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
                                setMessages((prevMessages) => [...prevMessages]);
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

    useEffect(() => {
        // This code will run after isCodeLoading updates
        console.log(isCodeLoading);
    }, [isCodeLoading]); // The dependency array ensures this effect runs whenever isCodeLoading changes

    useEffect(() => {
        console.log(isSyntaxError);
    }, [isSyntaxError]);

    useEffect(() => {
        // Step 2: Scroll into view when messages state changes
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    useEffect(() => {
        if (rpcClient) {
            rpcClient
                .getAiPanelRpcClient()
                .getAiPanelState()
                .then((initialState) => {
                    //setState(initialState);
                });
        }
    }, [rpcClient]);

    function getStatusText(status: number) {
        switch (status) {
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Not Found";
            case 429:
                return "Token Count Exceeded";
            // Add more status codes as needed
            default:
                return "";
        }
    }

    async function handleSend(content: [string, AttachmentResult[]]) {
        setCurrentGeneratingPromptIndex(otherMessages.length);
        // Step 1: Add the user input to the chat array

        const [message, attachments] = content;

        if (message === "") {
            return;
        }
        rpcClient.getAiPanelRpcClient().clearInitialPrompt();
        var context: GetWorkspaceContextResponse[] = [];
        setMessages((prevMessages) => prevMessages.filter((message, index) => message.type !== "label"));
        setMessages((prevMessages) => prevMessages.filter((message, index) => message.type !== "question"));
        setIsLoading(true);
        setMessages((prevMessages) =>
            prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== "question")
        );

        const uerMessage = getUserMessage(content);
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "User", content: uerMessage, type: "user_message" },
            { role: "Copilot", content: "", type: "assistant_message" }, // Add a new message for the assistant
        ]);

        const token = await rpcClient.getAiPanelRpcClient().getAccessToken();

        if (!token) {
            await rpcClient.getAiPanelRpcClient().promptLogin();
            setIsLoading(false);
            return;
        }

        try {
            await processContent(token, content);
        } catch (error: any) {
            console.error("Failed to process content:", error);
            setIsLoading(false);
            setIsCodeLoading(false);
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                if (error && "message" in error) {
                    newMessages[newMessages.length - 1].content += `<error>Failed: ${error.message}</error>`;
                } else {
                    newMessages[newMessages.length - 1].content += `<error>Failed: ${error}</error>`;
                }
                return newMessages;
            });
        }
    }

    function getUserMessage(content: [string, AttachmentResult[]]): string {
        const [message, attachments] = content;

        return attachments.reduce((acc, attachment) => {
            return acc + `<attachment>${attachment.name}</attachment>`;
        }, message);
    }

    async function processContent(token: string, content: [string, AttachmentResult[]]) {
        const [message, attachments] = content;

        const commandKey = findCommand(message);
        if (commandKey) {
            const commandLength = commandKey.length;
            const messageBody = message.slice(commandLength).trim();
            const parameters = extractParameters(commandKey, messageBody);

            if (parameters) {
                switch (commandKey) {
                    // case "/scaffolding": {
                    //     if (parameters.length >= 1) {
                    //         await processCodeGeneration(token, [parameters[0], attachments]);
                    //     } else {
                    //         throw new Error("Error: Invalid parameters for /scaffolding command");
                    //     }
                    //     break;
                    // }
                    case "/test": {
                        await processTestGeneration(content, token, parameters[0]);
                        break;
                    }
                    // case "/datamapper": {
                    //     if (parameters.length >= 2) {
                    //         await processDataMappings(message, token, parameters);
                    //     } else {
                    //         throw new Error("Error: Invalid parameters for /test command");
                    //     }
                    //     break;
                    // }
                    // case "typecreator": {

                    // }
                }
            } else {
                throw new Error(
                    `Invalid template format for the \`${commandKey}\` command. ` +
                        `Please ensure you follow the correct template.`
                );
            }
        } else {
            await processCodeGeneration(token, content);
        }
    }

    function findCommand(input: string): string {
        for (let key of commandToTemplate.keys()) {
            if (input.startsWith(key)) {
                return key;
            }
        }
        return "";
    }

    function extractParameters(command: string, messageBody: string): string[] | null {
        const expectedTemplates = commandToTemplate.get(command);
        for (const template of expectedTemplates ?? []) {
            let pattern = template
                .replace(/<servicename>/g, "(.+?)")
                .replace(/<recordname\(s\)>/g, "([\\w]+(?:[\\s,]+[\\w]+)*)")
                .replace(/<recordname>/g, "(.+?)")
                .replace(/<use-case>/g, "(.+?)");

            const regex = new RegExp(`^${pattern}$`, "i");
            const match = messageBody.match(regex);
            if (match) {
                if (command === "/datamapper" && template.includes("<recordname(s)>")) {
                    const inputRecordNamesRaw = match[1].trim();
                    let inputRecordList: string[];

                    if (inputRecordNamesRaw.includes(",")) {
                        inputRecordList = inputRecordNamesRaw
                            .split(",")
                            .map((name) => name.trim())
                            .filter((name) => name.length > 0);
                    } else {
                        inputRecordList = inputRecordNamesRaw
                            .split(/\s+/)
                            .map((name) => name.trim())
                            .filter((name) => name.length > 0);
                    }

                    const outputRecordName = match[2].trim();

                    return [inputRecordList.join(","), outputRecordName];
                }

                return match.slice(1).map((param) => param.trim());
            }
        }
        return null;
    }

    async function processCodeGeneration(token: string, content: [string, AttachmentResult[]]) {
        const [message, attachments] = content;

        let assistant_response = "";
        const project: ProjectSource = await rpcClient.getAiPanelRpcClient().getProjectSource();
        const requestBody: any = {
            usecase: message,
            chatHistory: chatArray,
            sourceFiles: project.sourceFiles,
        };

        const stringifiedUploadedFiles = attachments.map((file) => JSON.stringify(file));
        if (attachments.length > 0) {
            requestBody.fileAttachmentContents = stringifiedUploadedFiles.toString();
        }

        const response = await fetchWithToken(
            backendRootUri + "/code",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
                signal: signal,
            },
            rpcClient
        );

        let functions: any;

        if (!response.ok) {
            if (response.status > 400 && response.status < 500) {
                await rpcClient.getAiPanelRpcClient().promptLogin();
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const statusText = getStatusText(response.status);
                let error = `Failed to fetch response. Status: ${statusText}`;
                console.log("Response status: ", response.status);
                if (response.status == 429) {
                    response.json().then((body) => {
                        console.log(body.detail);
                        error += body.detail;
                        console.log("Error: ", error);
                    });
                }
                newMessages[newMessages.length - 1].content += error;
                newMessages[newMessages.length - 1].type = "Error";
                return newMessages;
            });
            throw new Error("Failed to fetch response");
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        remainingTokenPercentage = "Unlimited";
        setIsCodeLoading(true);
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
                    await processSSEEvent(chunk);
                } catch (error) {
                    console.error("Failed to parse SSE event:", error);
                }

                boundary = buffer.indexOf("\n\n");
            }
        }

        async function processSSEEvent(chunk: string) {
            const event = parseSSEEvent(chunk);
            if (event.event == "content_block_delta") {
                let textDelta = event.body.text;
                assistant_response += textDelta;

                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content += textDelta;
                    return newMessages;
                });
            } else if (event.event == "functions") {
                functions = event.body;
            } else if (event.event == "message_stop") {
                //extract new source files from resp
                const newSourceFiles: ProjectSource = getProjectFromResponse(assistant_response);
                // Check diagnostics
                const diags: ProjectDiagnostics = await rpcClient
                    .getAiPanelRpcClient()
                    .getShadowDiagnostics(newSourceFiles);
                if (diags.diagnostics.length > 0) {
                    console.log("Diagnostics : ");
                    console.log(diags.diagnostics);
                    //TODO: fill
                    const diagReq = {
                        response: assistant_response,
                        diagnostics: diags.diagnostics,
                    };
                    const startTime = performance.now();
                    const response = await fetchWithToken(
                        backendRootUri + "/code/repair",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                usecase: message,
                                chatHistory: chatArray,
                                sourceFiles: project.sourceFiles,
                                diagnosticRequest: diagReq,
                                functions: functions,
                            }),
                            signal: signal,
                        },
                        rpcClient
                    );
                    if (!response.ok) {
                        console.log("errr");
                    } else {
                        const jsonBody = await response.json();
                        const repairResponse = jsonBody.repairResponse;
                        // replace original response with new code blocks
                        const fixedResponse = replaceCodeBlocks(assistant_response, repairResponse);
                        const endTime = performance.now();
                        const executionTime = endTime - startTime;
                        console.log(`Repair call time: ${executionTime} milliseconds`);
                        setIsCodeLoading(false);
                        assistant_response = fixedResponse;
                        setMessages((prevMessages) => {
                            const newMessages = [...prevMessages];
                            newMessages[newMessages.length - 1].content = fixedResponse;
                            return newMessages;
                        });
                    }
                } else {
                    setIsCodeLoading(false);
                }
            } else if (event.event == "error") {
                console.log("Streaming Error: " + event.body);
                setIsLoading(false);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content +=
                        "Unknown error occurred while streaming. Please retry";
                    newMessages[newMessages.length - 1].type = "Error";
                    return newMessages;
                });
                throw new Error("Streaming error");
            }
        }
        removeAllFiles();
        addChatEntry("user", message);
        const diagnosedSourceFiles: ProjectSource = getProjectFromResponse(assistant_response);
        setIsSyntaxError(await rpcClient.getAiPanelRpcClient().checkSyntaxError(diagnosedSourceFiles)); 
        addChatEntry("assistant", assistant_response);
    }

    const handleAddAllCodeSegmentsToWorkspace = async (codeSegments: any, setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>, isTestCode: boolean) => {
        for (const { segmentText, filePath } of codeSegments) {
            if (!tempStorage[filePath]) {
                try {
                    const originalContent = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: filePath });
                    tempStorage[filePath] = originalContent;
                } catch (error) {
                    tempStorage[filePath] = ''; 
                }
            }
            await rpcClient.getAiPanelRpcClient().addToProject({ filePath: filePath, content: segmentText, isTestCode: isTestCode });
        }
        setIsCodeAdded(true);
    };    

    const handleRevertChanges = async (codeSegments: any, setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>) => {
        for (const { filePath } of codeSegments) {
            const originalContent = tempStorage[filePath];
            if (originalContent === '') {
                try {
                    await rpcClient.getAiPanelRpcClient().deleteFromProject({ filePath: filePath }); 
                } catch (error) {
                    console.error(`Error clearing file ${filePath}:`, error);
                }
            } else {
                await rpcClient.getAiPanelRpcClient().addToProject({ filePath: filePath, content: originalContent, isTestCode: false });
            }
        }
        tempStorage = {};
        setIsCodeAdded(false);
    }

    async function processTestGeneration(content: [string, AttachmentResult[]], token: string, serviceName: string) {
        let assistant_response = "";

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `Initiating test generation for the ${serviceName} service. Please wait...`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        let generatedTestCode = "";
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `\n\n<progress>Generating tests for the ${serviceName} service... This may take a moment.</progress>`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const response = await rpcClient
            .getAiPanelRpcClient()
            .getGeneratedTest({ backendUri: backendRootUri, token: token, serviceName: serviceName });
        generatedTestCode = response.testContent;
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `\n<progress>Analyzing generated tests for potential issues...</progress>`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const diagnostics = await rpcClient.getAiPanelRpcClient().getTestDiagnostics(response);
        if (diagnostics.diagnostics.length > 0) {
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                assistant_response += `\n<progress>Refining tests based on feedback to ensure accuracy and reliability...</progress>`;
                newMessages[newMessages.length - 1].content = assistant_response;
                return newMessages;
            });
            const fixedCode = await rpcClient.getAiPanelRpcClient().getGeneratedTest({
                backendUri: backendRootUri,
                token: token,
                serviceName: serviceName,
                existingSource: response,
                diagnostics: diagnostics,
            });
            generatedTestCode = fixedCode.testContent;
        }

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `\n\nTest generation completed. Displaying the generated tests for the ${serviceName} service below:`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        setIsLoading(false);
        setIsCodeLoading(false);
        assistant_response += `\n\n<code filename="test.bal" test=true>\n\`\`\`ballerina\n${generatedTestCode}\n\`\`\`\n</code>`;
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const userMessage = getUserMessage(content);
        addChatEntry("user", userMessage);
        addChatEntry("assistant", assistant_response);
    }

    interface Record {
        type: string;
        isArray: boolean;
        filePath: string;
    }

    async function processDataMappings(message: string, token: string, parameters: string[]) {
        console.log(parameters);
        let assistant_response = "";

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `Generating mappings for the records ${parameters.join(", ")}. Please wait...`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const inputParams = parameters.slice(0, -1);
        const outputParam = parameters[parameters.length - 1];

        const projectComponents = await rpcClient.getBIDiagramRpcClient().getProjectComponents();

        const recordMap: Map<string, Record> = new Map();

        projectComponents.components.packages?.forEach((pkg) => {
            pkg.modules?.forEach((mod) => {
                let filepath = pkg.filePath;
                if (mod.name !== undefined) {
                    filepath += `modules/${mod.name}/`;
                }
                mod.records.forEach((rec) => {
                    const recFilePath = filepath + rec.filePath;
                    recordMap.set(rec.name, { ...rec, type: rec.name, isArray: false, filePath: recFilePath });
                });
            });
        });

        try {
            const inputs: Record[] = [];
            for (const param of inputParams) {
                const rec = recordMap.get(param);
                if (!rec) {
                    throw new Error(`Input parameter "${param}" does not match any record name.`);
                }
                inputs.push(rec);
            }

            const output = recordMap.get(outputParam);
            if (!output) {
                throw new Error(`Output parameter "${outputParam}" does not match any record name.`);
            }

            const response = await rpcClient.getAiPanelRpcClient().getMappingsFromRecord({
                backendUri: "",
                token: "",
                inputRecordTypes: inputs,
                outputRecordType: output,
            });

            setIsLoading(false);
            setIsCodeLoading(false);
            assistant_response += `\n\n<code filename="mappings.bal">\n\`\`\`ballerina\n${response.mappingCode}\n\`\`\`\n</code>`;
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = assistant_response;
                return newMessages;
            });
        } catch (error) {
            setIsLoading(false);
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                let errorMessage = `Mappings generation failed: ${error}`;
                newMessages[newMessages.length - 1].content += errorMessage;
                newMessages[newMessages.length - 1].type = "Error";
                return newMessages;
            });
            throw new Error("Failed to generate Mappings.");
        }

        addChatEntry("assistant", assistant_response);
    }

    const handleAddSelectiveCodetoWorkspace = async (codeSegment: string, filePath: string, isTestCode: boolean) => {
        // var selectiveCodeBlocks: string[] = [];
        // selectiveCodeBlocks.push(codeSegment);
        // console.log("TODO: Write to file");
        await rpcClient
            .getAiPanelRpcClient()
            .addToProject({ filePath: filePath, content: codeSegment, isTestCode: isTestCode });
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

    const questionMessages = messages.filter((message) => message.type === "question");
    if (questionMessages.length > 0) {
        localStorage.setItem(
            `Question-AIGenerationChat-${projectUuid}`,
            questionMessages[questionMessages.length - 1].content
        );
    }
    const otherMessages = messages.filter(message => message.type !== "question");
    useEffect(() => {
        // Set the currentGeneratingPromptIndex to the last prompt index whenever otherMessages updates
        if (otherMessages.length > 0) {
            setCurrentGeneratingPromptIndex(otherMessages.length - 1);
        }
    }, [otherMessages.length]); 


    const removeAllFiles = () => {
        setFiles([]);
        setFileUploadStatus({ type: '', text: '' });
    }


    return (
        <AIChatView>
            <Header>
                <Badge>
                    Remaining Free Usage: {"Unlimited"}
                    <br />
                    <ResetsInBadge>{`Resets in: 30 days`}</ResetsInBadge>
                </Badge>
                <HeaderButtons>
                    <Button
                        appearance="icon"
                        onClick={() => handleClearChat()}
                        tooltip="Clear Chat"
                        disabled={isLoading}
                    >
                        <Codicon name="clear-all" />
                        &nbsp;&nbsp;Clear
                    </Button>
                    <Button appearance="icon" onClick={() => handleLogout()} tooltip="Logout" disabled={true}>
                        <Codicon name="sign-out" />
                        &nbsp;&nbsp;Logout
                    </Button>
                </HeaderButtons>
            </Header>
            <main style={{ flex: 1, overflowY: "auto" }}>
                {Array.isArray(otherMessages) && otherMessages.length === 0 && (
                    <Welcome>
                        <h3>
                            Welcome to WSO2 Copilot <PreviewContainer>Preview</PreviewContainer>
                        </h3>
                        <p>What do you want to integrate today?</p>
                    </Welcome>
                )}
                {otherMessages.map((message, index) => {
                    const showGeneratingFiles = !codeSegmentRendered && index === currentGeneratingPromptIndex;
                    codeSegmentRendered = false;
                    return <ChatMessage>
                        {message.type !== "question" && message.type !== "label" && (
                            <RoleContainer
                                icon={message.role === "User" ? "account" : "hubot"}
                                title={message.role}
                                showPreview={message.role !== "User"}
                                isLoading={isLoading && !isSuggestionLoading && index === otherMessages.length - 1}
                            />
                        )}
                        {splitContent(message.content).map((segment, i) => {
                            if (segment.type === SegmentType.Code) {
                                return (
                                    <CodeSegment
                                                key={i}
                                                segmentText={segment.text}
                                                loading={isLoading && showGeneratingFiles}
                                                fileName={segment.fileName}
                                                handleAddAllCodeSegmentsToWorkspace={handleAddAllCodeSegmentsToWorkspace}
                                                handleRevertChanges={handleRevertChanges}
                                                isReady={!isCodeLoading}
                                                message={message}
                                                buttonsActive={showGeneratingFiles}
                                                isSyntaxError={isSyntaxError}
                                                isTestCode={segment.isTestCode}
                                            />
                                );
                            } else if (segment.type === SegmentType.Progress) {
                                return (
                                    <ProgressTextSegment
                                        text={segment.text}
                                        loading={segment.loading}
                                        failed={segment.failed}
                                    />
                                );
                            } else if (segment.type === SegmentType.Attachment) {
                                return (
                                    <AttachmentsContainer>
                                        {segment.text.split(",").map((fileName, index) => (
                                            <AttachmentBox
                                                key={index}
                                                status={AttachmentStatus.Success}
                                                fileName={fileName.trim()}
                                                index={index}
                                                removeAttachment={null}
                                                readOnly={true}
                                            />
                                        ))}
                                    </AttachmentsContainer>
                                );
                            } else if (segment.type === SegmentType.Error) {
                                return (
                                    <div key={i} style={{ color: "var(--vscode-errorForeground)", marginTop: "10px" }}>
                                        {segment.text}
                                    </div>
                                );
                            } else {
                                if (message.type === "Error") {
                                    return (
                                        <div key={i} style={{ color: "red", marginTop: "10px" }}>
                                            {segment.text}
                                        </div>
                                    );
                                }
                                return <MarkdownRenderer key={i} markdownContent={segment.text} />;
                            }
                        })}
                    </ChatMessage>
})}
                <div ref={messagesEndRef} />
            </main>
            <Footer>
                {isLoading && isSuggestionLoading && (
                    <div style={{ marginBottom: "5px" }}>Generating suggestions ...</div>
                )}
                {questionMessages.map((message, index) => (
                    <>
                        <div key={index} style={{ marginBottom: "5px" }}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    //handleQuestionClick(message.content);
                                }}
                                style={{ textDecoration: "none" }}
                            >
                                <FlexRow>
                                    <Icon name="wand-magic-sparkles-solid" sx="marginRight:5px" />
                                    &nbsp;
                                    <div>{message.content.replace(/^\d+\.\s/, "")}</div>
                                </FlexRow>
                            </a>
                        </div>
                    </>
                ))}
                <FlexRow>
                    <AIChatInput
                        value=""
                        baseCommands={commandToTemplate}
                        onSend={handleSend}
                        onStop={handleStop}
                        isLoading={isLoading}
                    />
                    {/* <VSCodeTextArea
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
                        onClick={() => isLoading ? handleStop() : handleSend()}
                        style={{ width: "35px", marginBottom: "4px" }}>
                        <span className={`codicon ${isLoading ? 'codicon-debug-stop' : 'codicon-send'}`}></span>
                    </VSCodeButton> */}
                </FlexRow>
            </Footer>
        </AIChatView>
    );
}

interface CodeSegmentProps {
    segmentText: string;
    loading: boolean;
    fileName?: string;
    isReady : boolean;
    handleAddAllCodeSegmentsToWorkspace: (codeSegment: any, setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>, isTestCode: boolean) => void;
    handleRevertChanges: (codeSegment: any, setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>) => void
    message: { role: string; content: string; type: string };
    buttonsActive: boolean;
    isSyntaxError: boolean;
    isTestCode: boolean;
}

interface EntryContainerProps {
    isOpen: boolean;
}

//@ts-ignore
const EntryContainer = styled.div<EntryContainerProps>(({ isOpen }) => ({
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    cursor: "pointer",
    padding: "10px",
    backgroundColor: isOpen ? "var(--vscode-list-hoverBackground)" : "var(--vscode-editorHoverWidget-background)",
    "&:hover": {
        backgroundColor: "var(--vscode-list-hoverBackground)",
    },
}));

export function replaceCodeBlocks(originalResp: string, newResp: string): string {
    // Create a map to store new code blocks by filename
    const newCodeBlocks = new Map<string, string>();

    // Extract code blocks from newResp
    const newCodeRegex = /<code filename="(.+?)">\s*```ballerina\s*([\s\S]*?)```\s*<\/code>/g;
    let match;
    while ((match = newCodeRegex.exec(newResp)) !== null) {
        newCodeBlocks.set(match[1], match[2].trim());
    }

    // Replace code blocks in originalResp
    const updatedResp = originalResp.replace(
        /<code filename="(.+?)">\s*```ballerina\s*([\s\S]*?)```\s*<\/code>/g,
        (match, filename, content) => {
            const newContent = newCodeBlocks.get(filename);
            if (newContent !== undefined) {
                return `<code filename="${filename}">\n\`\`\`ballerina\n${newContent}\n\`\`\`\n</code>`;
            }
            return match; // If no new content, keep the original
        }
    );

    // Remove replaced code blocks from newCodeBlocks
    const originalCodeRegex = /<code filename="(.+?)">/g;
    while ((match = originalCodeRegex.exec(originalResp)) !== null) {
        newCodeBlocks.delete(match[1]);
    }

    // Append any remaining new code blocks
    let finalResp = updatedResp;
    newCodeBlocks.forEach((content, filename) => {
        finalResp += `\n\n<code filename="${filename}">\n\`\`\`ballerina\n${content}\n\`\`\`\n</code>`;
    });

    return finalResp;
}

function identifyLanguage(segmentText: string): string {
    if (segmentText.includes("<") && segmentText.includes(">") && /(?:name|key)="([^"]+)"/.test(segmentText)) {
        return "xml";
    } else if (segmentText.includes("```toml")) {
        return "toml";
    } else if (segmentText.startsWith("```ballerina")) {
        return "ballerina";
    } else if (segmentText.startsWith("```")) {
        // Split the string to get the first line
        const firstLine = segmentText.split("\n", 1)[0];
        // Remove the starting ```
        return firstLine.substring(3).trim();
    } else {
        return "";
    }
}

const CodeSegment: React.FC<CodeSegmentProps> = ({ segmentText, loading, fileName, isReady, handleAddAllCodeSegmentsToWorkspace, handleRevertChanges, message, buttonsActive, isSyntaxError, isTestCode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCodeAdded, setIsCodeAdded] = useState(false);

    // const language = identifyLanguage(segmentText);
    const language = "ballerina";
    let name = loading ? "Generating Integration..." : "Ballerina Integration";

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

    const allCodeSegments = splitContent(message.content)
        .filter(segment => segment.type === SegmentType.Code)
        .map(segment => ({ segmentText: segment.text, filePath: segment.fileName }));

    return (
        <div>
            <EntryContainer isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                <div style={{ flex: 9, fontWeight: 'bold' }}>
                    {name}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    {!loading && isReady && language === 'ballerina' && (
                        <>
                            {!isCodeAdded ? (
                                <Button
                                    appearance="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddAllCodeSegmentsToWorkspace(allCodeSegments, setIsCodeAdded, isTestCode);
                                    }}
                                    tooltip={isSyntaxError ? "Syntax issues detected in generated integration. Reattempt required" : ""}
                                    disabled={!buttonsActive || isSyntaxError}
                                >
                                    <Codicon name="add" />&nbsp;&nbsp;Add to Integration
                                </Button>
                            ) : (
                                <Button
                                    appearance="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRevertChanges(allCodeSegments, setIsCodeAdded);
                                    }}
                                    disabled={!buttonsActive}
                                >
                                    <Codicon name="history" />&nbsp;&nbsp;Revert to Checkpoint
                                </Button>
                            )}
                        </>
                    )}
                    {/* {!loading && !isReady &&language === 'ballerina' &&
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%" }}>
                        <ProgressRing sx={{ position: "relative" }} />
                        <Icon name="sync" sx={{ animation: "spin 2s linear infinite" }} />
                    </div>
                    } */}
                </div>
            </EntryContainer>
        </div>
    );
};

export async function fetchWithToken(url: string, options: RequestInit, rpcClient: any) {
    let response = await fetch(url, options);
    console.log("Response status: ", response.status);
    if (response.status === 401) {
        console.log("Token expired. Refreshing token...");
        const newToken = await rpcClient.getAiPanelRpcClient().getRefreshToken();
        console.log("refreshed token : " + newToken);
        if (newToken) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
            };
            response = await fetch(url, options);
        }
    }
    return response;
}

// Define the different event body types
interface ContentBlockDeltaBody {
    text: string;
}

interface OtherEventBody {
    // Define properties for other event types as needed
    [key: string]: any;
}

// Define the SSEEvent type with a discriminated union for the body
type SSEEvent = { event: "content_block_delta"; body: ContentBlockDeltaBody } | { event: string; body: OtherEventBody };

/**
 * Parses a chunk of text to extract the SSE event and body.
 * @param chunk - The chunk of text from the SSE stream.
 * @returns The parsed SSE event containing the event name and body (if present).
 * @throws Will throw an error if the data field is not valid JSON.
 */
export function parseSSEEvent(chunk: string): SSEEvent {
    let event: string | undefined;
    let body: any;

    chunk.split("\n").forEach((line) => {
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
    } else if (event === "functions") {
        return { event, body: body };
    } else {
        return { event, body: body as OtherEventBody };
    }
}

export function getProjectFromResponse(req: string): ProjectSource {
    const sourceFiles: SourceFile[] = [];
    const regex = /<code filename="([^"]+)">\s*```ballerina([\s\S]*?)```\s*<\/code>/g;
    let match;

    while ((match = regex.exec(req)) !== null) {
        const filePath = match[1];
        const fileContent = match[2].trim();
        sourceFiles.push({ filePath, content: fileContent });
    }

    return { sourceFiles };
}

enum SegmentType {
    Code = "Code",
    Text = "Text",
    Progress = "Progress",
    Attachment = "Attachment",
    Error = "Error",
}

interface Segment {
    type: SegmentType;
    loading: boolean;
    text: string;
    fileName?: string;
    isTestCode?: boolean;
    failed?: boolean;
}

function splitHalfGeneratedCode(content: string): Segment[] {
    const segments: Segment[] = [];
    // Regex to capture filename and optional test attribute
    const regex = /<code\s+filename="([^"]+)"(?:\s+test=(true|false))?>\s*```ballerina([\s\S]*?)$/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, fileName, testValue, code] = match;
        const isTestCode = testValue === "true";

        if (match.index > lastIndex) {
            // Non-code segment before the current code block
            segments.push({
                type: SegmentType.Text,
                loading: false,
                text: content.slice(lastIndex, match.index),
                isTestCode: isTestCode,
            });
        }

        // Code segment
        segments.push({
            type: SegmentType.Code,
            loading: true,
            text: code,
            fileName: fileName,
            isTestCode: isTestCode,
        });

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
        // Remaining non-code segment after the last code block
        segments.push({
            type: SegmentType.Text,
            loading: false,
            text: content.slice(lastIndex),
        });
    }

    return segments;
}

export function splitContent(content: string): Segment[] {
    const segments: Segment[] = [];

    // Combined regex to capture either <code ...>```ballerina code ```</code> or <progress>Text</progress>
    const regex =
        /<code\s+filename="([^"]+)"(?:\s+test=(true|false))?>\s*```ballerina([\s\S]*?)```\s*<\/code>|<progress>([\s\S]*?)<\/progress>|<attachment>([\s\S]*?)<\/attachment>|<error>([\s\S]*?)<\/error>/g;
    let match;
    let lastIndex = 0;

    function updateLastProgressSegmentLoading(failed: boolean = false) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && lastSegment.type === SegmentType.Progress) {
            lastSegment.loading = false;
            lastSegment.failed = failed;
        }
    }

    while ((match = regex.exec(content)) !== null) {
        // Handle text before the current match
        if (match.index > lastIndex) {
            updateLastProgressSegmentLoading();

            const textSegment = content.slice(lastIndex, match.index);
            segments.push(...splitHalfGeneratedCode(textSegment));
        }

        if (match[1]) {
            // <code> block matched
            const fileName = match[1];
            const testValue = match[2];
            const code = match[3];
            const isTestCode = testValue === "true";

            updateLastProgressSegmentLoading();
            segments.push({
                type: SegmentType.Code,
                loading: false,
                text: code,
                fileName: fileName,
                isTestCode: isTestCode,
            });
        } else if (match[4]) {
            // <progress> block matched
            const progressText = match[4];

            updateLastProgressSegmentLoading();
            segments.push({
                type: SegmentType.Progress,
                loading: true,
                text: progressText,
            });
        } else if (match[5]) {
            // <attachment> block matched
            const attachmentName = match[5].trim();

            updateLastProgressSegmentLoading();

            const existingAttachmentSegment = segments.find((segment) => segment.type === SegmentType.Attachment);

            if (existingAttachmentSegment) {
                existingAttachmentSegment.text += `, ${attachmentName}`;
            } else {
                segments.push({
                    type: SegmentType.Attachment,
                    loading: false,
                    text: attachmentName,
                });
            }
        } else if (match[6]) {
            // <error> block matched
            const errorMessage = match[6].trim();

            updateLastProgressSegmentLoading(true);
            segments.push({
                type: SegmentType.Error,
                loading: false,
                text: errorMessage,
            });
        }

        // Update lastIndex to the end of the current match
        lastIndex = regex.lastIndex;
    }

    // Handle any remaining text after the last match
    if (lastIndex < content.length) {
        updateLastProgressSegmentLoading();

        const remainingText = content.slice(lastIndex);
        segments.push(...splitHalfGeneratedCode(remainingText));
    }

    return segments;
}
