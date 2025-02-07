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
    ProjectSource,
    SourceFile,
    ProjectDiagnostics,
    InitialPrompt,
    MappingParameters,
    DataMappingRecord,
    PostProcessResponse,
} from "@wso2-enterprise/ballerina-core";

import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TextArea, Button, Switch, Icon, ProgressRing, Codicon } from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from "react-markdown";

import styled from "@emotion/styled";
import AIChatInput from "./AIChatInput";
import ProgressTextSegment from "./Components/ProgressTextSegment";
import RoleContainer, { PreviewContainer } from "./Components/RoleContainter";
import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import AttachmentBox, { AttachmentsContainer } from "./Components/AttachmentBox";
import { findRegexMatches } from "../../utils/utils";
import { Collapse } from "react-collapse";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import {
    MarkdownRenderer,
    Footer,
    FlexRow,
    AIChatView,
    Header,
    HeaderButtons,
    Main,
    ChatMessage,
    Welcome,
    Badge,
    ResetsInBadge
} from './styles'

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

// A string array to store all code blocks
const codeBlocks: string[] = [];
var projectUuid = "";
var backendRootUri = "";

let controller = new AbortController();
let signal = controller.signal;

var remainingTokenPercentage: string | number;
var remaingTokenLessThanOne: boolean = false;

var timeToReset: number;

// Define constants for command keys
export const COMMAND_SCAFFOLD = "/scaffold";
export const COMMAND_TESTS = "/tests";
export const COMMAND_DATAMAP = "/datamap";
export const COMMAND_TYPECREATOR = "/typecreator";

// Define constants for command templates
const TEMPLATE_SCAFFOLD = [
    "generate code for the use-case: <use-case>",
    "generate an integration according to the given Readme file",
];
const TEMPLATE_TESTS = ["generate test using <servicename> service"];
const TEMPLATE_DATAMAP = [
    "generate mapping using input as <recordname(s)> and output as <recordname> using the function <functionname>",
    "generate mapping using input as <recordname(s)> and output as <recordname>",
];
const TEMPLATE_TYPECREATOR = ["generate types using the given file"];

// Use the constants in the commandToTemplate map
const commandToTemplate = new Map<string, string[]>([
    [COMMAND_SCAFFOLD, TEMPLATE_SCAFFOLD],
    [COMMAND_TESTS, TEMPLATE_TESTS],
    [COMMAND_DATAMAP, TEMPLATE_DATAMAP],
    [COMMAND_TYPECREATOR, TEMPLATE_TYPECREATOR],
]);

//TODO: Add the files relevant to the commands
export const getFileTypesForCommand = (command: string): string[] => {
    switch (command) {
        case COMMAND_SCAFFOLD:
        case COMMAND_TESTS:
            return ["text/plain", "application/json", "application/x-yaml", "application/xml", "text/xml"];
        case COMMAND_DATAMAP:
        case COMMAND_TYPECREATOR:
            return [
                "text/plain",
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/heic",
                "image/heif",
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
            ];
        default:
            return ["text/plain", "application/json", "application/x-yaml", "application/xml", "text/xml"];
    }
};

//TOOD: Add the backend URL
//TODO: Add better error handling from backend. stream error type and non 200 status codes

export function AIChat() {
    const { rpcClient } = useRpcContext();
    const [userInput, setUserInput] = useState("");
    const [state, setState] = useState<VisualizerLocation | null>(null);
    const [messages, setMessages] = useState<Array<{ role: string; content: string; type: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [currentGeneratingPromptIndex, setCurrentGeneratingPromptIndex] = useState(-1);
    const [isSyntaxError, setIsSyntaxError] = useState(false);

    const messagesEndRef = React.createRef<HTMLDivElement>();

    let codeSegmentRendered = false;
    let tempStorage: { [filePath: string]: string } = {};
    const initialFiles = new Set<string>();
    const emptyFiles = new Set<string>();

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
                        const command = COMMAND_SCAFFOLD;
                        const template = commandToTemplate.get(command)?.[1];
                        if (initPrompt.exists) {
                            setUserInput(template ? command + " " + template : command);
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
            console.log(parameters);

            if (parameters) {
                switch (commandKey) {
                    case COMMAND_SCAFFOLD: {
                        await processCodeGeneration(
                            token,
                            [
                                parameters.inputRecord.length === 1 && parameters.inputRecord[0] !== undefined
                                    ? parameters.inputRecord[0]
                                    : messageBody,
                                attachments,
                            ],
                            message
                        );
                        break;
                    }
                    case COMMAND_TESTS: {
                        await processTestGeneration(content, token, parameters.inputRecord[0]);
                        break;
                    }
                    case COMMAND_DATAMAP: {
                        if (parameters.inputRecord.length >= 1 && parameters.outputRecord) {
                            await processMappingParameters(message, token, parameters, attachments);
                        } else {
                            throw new Error("Error: Invalid parameters for " + COMMAND_DATAMAP + " command");
                        }
                        break;
                    }
                    case COMMAND_TYPECREATOR: {
                        if (messageBody === TEMPLATE_TYPECREATOR[0]) {
                            if (attachments) {
                                await processContextTypeCreation(message, token, attachments);
                            } else {
                                throw new Error("Error: Missing Attach context");
                            }
                        } else {
                            throw new Error("Error: Invalid parameters for " + COMMAND_DATAMAP + " command");
                        }
                        break;
                    }
                }
            } else {
                throw new Error(
                    `Invalid template format for the \`${commandKey}\` command. ` +
                        `Please ensure you follow the correct template.`
                );
            }
        } else {
            await processCodeGeneration(token, content, message);
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

    function extractParameters(command: string, messageBody: string): MappingParameters | null {
        const expectedTemplates = commandToTemplate.get(command);
        for (const template of expectedTemplates ?? []) {
            let pattern = template
                .replace(/<servicename>/g, "(\\S+?)")
                .replace(/<recordname\(s\)>/g, "([\\w:\\[\\]]+(?:[\\s,]+[\\w:\\[\\]]+)*)")
                .replace(/<recordname>/g, "([\\w:\\[\\]]+)")
                .replace(/<use-case>/g, "(.+?)")
                .replace(/<functionname>/g, "(\\S+?)");

            const regex = new RegExp(`^${pattern}$`, "i");
            const match = messageBody.match(regex);
            if (match) {
                if (command === COMMAND_DATAMAP && template.includes("<recordname(s)>")) {
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
                    const functionName = match[3]?.trim() || "";
                    return {
                        inputRecord: inputRecordList,
                        outputRecord: outputRecordName,
                        functionName,
                    };
                }
                const [inputRecord, outputRecord, functionName] = match.slice(1).map((param) => param.trim());
                return {
                    inputRecord: [inputRecord],
                    outputRecord,
                    functionName,
                };
            }
        }
        return null;
    }

    async function processCodeGeneration(token: string, content: [string, AttachmentResult[]], message: string) {
        const [useCase, attachments] = content;

        let assistant_response = "";
        const project: ProjectSource = await rpcClient.getAiPanelRpcClient().getProjectSource();
        const requestBody: any = {
            usecase: useCase,
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
            let error = `Failed to fetch response.`;
            if (response.status == 429) {
                response.json().then((body) => {
                    error += ` Cause: ${body.detail}`;
                });
            }
            throw new Error(error);
        }
        const reader: ReadableStreamDefaultReader<Uint8Array> = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let codeSnippetBuffer = "";
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

                handleContentBlockDelta(textDelta);
            } else if (event.event == "functions") {
                functions = event.body;
            } else if (event.event == "message_stop") {
                const postProcessResp: PostProcessResponse = await rpcClient.getAiPanelRpcClient().postProcess({
                    assistant_response: assistant_response,
                });
                assistant_response = postProcessResp.assistant_response;
                const diagnostics = postProcessResp.diagnostics.diagnostics;
                if (diagnostics.length > 0) {
                    console.log("Diagnostics : ");
                    console.log(diagnostics);
                    //TODO: fill
                    const diagReq = {
                        response: assistant_response,
                        diagnostics: diagnostics,
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
                                usecase: useCase,
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
                        setIsCodeLoading(false);
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
                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1].content = assistant_response;
                        return newMessages;
                    });
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

        function handleContentBlockDelta(textDelta: string) {
            const matchText = codeSnippetBuffer + textDelta;
            const matchedResult = findRegexMatches(matchText);
            if (matchedResult.length > 0) {
                if (matchedResult[0].end === matchText.length) {
                    codeSnippetBuffer = matchText;
                } else {
                    codeSnippetBuffer = "";
                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1].content += matchText;
                        return newMessages;
                    });
                }
            } else {
                codeSnippetBuffer = "";
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content += matchText;
                    return newMessages;
                });
            }
        }

        const userMessage = getUserMessage([message, attachments]);
        addChatEntry("user", userMessage);
        const diagnosedSourceFiles: ProjectSource = getProjectFromResponse(assistant_response);
        setIsSyntaxError(await rpcClient.getAiPanelRpcClient().checkSyntaxError(diagnosedSourceFiles));
        addChatEntry("assistant", assistant_response);
    }

    const handleAddAllCodeSegmentsToWorkspace = async (
        codeSegments: any,
        setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>,
        command: string
    ) => {
        console.log("Add to integration called. Command: ", command);
        for (let { segmentText, filePath } of codeSegments) {
            let originalContent = "";
            if (!tempStorage[filePath]) {
                try {
                    originalContent = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: filePath });
                    console.log(originalContent);
                    tempStorage[filePath] = originalContent;
                    if (originalContent === "") {
                        emptyFiles.add(filePath);
                    } else {
                        initialFiles.add(filePath);
                    }
                } catch (error) {
                    tempStorage[filePath] = "";
                }
            }
            if (command === "ai_map") {
                segmentText = `${originalContent}\n${segmentText}`;
            } else {
                segmentText = `${segmentText}`;
            }

            let isTestCode = false;
            if (command === "test") {
                isTestCode = true;
            }
            await rpcClient
                .getAiPanelRpcClient()
                .addToProject({ filePath: filePath, content: segmentText, isTestCode: isTestCode });
        }
        setIsCodeAdded(true);
    };

    const handleRevertChanges = async (
        codeSegments: any,
        setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>,
        command: string
    ) => {
        console.log("Revert integration called. Command: ", command);

        for (const { filePath } of codeSegments) {
            let originalContent = tempStorage[filePath];
            if (originalContent === "" && !initialFiles.has(filePath) && !emptyFiles.has(filePath)) {
                // Delete the file if it didn't initially exist in the workspace
                try {
                    await rpcClient.getAiPanelRpcClient().deleteFromProject({ filePath: filePath });
                } catch (error) {
                    console.error(`Error deleting file ${filePath}:`, error);
                }
            } else {
                let isTestCode = false;
                if (command === "test") {
                    isTestCode = true;
                }
                const revertContent = emptyFiles.has(filePath) ? "" : originalContent;
                await rpcClient
                    .getAiPanelRpcClient()
                    .addToProject({ filePath: filePath, content: revertContent, isTestCode: isTestCode });
            }
        }
        tempStorage = {};
        setIsCodeAdded(false);
    };

    async function processTestGeneration(content: [string, AttachmentResult[]], token: string, serviceName: string) {
        let assistant_response = "";

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `Initiating test generation for the ${serviceName} service. Please wait...`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        let generatedTestCode = "";
        let configToml = "";
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `\n\n<progress>Generating tests for the ${serviceName} service. This may take a moment.</progress>`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const response = await rpcClient
            .getAiPanelRpcClient()
            .getGeneratedTest({ backendUri: backendRootUri, token: token, serviceName: serviceName });
        generatedTestCode = response.testContent;
        configToml = response.configContent;
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            assistant_response += `\n<progress>Analyzing generated tests for potential issues.</progress>`;
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const diagnostics = await rpcClient.getAiPanelRpcClient().getTestDiagnostics(response);
        if (diagnostics.diagnostics.length > 0) {
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                assistant_response += `\n<progress>Refining tests based on feedback to ensure accuracy and reliability.</progress>`;
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
        assistant_response += `\n\n<code filename="tests/test.bal" type="test">\n\`\`\`ballerina\n${generatedTestCode}\n\`\`\`\n</code>`;
        if (configToml !== undefined && configToml !== "") {
            assistant_response += `\n\n<code filename="tests/Config.toml" type="test">\n\`\`\`ballerina\n${configToml}\n\`\`\`\n</code>`;
        }
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });

        const userMessage = getUserMessage(content);
        addChatEntry("user", userMessage);
        addChatEntry("assistant", assistant_response);
    }

    async function processMappingParameters(
        message: string,
        token: string,
        parameters: MappingParameters,
        attachments?: AttachmentResult[]
    ) {
        let assistant_response = "";
        const recordMap = new Map();
        const importsMap = new Map();
        setIsLoading(true);

        const inputParams = parameters.inputRecord;
        const outputParam = parameters.outputRecord;
        const functionName = parameters.functionName || "transform";

        const invalidPattern = /[<>\/\(\)\{\}\[\]\\!@#$%^&*_+=|;:'",.?`~]/;

        if (invalidPattern.test(functionName)) {
            throw new Error("Please provide a valid function name without special characters.");
        }

        const projectImports = await rpcClient.getBIDiagramRpcClient().getAllImports();
        const activeFile = await rpcClient.getAiPanelRpcClient().getActiveFile();
        const fileContent = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: activeFile });
        const projectComponents = await rpcClient.getBIDiagramRpcClient().getProjectComponents();

        const activeFileImports =
            projectImports.imports.find((file) => {
                const fileName = file.filePath.split("/").pop();
                return fileName === activeFile;
            })?.statements || [];

        projectComponents.components.packages?.forEach((pkg) => {
            pkg.modules?.forEach((mod) => {
                let filepath = pkg.filePath;
                if (mod.name !== undefined) {
                    filepath += `modules/${mod.name}/`;
                }
                mod.records.forEach((rec) => {
                    const recFilePath = filepath + rec.filePath;
                    recordMap.set(rec.name, { type: rec.name, isArray: false, filePath: recFilePath });
                });
            });
        });

        const inputs: DataMappingRecord[] = inputParams.map((param: string) => {
            const isArray = param.endsWith("[]");
            const recordName = param.replace(/\[\]$/, "");
            const rec = recordMap.get(recordName);

            if (!rec) {
                if (recordName.includes(":")) {
                    const [moduleName, alias] = recordName.split(":");
                    const matchedImport = activeFileImports.find((imp) => {
                        if (imp.alias) {
                            // Match using alias if it exists
                            return recordName.startsWith(imp.alias);
                        }
                        // If alias doesn't exist, match using the last part of the module name
                        const moduleNameParts = imp.moduleName.split(".");
                        const inferredAlias = moduleNameParts[moduleNameParts.length - 1];
                        return recordName.startsWith(inferredAlias);
                    });

                    if (!matchedImport) {
                        throw new Error(`Must import the module for "${recordName}".`);
                    }
                    // Use the actual alias if present, otherwise infer from the module name
                    const resolvedAlias = matchedImport.alias || matchedImport.moduleName.split(".").pop();
                    importsMap.set(recordName, {
                        moduleName: matchedImport.moduleName,
                        alias: resolvedAlias,
                    });
                    return { type: `${recordName}`, isArray, filePath: null };
                } else {
                    throw new Error(`${recordName} is not defined.`);
                }
            }
            return { ...rec, isArray };
        });

        const outputRecordName = outputParam.replace(/\[\]$/, "");
        const outputIsArray = outputParam.endsWith("[]");
        let output = recordMap.get(outputRecordName);

        if (!output) {
            if (outputRecordName.includes(":")) {
                const [moduleName, alias] = outputRecordName.split(":");
                    const matchedImport = activeFileImports.find((imp) => {
                        if (imp.alias) {
                            // Match using alias if it exists
                            return outputRecordName.startsWith(imp.alias);
                        }
                        // If alias doesn't exist, match using the last part of the module name
                        const moduleNameParts = imp.moduleName.split(".");
                        const inferredAlias = moduleNameParts[moduleNameParts.length - 1];
                        return outputRecordName.startsWith(inferredAlias);
                    });

                    if (!matchedImport) {
                        throw new Error(`Must import the module for "${outputRecordName}".`);
                    }
                    // Use the actual alias if present, otherwise infer from the module name
                    const resolvedAlias = matchedImport.alias || matchedImport.moduleName.split(".").pop();
                    importsMap.set(outputRecordName, {
                        moduleName: matchedImport.moduleName,
                        alias: resolvedAlias,
                    });
                    output = { type: `${outputRecordName}`, isArray: outputIsArray, filePath: null };
            } else {
                throw new Error(`${outputRecordName} is not defined.`);
            }
        } else {
            output = { ...output, isArray: outputIsArray };
        }

        const requestPayload: any = {
            backendUri: "",
            token: "",
            inputRecordTypes: inputs,
            outputRecordType: output,
            functionName,
            imports: Array.from(importsMap.values()),
        };
        if (attachments && attachments.length > 0) {
            requestPayload.attachment = attachments;
        }
        const response = await rpcClient.getAiPanelRpcClient().getMappingsFromRecord(requestPayload);
        setIsLoading(false);

        assistant_response = `Mappings consist of the following:\n`;
        if (inputParams.length === 1) {
            assistant_response += `- **Input Record**: ${inputParams[0]}\n`;
        } else {
            assistant_response += `- **Input Records**: ${inputParams.join(", ")}\n`;
        }
        assistant_response += `- **Output Record**: ${outputParam}\n`;
        assistant_response += `- **Function Name**: ${functionName}\n`;

        let filePath = "mappings.bal";
        let finalContent = response.mappingCode;
        const needsImports = Array.from(importsMap.values()).length > 0;

        if (needsImports) {
            filePath = activeFile;
            finalContent = `${fileContent}\n${response.mappingCode}`;
        }
        assistant_response += `<code filename="${filePath}" type="ai_map">\n\`\`\`ballerina\n${finalContent}\n\`\`\`\n</code>`;

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });
        addChatEntry("user", message);
        addChatEntry("assistant", assistant_response);
    }

    async function processContextTypeCreation(message: string, token: string, attachments: AttachmentResult[]) {
        let assistant_response = "";
        const recordMap = new Map();
        setIsLoading(true);
        let filePath = "types.bal";

        const projectComponents = await rpcClient.getBIDiagramRpcClient().getProjectComponents();

        projectComponents.components.packages?.forEach((pkg) => {
            pkg.modules?.forEach((mod) => {
                let filepath = pkg.filePath;
                if (mod.name !== undefined) {
                    filepath += `modules/${mod.name}/`;
                }
                mod.records.forEach((rec) => {
                    const recFilePath = filepath + rec.filePath;
                    recordMap.set(rec.name, { type: rec.name, isArray: false, filePath: recFilePath });
                });
            });
        });

        if (!attachments || attachments.length === 0) {
            throw new Error(`Missing attachment`);
        }

        const requestPayload: any = {
            backendUri: "",
            token: token,
            attachment: attachments,
        };

        const response = await rpcClient.getAiPanelRpcClient().getTypesFromRecord(requestPayload);
        let typeContent = response.typesCode;
        const newRecords = extractRecordTypes(typeContent);

        let fileContent = "";
        let fileExists = await rpcClient.getAiPanelRpcClient().getFileExists({ filePath: filePath });
        if (fileExists) {
            fileContent = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: filePath });
            typeContent = `${fileContent}\n${response.typesCode}`;
        }

        for (const record of newRecords) {
            if (recordMap.has(record.name)) {
                throw new Error(`Record "${record.name}" already exists in the workspace.`);
            }
        }

        assistant_response = `Record types generated from the ${attachments[0].name} file shown below.\n`;
        assistant_response += `<code filename="${filePath}">\n\`\`\`ballerina\n${response.typesCode}\n\`\`\`\n</code>`;

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });
        setIsLoading(false);
        addChatEntry("user", message);
        addChatEntry("assistant", assistant_response);
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

    async function handleSettings() {
        await rpcClient.getAiPanelRpcClient().openSettings();
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
    const otherMessages = messages.filter((message) => message.type !== "question");
    useEffect(() => {
        // Set the currentGeneratingPromptIndex to the last prompt index whenever otherMessages updates
        if (otherMessages.length > 0) {
            setCurrentGeneratingPromptIndex(otherMessages.length - 1);
        }
    }, [otherMessages.length]);

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
                    <Button appearance="icon" onClick={() => handleSettings()} tooltip="Settings">
                        <Codicon name="settings-gear" />
                        &nbsp;&nbsp;Settings
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
                    return (
                        <ChatMessage>
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
                                    const nextSegment = splitContent(message.content)[i + 1];
                                    if (
                                        nextSegment &&
                                        (nextSegment.type === SegmentType.Code ||
                                            (nextSegment.type === SegmentType.Text && nextSegment.text.trim() === ""))
                                    ) {
                                        return;
                                    } else {
                                        const codeSegments = [];
                                        let j = i;
                                        while (j >= 0) {
                                            const prevSegment = splitContent(message.content)[j];
                                            if (prevSegment.type === SegmentType.Code) {
                                                codeSegments.unshift({
                                                    source: prevSegment.text.trim(),
                                                    fileName: prevSegment.fileName,
                                                });
                                            } else if (
                                                prevSegment.type === SegmentType.Text &&
                                                prevSegment.text.trim() === ""
                                            ) {
                                                j--;
                                                continue;
                                            } else {
                                                break;
                                            }
                                            j--;
                                        }
                                        return (
                                            <CodeSection
                                                key={i}
                                                codeSegments={codeSegments}
                                                loading={isLoading && showGeneratingFiles}
                                                handleAddAllCodeSegmentsToWorkspace={
                                                    handleAddAllCodeSegmentsToWorkspace
                                                }
                                                handleRevertChanges={handleRevertChanges}
                                                isReady={!isCodeLoading}
                                                message={message}
                                                buttonsActive={showGeneratingFiles}
                                                isSyntaxError={isSyntaxError}
                                                command={segment.command}
                                            />
                                        );
                                    }
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
                                        <div
                                            key={i}
                                            style={{ color: "var(--vscode-errorForeground)", marginTop: "10px" }}
                                        >
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
                    );
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
                        value={userInput}
                        baseCommands={commandToTemplate}
                        onSend={handleSend}
                        onStop={handleStop}
                        isLoading={isLoading}
                    />
                </FlexRow>
            </Footer>
        </AIChatView>
    );
}

// ---------- CODE-SEGMENT ----------

interface EntryContainerProps {
    isOpen: boolean;
}

const EntryContainer = styled.div({
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    cursor: "pointer",
    padding: "10px",
    backgroundColor: "var(--vscode-list-hoverBackground)",
    "&:hover": {
        backgroundColor: "var(--vscode-badge-background)",
    },
});

const CodeSegmentHeader = styled.div({
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    cursor: "pointer",
    padding: "6px 8px",
    backgroundColor: "var(--vscode-list-hoverBackground)",
});

interface CodeSegmentProps {
    source: string;
    fileName: string;
    language?: string;
}

const CodeSegment: React.FC<CodeSegmentProps> = ({ source, fileName, language = "ballerina" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <CodeSegmentHeader onClick={() => setIsOpen(!isOpen)}>
                <div style={{ flex: 9, fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                    {isOpen ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                    {fileName}
                </div>
            </CodeSegmentHeader>
            <Collapse isOpened={isOpen}>
                <div style={{ backgroundColor: "var(--vscode-list-hoverBackground)", padding: "6px" }}>
                    <pre
                        style={{
                            backgroundColor: "var(--vscode-editorWidget-background)",
                            margin: 0,
                            padding: 2,
                            borderRadius: 6,
                        }}
                    >
                        <SyntaxHighlighter
                            language={language}
                            style={{
                                'pre[class*="language-"]': {
                                    backgroundColor: "var(--vscode-editorWidget-background)",
                                    color: "var(--vscode-editor-foreground)",
                                    overflowX: "auto",
                                    padding: "6px",
                                },
                                'code[class*="language-"]': {
                                    backgroundColor: "var(--vscode-editorWidget-background)",
                                    color: "var(--vscode-editor-foreground)",
                                },
                            }}
                        >
                            {source}
                        </SyntaxHighlighter>
                    </pre>
                </div>
            </Collapse>
        </div>
    );
};

interface CodeSectionProps {
    codeSegments: CodeSegmentProps[];
    loading: boolean;
    isReady: boolean;
    handleAddAllCodeSegmentsToWorkspace: (
        codeSegment: any,
        setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>,
        command: string
    ) => void;
    handleRevertChanges: (
        codeSegment: any,
        setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>,
        command: string
    ) => void;
    message: { role: string; content: string; type: string };
    buttonsActive: boolean;
    isSyntaxError: boolean;
    command: string;
}

const CodeSection: React.FC<CodeSectionProps> = ({
    codeSegments,
    loading,
    isReady,
    handleAddAllCodeSegmentsToWorkspace,
    handleRevertChanges,
    message,
    buttonsActive,
    isSyntaxError,
    command,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCodeAdded, setIsCodeAdded] = useState(false);

    const language = "ballerina";
    let isTestCode = false;
    if (command === "test") {
        isTestCode = true;
    }
    let name = loading
        ? "Generating " + (isTestCode ? "Tests..." : "Integration...")
        : isTestCode
        ? "Ballerina Tests"
        : "Ballerina Integration";

    const allCodeSegments = splitContent(message.content)
        .filter((segment) => segment.type === SegmentType.Code)
        .map((segment) => ({ segmentText: segment.text, filePath: segment.fileName }));

    return (
        <div>
            <EntryContainer onClick={() => !loading && setIsOpen(!isOpen)}>
                <div style={{ flex: 9, fontWeight: "bold" }}>{name}</div>
                <div style={{ marginLeft: "auto" }}>
                    {!loading && isReady && language === "ballerina" && (
                        <>
                            {!isCodeAdded ? (
                                <Button
                                    appearance="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddAllCodeSegmentsToWorkspace(
                                            allCodeSegments,
                                            setIsCodeAdded,
                                            command
                                        );
                                    }}
                                    tooltip={
                                        isSyntaxError
                                            ? "Syntax issues detected in generated integration. Reattempt required"
                                            : ""
                                    }
                                    disabled={!buttonsActive || isSyntaxError}
                                >
                                    <Codicon name="add" />
                                    &nbsp;&nbsp;Add to Integration
                                </Button>
                            ) : (
                                <Button
                                    appearance="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRevertChanges(allCodeSegments, setIsCodeAdded, command);
                                    }}
                                    disabled={!buttonsActive}
                                >
                                    <Codicon name="history" />
                                    &nbsp;&nbsp;Revert to Checkpoint
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </EntryContainer>
            <Collapse isOpened={isOpen}>
                <div
                    style={{
                        backgroundColor: "var(--vscode-editorWidget-background)",
                        padding: "8px",
                        gap: "8px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {codeSegments.map((segment, index) => (
                        <CodeSegment
                            key={index}
                            source={segment.source}
                            fileName={segment.fileName}
                            language={segment.language}
                        />
                    ))}
                </div>
            </Collapse>
        </div>
    );
};

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

function extractRecordTypes(typesCode: string): { name: string; code: string }[] {
    const recordPattern = /\b(?:public|private)?\s*type\s+(\w+)\s+record\s+(?:{[|]?|[|]?{)[\s\S]*?;?\s*[}|]?;/g;
    const matches = [...typesCode.matchAll(recordPattern)];
    return matches.map((match) => ({
        name: match[1],
        code: match[0].trim(),
    }));
}

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
    language?: string;
    loading: boolean;
    text: string;
    fileName?: string;
    command?: string;
    failed?: boolean;
}

function getCommand(command: string) {
    if (!command) {
        return "code";
    } else {
        return command.replaceAll(/"/g, "");
    }
}

function splitHalfGeneratedCode(content: string): Segment[] {
    const segments: Segment[] = [];
    // Regex to capture filename and optional test attribute
    const regex = /<code\s+filename="([^"]+)"(?:\s+type=("test"|"ai_map"))?>\s*```(\w+)\s*([\s\S]*?)$/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, fileName, type, language, code] = match;
        if (match.index > lastIndex) {
            // Non-code segment before the current code block
            segments.push({
                type: SegmentType.Text,
                loading: false,
                text: content.slice(lastIndex, match.index),
                command: getCommand(type),
            });
        }

        // Code segment
        segments.push({
            type: SegmentType.Code,
            language: language,
            loading: true,
            text: code,
            fileName: fileName,
            command: getCommand(type),
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

    // Combined regex to capture either <code ...>```<language> code ```</code> or <progress>Text</progress>
    const regex =
        /<code\s+filename="([^"]+)"(?:\s+type=("test"|"ai_map"))?>\s*```(\w+)\s*([\s\S]*?)```\s*<\/code>|<progress>([\s\S]*?)<\/progress>|<attachment>([\s\S]*?)<\/attachment>|<error>([\s\S]*?)<\/error>/g;
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
            const type = match[2];
            const language = match[3];
            const code = match[4];
            updateLastProgressSegmentLoading();
            segments.push({
                type: SegmentType.Code,
                loading: false,
                text: code,
                fileName: fileName,
                language: language,
                command: getCommand(type),
            });
        } else if (match[5]) {
            // <progress> block matched
            const progressText = match[5];

            updateLastProgressSegmentLoading();
            segments.push({
                type: SegmentType.Progress,
                loading: true,
                text: progressText,
            });
        } else if (match[6]) {
            // <attachment> block matched
            const attachmentName = match[6].trim();

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
        } else if (match[7]) {
            // <error> block matched
            const errorMessage = match[7].trim();

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
