/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import {
    VisualizerLocation,
    GetWorkspaceContextResponse,
    ProjectSource,
    SourceFile,
    InitialPrompt,
    MappingParameters,
    DataMappingRecord,
    PostProcessResponse,
    TestGenerationTarget,
    LLMDiagnostics,
    ImportStatement,
    DiagnosticEntry,
    ExistingFunction,
} from "@wso2-enterprise/ballerina-core";

import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TextArea, Button, Switch, Icon, ProgressRing, Codicon, Typography } from "@wso2-enterprise/ui-toolkit";

import styled from "@emotion/styled";
import AIChatInput from "./Components/AIChatInput";
import ProgressTextSegment, { Spinner } from "./Components/ProgressTextSegment";
import RoleContainer, { PreviewContainer, PreviewContainerDefault } from "./Components/RoleContainter";
import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import AttachmentBox, { AttachmentsContainer } from "./Components/AttachmentBox";
import { findRegexMatches } from "../../utils/utils";

import {
    Footer,
    FlexRow,
    AIChatView,
    Header,
    HeaderButtons,
    Main,
    ChatMessage,
    Welcome,
    Badge,
    ResetsInBadge,
} from "./styles";
import ReferenceDropdown from "./Components/ReferenceDropdown";
import AccordionItem from "./Components/TestScenarioSegment";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { TestGeneratorIntermediaryState } from "./features/testGenerator";
import { CopilotContentBlockContent, CopilotErrorContent, CopilotEvent, parseCopilotSSEEvent } from "./utils/sse_utils";
import MarkdownRenderer from "./Components/MarkdownRenderer";
import { CodeSection } from "./Components/CodeSection";
import { CodeSegment } from "./Components/CodeSegment";

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

interface ChatIndexes {
    integratedChatIndex: number;
    previouslyIntegratedChatIndex: number;
}

enum CodeGenerationType {
    CODE_FOR_USER_REQUIREMENT = "CODE_FOR_USER_REQUIREMENT",
    TESTS_FOR_USER_REQUIREMENT = "TESTS_FOR_USER_REQUIREMENT",
    CODE_GENERATION = "CODE_GENERATION",
}

var chatArray: ChatEntry[] = [];
var integratedChatIndex = 0;
var previouslyIntegratedChatIndex = 0;
var previousDevelopmentDocumentContent = "";

// A string array to store all code blocks
const codeBlocks: string[] = [];
var projectUuid = "";
var backendRootUri = "";
var chatLocation = "";

let controller = new AbortController();
let signal = controller.signal;

var remainingTokenPercentage: string | number;
var remaingTokenLessThanOne: boolean = false;

var timeToReset: number;
const INVALID_RECORD_REFERENCE: Error = new Error("Invalid record reference. Follow <org-name>/<package-name>:<record-name> format when referencing to record in another package.");
const NO_DRIFT_FOUND = "No drift identified between the code and the documentation.";
const DRIFT_CHECK_ERROR = "Failed to check drift between the code and the documentation. Please try again.";
const RATE_LIMIT_ERROR = ` Cause: Your usage limit has been exceeded. This should reset in the beggining of the next month.`;

// Define constants for command keys
export const COMMAND_GENERATE = "/generate";
export const COMMAND_SCAFFOLD = "/scaffold";
export const COMMAND_NATURAL_PROGRAMMING = "/natural-programming";
export const COMMAND_TESTS = "/tests";
export const COMMAND_DATAMAP = "/datamap";
export const COMMAND_TYPECREATOR = "/typecreator";
export const COMMAND_DOCUMENTATION = "/ask";
export const COMMAND_HEALTHCARE = "/healthcare";
export const COMMAND_OPENAPI = "/openapi";

// Define constants for command templates
const TEMPLATE_GENERATE = [
    "generate code for the use-case: ",
    "generate an integration according to the given Readme file",
];
const TEMPLATE_TESTS = [
    "generate tests for <servicename> service",
    "generate tests for resource <method(space)path> function",
];
export const TEMPLATE_DATAMAP = [
    "generate mappings using input as <recordname(s)> and output as <recordname> using the function <functionname>",
    "generate mappings for the <functionname> function",
];
const TEMPLATE_TYPECREATOR = ["generate types using the attatched file"];
const TEMPLATE_DOCUMENTATION: string[] = [];
const TEMPLATE_HEALTHCARE: string[] = [];
const TEMPLATE_OPENAPI: string[] = [];

const DEFAULT_MENU_COMMANDS = [
    { command: COMMAND_GENERATE + " write a hello world http service" },
    { command: COMMAND_DOCUMENTATION + " how to write a concurrent application?" },
];

const GENERATE_TEST_AGAINST_THE_REQUIREMENT = "Generate tests against the requirements";
const GENERATE_CODE_AGAINST_THE_REQUIREMENT = "Generate code based on the requirements";
const CHECK_DRIFT_BETWEEN_CODE_AND_DOCUMENTATION = "Check drift between code and documentation";
const GENERATE_CODE_AGAINST_THE_REQUIREMENT_TEMPLATE = `${GENERATE_CODE_AGAINST_THE_REQUIREMENT}: <requirements>`;

const TEMPLATE_NATURAL_PROGRAMMING: string[] = [];

// Use the constants in the commandToTemplate map
const commandToTemplate = new Map<string, string[]>([
    [COMMAND_GENERATE, TEMPLATE_GENERATE],
    [COMMAND_TESTS, TEMPLATE_TESTS],
    [COMMAND_DATAMAP, TEMPLATE_DATAMAP],
    [COMMAND_TYPECREATOR, TEMPLATE_TYPECREATOR],
    [COMMAND_HEALTHCARE, TEMPLATE_HEALTHCARE],
    [COMMAND_DOCUMENTATION, TEMPLATE_DOCUMENTATION],
    [COMMAND_NATURAL_PROGRAMMING, TEMPLATE_NATURAL_PROGRAMMING],
    [COMMAND_OPENAPI, TEMPLATE_OPENAPI],
]);

//TODO: Add the files relevant to the commands
//TODO: Need to see if mime checking is the way to go, .sql and .graphql returns empty here.
export const getFileTypesForCommand = (command: string): string[] => {
    switch (command) {
        case COMMAND_GENERATE:
        case COMMAND_TESTS:
            return [
                "text/plain",
                "application/json",
                "application/x-yaml",
                "application/xml",
                "text/xml",
                ".sql",
                ".graphql",
                "",
            ];
        case COMMAND_NATURAL_PROGRAMMING:
            return [
                "text/plain",
                "application/json",
                "application/x-yaml",
                "application/xml",
                "text/xml",
                ".sql",
                ".graphql",
                "",
            ];
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
            return [
                "text/plain",
                "application/json",
                "application/x-yaml",
                "application/xml",
                "text/xml",
                ".sql",
                ".graphql",
                "",
            ];
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
    const [isReqFileExists, setIsReqFileExists] = useState(false);
    const [isPromptExecutedInCurrentWindow, setIsPromptExecutedInCurrentWindow] = useState(false);
    const [testGenIntermediaryState, setTestGenIntermediaryState] = useState<TestGeneratorIntermediaryState | null>(
        null
    );
    const [currentDiagnostics, setCurrentDiagnostics] = useState<any[]>([]);
    const [functions, setFunctions] = useState<any>([]);

    const messagesEndRef = React.createRef<HTMLDivElement>();

    let codeSegmentRendered = false;
    let tempStorage: { [filePath: string]: string } = {};
    const initialFiles = new Set<string>();
    const emptyFiles = new Set<string>();

    async function fetchBackendUrl() {
        try {
            backendRootUri = await rpcClient.getAiPanelRpcClient().getBackendURL();
            chatLocation = (await rpcClient.getVisualizerLocation()).projectUri;
            setIsReqFileExists(
                chatLocation != null &&
                    chatLocation != undefined &&
                    (await rpcClient.getAiPanelRpcClient().isRequirementsSpecificationFileExist(chatLocation))
            );

            generateNaturalProgrammingTemplate(isReqFileExists);
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

                const localStorageIndexFile = `chatArray-AIGenerationChat-${projectUuid}-developer-index`;
                const storedIndexes = localStorage.getItem(localStorageIndexFile);
                if (storedIndexes) {
                    const indexes: ChatIndexes = JSON.parse(storedIndexes);
                    integratedChatIndex = indexes.integratedChatIndex;
                    previouslyIntegratedChatIndex = indexes.previouslyIntegratedChatIndex;
                }

                const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
                const storedChatArray = localStorage.getItem(localStorageFile);
                rpcClient
                    .getAiPanelRpcClient()
                    .getInitialPrompt()
                    .then((initPrompt: InitialPrompt) => {
                        const command = initPrompt.exists && initPrompt.text === "datamap"
                            ? COMMAND_DATAMAP
                            : COMMAND_GENERATE;

                        let template = commandToTemplate.get(command)?.[1];

                        if (template && initPrompt.dataMappingFunctionName) {
                            template = template.replace('<functionname>', initPrompt.dataMappingFunctionName);
                        }

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

    function generateNaturalProgrammingTemplate(isReqFileExists: boolean) {
        TEMPLATE_NATURAL_PROGRAMMING.splice(0, TEMPLATE_NATURAL_PROGRAMMING.length);
        if (isReqFileExists) {
            TEMPLATE_NATURAL_PROGRAMMING.push(
                CHECK_DRIFT_BETWEEN_CODE_AND_DOCUMENTATION,
                GENERATE_CODE_AGAINST_THE_REQUIREMENT,
                GENERATE_TEST_AGAINST_THE_REQUIREMENT
            );
        } else {
            TEMPLATE_NATURAL_PROGRAMMING.push(
                GENERATE_CODE_AGAINST_THE_REQUIREMENT_TEMPLATE,
                CHECK_DRIFT_BETWEEN_CODE_AND_DOCUMENTATION,
                GENERATE_TEST_AGAINST_THE_REQUIREMENT
            );
        }
    }

    function addChatEntry(role: string, content: string): void {
        chatArray.push({
            actor: role,
            message: content,
        });

        localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));
    }

    function updateChatEntry(chatIdx: number, newEntry: ChatEntry): void {
        if (chatIdx >= 0 && chatIdx < chatArray.length) {
            chatArray[chatIdx] = newEntry;

            localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));
        }
    }

    useEffect(() => {
        // This code will run after isCodeLoading updates
        console.log(isCodeLoading);
    }, [isCodeLoading]); // The dependency array ensures this effect runs whenever isCodeLoading changes

    useEffect(() => {
        console.log(isSyntaxError);
    }, [isSyntaxError]);

    useEffect(() => {
        generateNaturalProgrammingTemplate(isReqFileExists);
    }, [isReqFileExists]);

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

    async function handleSendQuery(content: [string, AttachmentResult[]]) {
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
            if (error.name === "AbortError") {
                // Don't show an error message or show a user-friendly message
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content += `<error>Generation stopped by the user</error>`;
                    return newMessages;
                });
            } else {
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    if (error && "message" in error) {
                        newMessages[newMessages.length - 1].content += `<error>${error.message}</error>`;
                    } else {
                        newMessages[newMessages.length - 1].content += `<error>${error}</error>`;
                    }
                    return newMessages;
                });
            }
        }
    }

    async function handleSend(content: [string, AttachmentResult[]]) {
        setCurrentGeneratingPromptIndex(otherMessages.length);
        setIsPromptExecutedInCurrentWindow(true);
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

        await handleSendQuery(content);
    }

    function getUserMessage(content: [string, AttachmentResult[]]): string {
        const [message, attachments] = content;

        return attachments.reduce((acc, attachment) => {
            return acc + `<attachment>${attachment.name}</attachment>`;
        }, message);
    }

    async function processContent(token: string, content: [string, AttachmentResult[]]) {
        const [message, attachments] = content;
        const cleanedMessage = message.replace(/<\/?badge>/g, "").trim();
        const commandKey = findCommand(cleanedMessage);
        if (commandKey) {
            const commandLength = commandKey.length;
            const messageBody = cleanedMessage.slice(commandLength).trim();
            const parameters = extractParameters(commandKey, messageBody);

            if (parameters) {
                switch (commandKey) {
                    case COMMAND_NATURAL_PROGRAMMING: {
                        if (isContentIncludedInMessageBody(messageBody, CHECK_DRIFT_BETWEEN_CODE_AND_DOCUMENTATION)) {
                            await processLLMDiagnostics(
                                token,
                                [
                                    parameters.inputRecord.length === 1 && parameters.inputRecord[0] !== undefined
                                        ? parameters.inputRecord[0]
                                        : messageBody,
                                    attachments,
                                    null,
                                ],
                                message
                            );
                            break;
                        } else {
                            const isRequirementsTemplateExists = isContentIncludedInMessageBody(
                                messageBody,
                                GENERATE_CODE_AGAINST_THE_REQUIREMENT
                            );
                            if (isRequirementsTemplateExists && !isReqFileExists) {
                                const handleExtractRequirements = () => {
                                    const prefix = GENERATE_CODE_AGAINST_THE_REQUIREMENT;
                                    if (messageBody.includes(prefix)) {
                                        return removePrefixSymbols(messageBody.split(prefix)[1].trim());
                                    } else {
                                        return "";
                                    }
                                };

                                function removePrefixSymbols(text: string) {
                                    // Check if the text starts with ':' or '<'
                                    if (text.startsWith(":") || text.startsWith("<")) {
                                        // Remove the first character
                                        return text.slice(1);
                                    }
                                    // Return the original text if it doesn't start with ':' or '<'
                                    return text;
                                }
                                const requirements = handleExtractRequirements();
                                await rpcClient.getAiPanelRpcClient().updateRequirementSpecification({
                                    filepath: chatLocation,
                                    content: requirements,
                                });
                                setIsReqFileExists(true);
                            }

                            const isTestGenerationTemplateExists = isContentIncludedInMessageBody(
                                messageBody,
                                GENERATE_TEST_AGAINST_THE_REQUIREMENT
                            );
                            if (isTestGenerationTemplateExists) {
                                rpcClient.getAiPanelRpcClient().createTestDirecoryIfNotExists(chatLocation);
                            }

                            await processCodeGeneration(
                                token,
                                [
                                    parameters.inputRecord.length === 1 && parameters.inputRecord[0] !== undefined
                                        ? parameters.inputRecord[0]
                                        : messageBody,
                                    attachments,
                                    isContentIncludedInMessageBody(messageBody, GENERATE_CODE_AGAINST_THE_REQUIREMENT)
                                        ? CodeGenerationType.CODE_FOR_USER_REQUIREMENT
                                        : isTestGenerationTemplateExists
                                        ? CodeGenerationType.TESTS_FOR_USER_REQUIREMENT
                                        : CodeGenerationType.CODE_GENERATION,
                                ],
                                message
                            );
                            break;
                        }
                    }
                    case COMMAND_GENERATE: {
                        await processCodeGeneration(
                            token,
                            [
                                parameters.inputRecord.length === 1 && parameters.inputRecord[0] !== undefined
                                    ? parameters.inputRecord[0]
                                    : messageBody,
                                attachments,
                                CodeGenerationType.CODE_GENERATION,
                            ],
                            cleanedMessage
                        );
                        break;
                    }
                    case COMMAND_TESTS: {
                        if (messageBody.includes("service")) {
                            await processTestGeneration(content, token, "service", parameters.inputRecord[0]);
                        } else if (messageBody.includes("resource")) {
                            await processTestGeneration(content, token, "function", parameters.inputRecord[0]);
                        }
                        break;
                    }
                    case COMMAND_DATAMAP: {
                        if (parameters.inputRecord.length >= 1 && parameters.outputRecord) {
                            await processMappingParameters(cleanedMessage, token, parameters, attachments);
                        } else if (messageBody.includes("function")) {
                            await processMappingParameters(cleanedMessage, token, {
                                inputRecord: [],
                                outputRecord: "",
                                functionName: parameters.functionName
                            }, attachments);
                        } else {
                            throw new Error(
                                `Invalid template format for the \`${COMMAND_DATAMAP}\` command. ` +
                                    `Please ensure you follow the correct template.`
                            );
                        }
                        break;
                    }
                    case COMMAND_TYPECREATOR: {
                        if (messageBody === TEMPLATE_TYPECREATOR[0]) {
                            if (attachments) {
                                await processContextTypeCreation(cleanedMessage, token, attachments);
                            } else {
                                throw new Error("Error: Missing Attach context");
                            }
                        } else {
                            throw new Error("Error: Invalid parameters for " + COMMAND_TYPECREATOR + " command");
                        }
                        break;
                    }
                    case COMMAND_HEALTHCARE: {
                        await processHealthcareCodeGeneration(token, messageBody, message);
                        break;
                    }
                    case COMMAND_DOCUMENTATION: {
                        await findInDocumentation(token, parameters.inputRecord[0], message);
                        break;
                    }
                    case COMMAND_OPENAPI: {
                        await processOpenAPICodeGeneration(token, messageBody, message);
                        break;
                    }
                }
            } else {
                if (messageBody.trim() === "") {
                    throw new Error("Error: Query is empty. Please enter a valid query");
                }
                if (commandKey === COMMAND_GENERATE) {
                    await processCodeGeneration(
                        token,
                        [messageBody, attachments, CodeGenerationType.CODE_GENERATION],
                        message
                    );
                    return;
                } else if (commandKey === COMMAND_NATURAL_PROGRAMMING) {
                    if (isContentIncludedInMessageBody(messageBody, GENERATE_CODE_AGAINST_THE_REQUIREMENT)) {
                        await processCodeGeneration(
                            token,
                            [messageBody, attachments, CodeGenerationType.CODE_FOR_USER_REQUIREMENT],
                            message
                        );
                        return;
                    }
                } else if (commandKey === COMMAND_DOCUMENTATION) {
                    await findInDocumentation(token, messageBody, message);
                    return;
                } else if (commandKey === COMMAND_HEALTHCARE) {
                    await processHealthcareCodeGeneration(token, messageBody, message);
                    return;
                } else if (commandKey === COMMAND_OPENAPI) {
                    await processOpenAPICodeGeneration(token, messageBody, message);
                    return;
                }
                throw new Error(
                    `Invalid template format for the \`${commandKey}\` command. ` +
                        `Please ensure you follow the correct template.`
                );
            }
        } else {
            await processCodeGeneration(token, [message, attachments, CodeGenerationType.CODE_GENERATION], message);
        }
    }

    function isContentIncludedInMessageBody(messageBody: string, content: string): boolean {
        return messageBody.includes(content);
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
                .replace(/<servicename>/g, "(.+?)")
                .replace(
                    /<recordname\(s\)>/g,
                    "(\\s*(?:[\\w\\/.-]+\\s*:\\s*)?[\\w:\\[\\]]+(?:[\\s,]+(?:[\\w\\/.-]+\\s*:\\s*)?[\\w:\\[\\]]+)*\\s*)"
                )
                .replace(/<recordname>/g, "(\\s*(?:[\\w\\/|.-]+\\s*:\\s*)?[\\w|:\\[\\]]+\\s*)")
                .replace(/<requirements>/g, "([\\s\\S]+?)")
                .replace(/<functionname>/g, "(.+?)")
                .replace(/<question>/g, "(.+?)")
                .replace(/<method\(space\)path>/g, "([^\\n]+)");

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
                        inputRecordList = [inputRecordNamesRaw.trim()];
                    }

                    const outputRecordName = match[2].trim();
                    let functionName = match[3]?.trim() || "";
                    return {
                        inputRecord: inputRecordList,
                        outputRecord: outputRecordName,
                        functionName,
                    };
                } else if (command === COMMAND_DATAMAP && template.includes("<functionname>")) {
                    let functionName = match[1].trim();
                    return {
                        inputRecord: [],
                        outputRecord: "",
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

    async function processLLMDiagnostics(
        token: string,
        content: [string, AttachmentResult[], string],
        message: string
    ) {
        const [useCase, attachments, operationType] = content;

        let response: LLMDiagnostics =
            rpcClient == null
                ? { statusCode: 500, diags: DRIFT_CHECK_ERROR }
                : await rpcClient.getAiPanelRpcClient().getDriftDiagnosticContents(chatLocation);

        const responseStatus = response.statusCode;
        const invalidResponse = response == null || response.statusCode == null;

        if (invalidResponse) {
            throw new Error(DRIFT_CHECK_ERROR);
        }

        if (!(responseStatus >= 200 && responseStatus < 300)) {
            if (responseStatus > 400 && responseStatus < 500) {
                await rpcClient.getAiPanelRpcClient().promptLogin();
                setIsLoading(false);
                return;
            }

            throw new Error(DRIFT_CHECK_ERROR);
        }

        if (response.diags == null || response.diags == "") {
            response.diags = NO_DRIFT_FOUND;
        }

        setIsLoading(false);

        const userMessage = getUserMessage([message, attachments]);
        setMessages((prevMessages) => {
            const newMessage = [...prevMessages];
            newMessage[newMessage.length - 1].content = response.diags;
            return newMessage;
        });
        addChatEntry("user", userMessage);
        addChatEntry("assistant", response.diags);
        setIsSyntaxError(false);
    }

    async function loadMentions(command: string, template: string): Promise<string[]> {
        switch (command) {
            case COMMAND_GENERATE: {
                return [];
            }
            case COMMAND_TESTS: {
                if (template.includes("service")) {
                    return (await rpcClient.getAiPanelRpcClient().getServiceNames()).mentions;
                } else if (template.includes("resource")) {
                    return (await rpcClient.getAiPanelRpcClient().getResourceMethodAndPaths()).mentions;
                }
                return [];
            }
            case COMMAND_DATAMAP: {
                if (template.includes("<recordname(s)>") && template.includes("<recordname>")) {
                    return (await rpcClient.getBIDiagramRpcClient().getRecordNames()).mentions;
                } else {
                    return (await rpcClient.getBIDiagramRpcClient().getFunctionNames()).mentions;
                }
            }
            case COMMAND_TYPECREATOR: {
                return [];
            }
            case COMMAND_DOCUMENTATION: {
                return [];
            }
        }
    }

    async function processCodeGeneration(
        token: string,
        content: [string, AttachmentResult[], string],
        message: string
    ) {
        const [useCase, attachments, operationType] = content;

        let assistant_response = "";
        let project: ProjectSource;
        try {
            project = await rpcClient.getAiPanelRpcClient().getProjectSource(operationType);
        } catch (error) {
            throw new Error("This workspace doesn't appear to be a Ballerina project. Please open a folder that contains a Ballerina.toml file to continue.");
        }
        const requestBody: any = {
            usecase: useCase,
            chatHistory: chatArray,
            sourceFiles: project.sourceFiles,
            operationType,
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
                    error += RATE_LIMIT_ERROR;
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
                // Update the functions state instead of the global variable
                setFunctions(event.body);
            } else if (event.event == "message_stop") {
                let diagnostics: DiagnosticEntry[] = [];
                try {
                    const postProcessResp: PostProcessResponse = await rpcClient.getAiPanelRpcClient().postProcess({
                        assistant_response: assistant_response,
                    });
                    assistant_response = postProcessResp.assistant_response;
                    diagnostics = postProcessResp.diagnostics.diagnostics;
                    console.log("Initial Diagnostics : ", diagnostics);
                    setCurrentDiagnostics(diagnostics);
                } catch (error) {
                    // Add this catch block because `Add to Integration` button not appear for `/generate`
                    // Related issue: https://github.com/wso2-enterprise/vscode-extensions/issues/5065
                    diagnostics = [];
                }
                if (diagnostics.length > 0) {
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
                                operationType,
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
                        let fixedResponse = replaceCodeBlocks(assistant_response, repairResponse);
                        const postProcessResp: PostProcessResponse = await rpcClient.getAiPanelRpcClient().postProcess({
                            assistant_response: fixedResponse,
                        });
                        fixedResponse = postProcessResp.assistant_response;
                        const endTime = performance.now();
                        const executionTime = endTime - startTime;
                        console.log(`Repair call time: ${executionTime} milliseconds`);
                        console.log("After auto repair, Diagnostics : ", postProcessResp.diagnostics.diagnostics);
                        setCurrentDiagnostics(postProcessResp.diagnostics.diagnostics);
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
                        "\nUnknown error occurred while receiving the response.";
                    newMessages[newMessages.length - 1].type = "Error";
                    return newMessages;
                });
                assistant_response = "\nUnknown error occurred while receiving the response.";
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

    // Helper function to escape regex special characters in a string
    function escapeRegexString(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Function to create regex for finding a function without error type
    function createFunctionWithoutErrorTypeRegex(functionName: string, returnType: string): RegExp {
        const escapedReturnType = escapeRegexString(returnType);
        return new RegExp(
            `function\\s+${functionName}\\s*\\([^)]+\\)\\s*returns\\s+${escapedReturnType}(?!\\|error)\\s*(?:=>|\\{)`,
            's'
        );
    }

    // Function to create regex for adding error type to a function signature
    function createAddErrorTypeRegex(functionName: string, returnType: string): RegExp {
        const escapedReturnType = escapeRegexString(returnType);
        return new RegExp(
            `(function\\s+${functionName}\\s*\\([^)]+\\)\\s*returns\\s+${escapedReturnType})\\s*(=>|\\{)`,
            's'
        );
    }

    // Function to create regex for arrow function signatures
    function createArrowFunctionSignatureRegex(functionName: string, returnType: string): RegExp {
        const escapedReturnType = escapeRegexString(returnType);
        return new RegExp(
            `(function\\s+${functionName}\\s*\\([^)]+\\)\\s*returns\\s+${escapedReturnType}(?:\\|error)?)\\s*=>\\s*\\{[^}]*\\}`,
            's'
        );
    }

    // Function to create regex for regular function signatures
    function createRegularFunctionSignatureRegex(functionName: string, returnType: string): RegExp {
        const escapedReturnType = escapeRegexString(returnType);
        return new RegExp(
            `(function\\s+${functionName}\\s*\\([^)]+\\)\\s*returns\\s+${escapedReturnType}(?:\\|error)?)\\s*\\{[^}]*\\}`,
            's'
        );
    }

    // Fucntion to create regex to match function signatures without capturing the function body.
    function createExistingFunctionSignatureRegex(functionName: string) {
        return new RegExp(
            `function\\s+${functionName}\\s*\\([^)]*\\)\\s*returns\\s+[^=]+\\s*=>\\s*(?:\\{|)`,
            's'
        );
    }

    // Function to remove the body of a specified function while keeping the rest of the code unchanged.
    function removeFunctionBody(content: string, functionName: string) {
        // Regular expression to match the function signature and body
        const functionRegex = new RegExp(
            `(function\\s+${functionName}\\s*\\([^)]*\\)\\s*returns\\s+[^=]+\\s*=>)\\s*(?:\\{[^]*?\\}|[^;]*);`,
            's'
        );

        // Replace the matched function body with an empty function body `{}` while keeping the signature
        return content.replace(functionRegex, `$1 {};`);
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
                const importRegex = /import\s+[^;]+;/g;
                const commentRegex = /^(?:(\/\/.*|#.*)\n)+/; // Matches both `//` and `#` comment blocks at the top
                const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*returns\s+([^={|]+)(?:\|error)?\s*=>\s*(?:\{([\s\S]*?)\}|([\s\S]*?));/;

                let existingFunctionRegex;

                // Check if we're dealing with a function that should be merged
                const functionMatch = segmentText.match(functionRegex);
                let shouldMergeFunction = false;
                let functionName = "";
                let functionBody = "";
                let returnType = "";
                let hasErrorType = false;
                let updatedContent = "";

                if (functionMatch) {
                    functionName = functionMatch[1];
                    const params = functionMatch[2];
                    returnType = functionMatch[3].trim();
                    functionBody = functionMatch[4] ? functionMatch[4].trim() : functionMatch[5]?.trim();

                    // Check if new function has error return type
                    hasErrorType = segmentText.includes(`returns ${returnType}|error`);
                    existingFunctionRegex = createExistingFunctionSignatureRegex(functionName);
                    const existingFunctionMatch = originalContent.match(existingFunctionRegex);

                    if (existingFunctionMatch) {
                        shouldMergeFunction = true;
                    }
                }

                const imports = segmentText.match(importRegex) || [];
                const codeWithoutImports = segmentText.replace(importRegex, "").trim();

                updatedContent = removeFunctionBody(originalContent, functionName);

                // Extract existing comments at the top
                const commentMatch = updatedContent.match(commentRegex);
                const existingComments = commentMatch ? commentMatch[0].trim() + "\n\n" : "";
                updatedContent = updatedContent.replace(commentRegex, "").trim();

                // Find any additional `#` comments that may exist before imports
                const additionalCommentMatch = updatedContent.match(commentRegex);
                const additionalComments = additionalCommentMatch ? additionalCommentMatch[0].trim() + "\n\n" : "";
                updatedContent = updatedContent.replace(commentRegex, "").trim();

                // Ensure new imports are added after all comments
                let updatedImports = "";
                imports.forEach((imp: string) => {
                    if (!updatedContent.includes(imp)) {
                        updatedImports += `${imp}\n`;
                    }
                });

                if (shouldMergeFunction) {
                    const existingFunctionWithoutErrorRegex = createFunctionWithoutErrorTypeRegex(
                        functionName,
                        returnType
                    );
                    const missingErrorType = existingFunctionWithoutErrorRegex.test(updatedContent) && hasErrorType;

                    if (missingErrorType) {
                        const addErrorTypeRegex = createAddErrorTypeRegex(functionName, returnType);
                        updatedContent = updatedContent.replace(addErrorTypeRegex, `$1|error $2`);
                    }

                    const arrowFunctionSignatureRegex = createArrowFunctionSignatureRegex(functionName, returnType);
                    const regularFunctionSignatureRegex = createRegularFunctionSignatureRegex(functionName, returnType);
                    const isExpressionBody = /^\s*from\b/.test(functionBody);

                    if (arrowFunctionSignatureRegex.test(updatedContent)) {
                        updatedContent = updatedContent.replace(arrowFunctionSignatureRegex, (match, signature) => {
                            return isExpressionBody
                                ? `${signature} => ${functionBody}`
                                : `${signature} => {\n    ${functionBody}\n}`;
                        });
                    } else if (regularFunctionSignatureRegex.test(updatedContent)) {
                        updatedContent = updatedContent.replace(regularFunctionSignatureRegex, (match, signature) => {
                            return `${signature} {\n    ${functionBody}\n}`;
                        });
                    }

                    updatedContent = `${existingComments}${additionalComments}${updatedImports}${updatedContent}`;
                } else {
                    updatedContent = `${existingComments}${additionalComments}${updatedImports}${updatedContent}\n${codeWithoutImports}`;
                }

                segmentText = updatedContent.trim();
                await rpcClient.getAiPanelRpcClient().refreshFile({ filePath: filePath, content: segmentText });
            } else if (command === "test") {
                segmentText = `${originalContent}\n\n${segmentText}`;
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

        const token = await rpcClient.getAiPanelRpcClient().getAccessToken();
        const developerMdContent = await rpcClient.getAiPanelRpcClient().readDeveloperMdFile(chatLocation);
        const updatedChatHistory = generateChatHistoryForSummarize(chatArray);
        const response = await fetchWithToken(
            backendRootUri + "/prompt/summarize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chats: updatedChatHistory, existingChatSummary: developerMdContent }),
                signal: signal,
            },
            rpcClient
        );

        setIsCodeAdded(true);
        previouslyIntegratedChatIndex = integratedChatIndex;
        integratedChatIndex = chatArray.length;
        localStorage.setItem(
            `chatArray-AIGenerationChat-${projectUuid}-developer-index`,
            JSON.stringify({ integratedChatIndex, previouslyIntegratedChatIndex })
        );
        const chatSummaryResponseStr = await streamToString(response.body);
        await rpcClient
            .getAiPanelRpcClient()
            .addChatSummary({ summary: chatSummaryResponseStr, filepath: chatLocation });
        previousDevelopmentDocumentContent = developerMdContent;
    };

    async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            result += decoder.decode(value, { stream: true });
        }

        return result;
    }

    const handleRevertChanges = async (
        codeSegments: any,
        setIsCodeAdded: React.Dispatch<React.SetStateAction<boolean>>,
        command: string
    ) => {
        console.log("Revert gration called. Command: ", command);

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
                rpcClient.getAiPanelRpcClient().refreshFile({ filePath: filePath, content: revertContent });
                await rpcClient
                    .getAiPanelRpcClient()
                    .addToProject({ filePath: filePath, content: revertContent, isTestCode: isTestCode });
            }
        }
        rpcClient.getAiPanelRpcClient().updateDevelopmentDocument({
            content: previousDevelopmentDocumentContent,
            filepath: chatLocation,
        });
        integratedChatIndex = previouslyIntegratedChatIndex;
        localStorage.setItem(
            `chatArray-AIGenerationChat-${projectUuid}-developer-index`,
            JSON.stringify({ integratedChatIndex, previouslyIntegratedChatIndex })
        );
        tempStorage = {};
        setIsCodeAdded(false);
    };

    async function processTestGeneration(
        content: [string, AttachmentResult[]],
        token: string,
        targetType: string, // service or function
        target: string // <servicename> or <resourcemethod resourcepath>
    ) {
        let assistantResponse = "";
        try {
            const targetSource =
                targetType === "service"
                    ? await rpcClient.getAiPanelRpcClient().getServiceSourceForName(target)
                    : await rpcClient.getAiPanelRpcClient().getResourceSourceForMethodAndPath(target);
            const requestBody = {
                targetType: targetType,
                targetSource: targetSource,
            };

            const response = await fetchWithToken(
                backendRootUri + "/testplan",
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

            if (!response.ok) {
                handleErrorResponse(response);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (targetType === "service") {
                        await processServiceTestGeneration(content, token, target, assistantResponse);
                        setIsLoading(false);
                    } else if (targetType === "function") {
                        assistantResponse += `\n\n<button type="generate_test_group">Generate Tests</button>`;
                        setMessages((prevMessages) => {
                            const newMessages = [...prevMessages];
                            newMessages[newMessages.length - 1].content = assistantResponse;
                            return newMessages;
                        });
                        setTestGenIntermediaryState({
                            content: content,
                            token: token,
                            resourceFunction: target,
                            testPlan: assistantResponse,
                        });
                    } else {
                        setIsLoading(false);
                        throw new Error(`Invalid target type: ${targetType}`);
                    }
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                buffer = await processBuffer(buffer);
            }
        } catch (error: any) {
            setIsLoading(false);
            const errorName = error instanceof Error ? error.name : "Unknown error";
            const errorMessage = "message" in error ? error.message : "Unknown error";

            if (errorName === "AbortError") {
                throw new Error("Failed: The user cancelled the request.");
            } else {
                throw new Error(errorMessage);
            }
        }

        async function processBuffer(buffer: string) {
            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
                const chunk = buffer.slice(0, boundary + 2);
                buffer = buffer.slice(boundary + 2);
                await processSSEEvent(chunk);
                boundary = buffer.indexOf("\n\n");
            }
            return buffer;
        }

        async function processSSEEvent(chunk: string) {
            try {
                const event = parseCopilotSSEEvent(chunk);
                if (event.event === CopilotEvent.CONTENT_BLOCK) {
                    const text = (event.body as CopilotContentBlockContent).text;
                    assistantResponse += text;
                    handleContentBlockDelta(text);
                } else if (event.event === "error") {
                    throw new Error(`Streaming Error: ${(event.body as CopilotErrorContent).message}`);
                }
            } catch (error) {
                setIsLoading(false);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to parse SSE event: ${errorMessage}`);
            }
        }

        function handleContentBlockDelta(text: string) {
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content += text;
                return newMessages;
            });
        }

        async function handleErrorResponse(response: Response) {
            if (response.status >= 400 && response.status < 500) {
                await rpcClient.getAiPanelRpcClient().promptLogin();
                setIsLoading(false);
                return;
            }

            if (response.status === 429) {
                const body = await response.json();
                throw new Error(`Too many requests: ${RATE_LIMIT_ERROR}`);
            }

            throw new Error(`Failed to fetch response. HTTP Status: ${response.status}`);
        }
    }

    async function processServiceTestGeneration(
        content: [string, AttachmentResult[]],
        token: string,
        serviceName: string,
        testPlan: string
    ) {
        let assistantResponse = `${testPlan}`;

        const updateAssistantMessage = (message: string) => {
            assistantResponse += message;
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = assistantResponse;
                return newMessages;
            });
        };

        updateAssistantMessage(
            `\n\n**Initiating test generation for the ${serviceName} service, following the _outlined test plan_. Please wait...**`
        );

        updateAssistantMessage(
            `\n\n<progress>Generating tests for the ${serviceName} service. This may take a moment.</progress>`
        );

        try {
            const response = await rpcClient.getAiPanelRpcClient().getGeneratedTests({
                backendUri: backendRootUri,
                targetType: TestGenerationTarget.Service,
                targetIdentifier: serviceName,
                testPlan,
            });
            updateAssistantMessage(`\n<progress>Analyzing generated tests for potential issues.</progress>`);

            const diagnostics = await rpcClient.getAiPanelRpcClient().getTestDiagnostics(response);
            let testCode = response.testSource;
            const testConfig = response.testConfig;

            if (diagnostics.diagnostics.length > 0) {
                updateAssistantMessage(
                    `\n<progress>Refining tests based on feedback to ensure accuracy and reliability.</progress>`
                );
                const fixedCode = await rpcClient.getAiPanelRpcClient().getGeneratedTests({
                    backendUri: backendRootUri,
                    targetType: TestGenerationTarget.Service,
                    targetIdentifier: serviceName,
                    testPlan: testPlan,
                    diagnostics: diagnostics,
                    existingTests: response.testSource,
                });
                testCode = fixedCode.testSource;
            }

            updateAssistantMessage(
                `\n\nTest generation completed. Displaying the generated tests for the ${serviceName} service below:`
            );

            setIsLoading(false);
            setIsCodeLoading(false);

            updateAssistantMessage(
                `\n\n<code filename="tests/test.bal" type="test">\n\`\`\`ballerina\n${testCode}\n\`\`\`\n</code>`
            );
            if (testConfig) {
                updateAssistantMessage(
                    `\n\n<code filename="tests/Config.toml" type="test">\n\`\`\`ballerina\n${testConfig}\n\`\`\`\n</code>`
                );
            }

            const userMessage = getUserMessage(content);
            addChatEntry("user", userMessage);
            addChatEntry("assistant", assistantResponse);
        } catch (error) {
            throw error;
        }
    }

    async function processFunctionTestGeneration(
        content: [string, AttachmentResult[]],
        token: string,
        functionIdentifier: string,
        testPlan: string
    ) {
        const testPath = "tests/test.bal";
        setIsCodeLoading(true);
        let assistantResponse = `${testPlan}`;

        const updateAssistantMessage = (message: string) => {
            assistantResponse += message;
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = assistantResponse;
                return newMessages;
            });
        };

        updateAssistantMessage(
            `\n\n**Initiating test generation for the function ${functionIdentifier}, following the _outlined test plan_. Please wait...**`
        );

        updateAssistantMessage(
            `\n\n<progress>Generating tests for the function ${functionIdentifier}. This may take a moment.</progress>`
        );

        try {
            const response = await rpcClient.getAiPanelRpcClient().getGeneratedTests({
                backendUri: backendRootUri,
                targetType: TestGenerationTarget.Function,
                targetIdentifier: functionIdentifier,
                testPlan,
            });
            updateAssistantMessage(`\n<progress>Analyzing generated tests for potential issues.</progress>`);

            let existingSource = "";
            try {
                existingSource = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: testPath });
            } catch {
                // File doesn't exist
            }
            const generatedFullSource = existingSource
                ? existingSource +
                  "\n\n// >>>>>>>>>>>>>>TEST CASES NEED TO BE FIXED <<<<<<<<<<<<<<<\n\n" +
                  response.testSource
                : response.testSource;

            const diagnostics = await rpcClient.getAiPanelRpcClient().getTestDiagnostics({
                testSource: generatedFullSource,
            });

            console.log(diagnostics);

            let testCode = response.testSource;
            const testConfig = response.testConfig;

            if (diagnostics.diagnostics.length > 0) {
                updateAssistantMessage(
                    `\n<progress>Refining tests based on feedback to ensure accuracy and reliability.</progress>`
                );
                const fixedCode = await rpcClient.getAiPanelRpcClient().getGeneratedTests({
                    backendUri: backendRootUri,
                    targetType: TestGenerationTarget.Function,
                    targetIdentifier: functionIdentifier,
                    testPlan: testPlan,
                    diagnostics: diagnostics,
                    existingTests: generatedFullSource,
                });
                testCode = fixedCode.testSource;
            }

            updateAssistantMessage(
                `\n\nTest generation completed. Displaying the generated tests for the function ${functionIdentifier} below:`
            );

            setIsLoading(false);
            setIsCodeLoading(false);

            updateAssistantMessage(
                `\n\n<code filename="${testPath}" type="test">\n\`\`\`ballerina\n${testCode}\n\`\`\`\n</code>`
            );
            if (testConfig) {
                updateAssistantMessage(
                    `\n\n<code filename="tests/Config.toml" type="test">\n\`\`\`ballerina\n${testConfig}\n\`\`\`\n</code>`
                );
            }

            const userMessage = getUserMessage(content);
            addChatEntry("user", userMessage);
            addChatEntry("assistant", assistantResponse);
        } catch (error) {
            throw error;
        }
    }

    // Process records from another package
    function processRecordReference(
        recordName: string,
        recordMap: Map<string, any>,
        allImports: Array<{ moduleName: string; alias?: string }>,
        importsMap: Map<string, { moduleName: string; alias?: string; recordName: string }>
    ): DataMappingRecord | Error {
        const isArray = recordName.endsWith("[]");
        const cleanedRecordName = recordName.replace(/\[\]$/, "");
        const rec = recordMap.get(cleanedRecordName);

        if (!rec) {
            if (cleanedRecordName.includes(":")) {
                if (!cleanedRecordName.includes("/")) {
                    const [moduleName, recordName] = cleanedRecordName.split(":");
                    const matchedImport = allImports.find((imp) => {
                        if (imp.alias) {
                            return cleanedRecordName.startsWith(imp.alias);
                        }
                        const moduleNameParts = imp.moduleName.split(".");
                        const inferredAlias = moduleNameParts[moduleNameParts.length - 1];
                        return cleanedRecordName.startsWith(inferredAlias);
                    });

                    if (!matchedImport) {
                        return INVALID_RECORD_REFERENCE;
                    }
                    importsMap.set(cleanedRecordName, {
                        moduleName: matchedImport.moduleName,
                        alias: matchedImport.alias,
                        recordName: recordName,
                    });
                } else {
                    const [moduleName, recordName] = cleanedRecordName.split(":");
                    importsMap.set(cleanedRecordName, {
                        moduleName: moduleName,
                        recordName: recordName,
                    });
                }
                return { type: `${cleanedRecordName}`, isArray, filePath: null };
            } else {
                throw new Error(`${cleanedRecordName} is not defined.`);
            }
        }
        return { ...rec, isArray };
    }

    // Processes existing functions to find a matching function by name
    async function processExistingFunctions(
        existingFunctions: ExistingFunction[],
        functionName: string
    ): Promise<{
        match: RegExpMatchArray | null;
        functionNameMatch: boolean;
        matchingFunctionFile: string | null;
    }> {
        for (const func of existingFunctions) {
            const functionContent = await rpcClient.getAiPanelRpcClient().getFromFile({
                filePath: func.filePath.split("/").pop(),
            });

            const fileName = func.filePath.split("/").pop();
            const signatureRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*returns\s+([^{=]+)(?:\s*=>\s*)?/g;

            // Use matchAll to find all function signatures in the content
            const matches = [...functionContent.matchAll(signatureRegex)];

            // Check if any of the function signatures match the target function name
            for (const match of matches) {
                const funcName = match[1];
                if (funcName === functionName) {
                    return {
                        match,
                        functionNameMatch: true,
                        matchingFunctionFile: fileName,
                    };
                }
            }
        }

        // If no match is found
        return {
            match: null,
            functionNameMatch: false,
            matchingFunctionFile: null,
        };
    }

    // Process input parameters
    function processInputs(inputParams: string[], recordMap: Map<any, any>, allImports: ImportStatement[], importsMap: Map<any, any>) {
        let results = inputParams.map((param: string) => processRecordReference(param, recordMap, allImports, importsMap));
        return results.filter((result): result is DataMappingRecord => {
            if (result instanceof Error) {
                throw INVALID_RECORD_REFERENCE;
            }
            return true;
        });
    }

    // Process Output parameters
    function processOutput(outputParam: string, recordMap: Map<any, any>, allImports: { moduleName: string; alias?: string; }[], importsMap: Map<any, any>) {
        const parts = outputParam.split("|");
        const validParts = parts.filter((name: string) => name !== "error");
        if (validParts.length > 1) {
            throw new Error(`Invalid output parameter: "${outputParam}". Union types are not supported. Please provide a single valid record name.`);
        }
        const cleanedOutputRecordName = validParts.length > 0 ? validParts[0] : "error";
        const outputResult = processRecordReference(cleanedOutputRecordName, recordMap, allImports, importsMap);
        if (outputResult instanceof Error) {
            throw INVALID_RECORD_REFERENCE;
        }
        return outputResult;
    }

    async function processMappingParameters(
        message: string,
        token: string,
        parameters: MappingParameters,
        attachments?: AttachmentResult[]
    ) {
        let assistant_response = "";
        let newImports;
        const recordMap = new Map();
        const importsMap = new Map();
        let inputs: DataMappingRecord[];
        let output;
        let inputParams;
        let outputParam;
        let inputNames: string[] = [];
        let result;
        setIsLoading(true);

        const functionName = parameters.functionName;

        const invalidPattern = /[<>\/\(\)\{\}\[\]\\!@#$%^&*_+=|;:'",.?`~]/;

        if (invalidPattern.test(functionName)) {
            throw new Error("Please provide a valid function name without special characters.");
        }

        const projectImports = await rpcClient.getBIDiagramRpcClient().getAllImports();
        const activeFile = await rpcClient.getAiPanelRpcClient().getActiveFile();
        const projectComponents = await rpcClient.getBIDiagramRpcClient().getProjectComponents();

        const allImports: ImportStatement[] = [];
        projectImports.imports.forEach((file) => {
            if (file.statements && file.statements.length > 0) {
                file.statements.forEach((statement) => {
                    allImports.push(statement);
                });
            }
        });

        const existingFunctions: { name: string; filePath: string; startLine: number; endLine: number; }[] = [];

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

                // Collect functions
                mod.functions?.forEach((func) => {
                    existingFunctions.push({
                        name: func.name,
                        filePath: filepath + func.filePath,
                        startLine: func.startLine,
                        endLine: func.endLine
                    });
                });
            });
        });

        if (parameters.inputRecord.length > 0 || parameters.outputRecord !== "") {
            result = await processExistingFunctions(existingFunctions, functionName);
            if (result.functionNameMatch) {
                throw new Error(`A function named "${functionName}" exists in '${result.matchingFunctionFile}'. Please provide a valid function name.`);
            }
            inputParams = parameters.inputRecord;
            outputParam = parameters.outputRecord;
        } else {
            if (existingFunctions.length === 0) {
                throw new Error(`A function named "${functionName}" was not found in the project. Please provide a valid function name.`);
            }
            result = await processExistingFunctions(existingFunctions, functionName);
            if (!result.functionNameMatch) {
                throw new Error(`A function named "${functionName}" was not found in the project. Please provide a valid function name.`);
            }
            const params = result.match[2].split(/,\s*/).map(param => param.trim().split(/\s+/));
            inputParams = params.map(parts => parts[0]);
            inputNames = params.map(parts => parts[1]);
            outputParam = result.match[3].trim();
        }

        inputs = processInputs(inputParams, recordMap, allImports, importsMap);
        output = processOutput(outputParam, recordMap, allImports, importsMap);

        const requestPayload: any = {
            backendUri: "",
            token: "",
            inputRecordTypes: inputs,
            outputRecordType: output,
            functionName,
            imports: Array.from(importsMap.values()),
            inputNames: inputNames,
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

        if (result.functionNameMatch) {
            assistant_response += `\n**Note**: When you click **Add to Integration**, it will override your existing mappings.\n`;
        }

        let filePath;
        if (result.functionNameMatch) {
            filePath = result.matchingFunctionFile;
        } else if (activeFile && activeFile.endsWith(".bal")) {
            filePath = activeFile;
        } else {
            filePath = "data_mappings.bal";
        }
        let finalContent = response.mappingCode;
        const needsImports = Array.from(importsMap.values()).length > 0;

        if (needsImports) {
            let fileContent = await rpcClient.getAiPanelRpcClient().getFromFile({ filePath: filePath });
            const existingImports = new Set(
                fileContent.match(/import\s+([a-zA-Z0-9._]+)/g)?.map((imp) => imp.split(" ")[1]) || []
            );

            newImports = Array.from(importsMap.values())
                .filter((imp) => !existingImports.has(imp.moduleName))
                .map((imp) => {
                    const moduleName = imp.moduleName.trim();
                    return imp.alias ? `import ${moduleName} as ${imp.alias};` : `import ${moduleName};`;
                })
                .join("\n");

            finalContent = `${newImports}\n${response.mappingCode}`;
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
        assistant_response += `<code filename="${filePath}" type="ai_map">\n\`\`\`ballerina\n${response.typesCode}\n\`\`\`\n</code>`;

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = assistant_response;
            return newMessages;
        });
        setIsLoading(false);
        addChatEntry("user", message);
        addChatEntry("assistant", assistant_response);
    }

    async function findInDocumentation(token: string, messageBody: string, message: string) {
        let assistant_response = "";
        let formatted_response = ";";
        setIsLoading(true);
        try {
            assistant_response = await rpcClient.getAiPanelRpcClient().getFromDocumentation(messageBody);

            formatted_response = assistant_response.replace(
                /```ballerina\s*([\s\S]+?)\s*```/g,
                "<inlineCode>$1<inlineCode>"
            );

            const referenceRegex = /reference sources:\s*((?:<https?:\/\/[^\s>]+>\s*)+)/;
            const match = formatted_response.match(referenceRegex);

            if (match) {
                const references = match[1].trim().split(/\s+/);
                const referencesTag = `<references>${JSON.stringify(references)}<references>`;
                formatted_response = formatted_response.replace(referenceRegex, referencesTag);
            }

            console.log("Formatted Response: " + formatted_response);

            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = formatted_response;
                return newMessages;
            });
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[
                    newMessages.length - 1
                ].content += `An unknown error occurred while fetching data from the documentation`;
                newMessages[newMessages.length - 1].type = "Error";
                return newMessages;
            });
            return;
        }
        addChatEntry("user", message);
        addChatEntry("assistant", formatted_response);
    }

    async function processHealthcareCodeGeneration(token: string, useCase: string, message: string) {
        let assistant_response = "";
        let project: ProjectSource;
        try {
            project = await rpcClient.getAiPanelRpcClient().getProjectSource(CodeGenerationType.CODE_GENERATION);
        } catch (error) {
            throw new Error("This workspace doesn't appear to be a Ballerina project. Please open a folder that contains a Ballerina.toml file to continue.");
        }
        const requestBody: any = {
            usecase: useCase,
            chatHistory: chatArray,
            sourceFiles: project.sourceFiles,
        };

        const response = await fetchWithToken(
            backendRootUri + "/healthcare",
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
                    error += RATE_LIMIT_ERROR;
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
            } else if (event.event == "message_stop") {
                setIsCodeLoading(false);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content = assistant_response;
                    return newMessages;
                });
            } else if (event.event == "error") {
                console.log("Streaming Error: ", event);
                setIsLoading(false);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content +=
                        "\nUnknown error occurred while receiving the response.";
                    newMessages[newMessages.length - 1].type = "Error";
                    return newMessages;
                });
                assistant_response = "\nUnknown error occurred while receiving the response.";
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

        addChatEntry("user", message);
        addChatEntry("assistant", assistant_response);
    }

    async function processOpenAPICodeGeneration(token: string, useCase: string, message: string) {
        let assistant_response = "";
        const requestBody: any = {
            query: useCase,
            chatHistory: chatArray,
        };

        const response = await fetchWithToken(
            backendRootUri + "/openapi",
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
                    error += RATE_LIMIT_ERROR;
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
            } else if (event.event == "message_stop") {
                setIsCodeLoading(false);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content = assistant_response;
                    return newMessages;
                });
            } else if (event.event == "error") {
                console.log("Streaming Error: ", event);
                setIsLoading(false);
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].content +=
                        "\nUnknown error occurred while receiving the response.";
                    newMessages[newMessages.length - 1].type = "Error";
                    return newMessages;
                });
                assistant_response = "\nUnknown error occurred while receiving the response.";
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

        addChatEntry("user", message);
        addChatEntry("assistant", assistant_response);
    }

    async function handleStop() {
        // Abort the fetch
        controller.abort();
        // Abort test generation if running
        rpcClient.getAiPanelRpcClient().abortTestGeneration();

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
        integratedChatIndex = 0;
        previouslyIntegratedChatIndex = 0;
        localStorage.setItem(
            `chatArray-AIGenerationChat-${projectUuid}-developer-index`,
            JSON.stringify({ integratedChatIndex, previouslyIntegratedChatIndex })
        );

        setMessages((prevMessages) => []);

        //generateSuggestions();

        //clear the local storage
        setUserInput("");
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

    function onTestScenarioDelete(content: string) {
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastMessageContent = newMessages[newMessages.length - 1].content;

            const escapedContent = content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`<scenario>\\s*${escapedContent}\\s*<\\/scenario>`, "g");

            const newContent = lastMessageContent.replace(regex, "");
            newMessages[newMessages.length - 1].content = newContent;

            // Update intermediary state
            setTestGenIntermediaryState((prevState) => ({
                ...prevState,
                testPlan: newContent,
            }));

            // Update the memory as well
            updateChatEntry(chatArray.length - 1, {
                actor: "assistant",
                message: newMessages[newMessages.length - 1].content,
            });

            return newMessages;
        });
    }

    function onTestScenarioAdd() {
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastMessageContent = newMessages[newMessages.length - 1].content;

            const regex = /<button type="add_scenario">(.*?)<\/button>/;
            const match = lastMessageContent.match(regex);

            if (match) {
                const buttonText = match[1];

                const scenarioText = `
<scenario>
    <title>(Edit This) Scenario Title</title>
    <description>(Edit This) Scenario Description</description>
</scenario>

<button type="add_scenario">${buttonText}</button>
`;

                const newContent = lastMessageContent.replace(regex, scenarioText);
                newMessages[newMessages.length - 1].content = newContent;

                // Update intermediary state
                setTestGenIntermediaryState((prevState) => ({
                    ...prevState,
                    testPlan: newContent,
                }));

                updateChatEntry(chatArray.length - 1, {
                    actor: "assistant",
                    message: newContent,
                });
            }

            updateChatEntry(chatArray.length - 1, {
                actor: "assistant",
                message: newMessages[newMessages.length - 1].content,
            });

            return newMessages;
        });
    }

    const handleEdit = (oldContent: string, newContent: string) => {
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const lastMessageContent = newMessages[newMessages.length - 1].content;

            const escapedContent = oldContent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`<scenario>\\s*${escapedContent}\\s*<\\/scenario>`, "g");

            const scenarioText = `
<scenario>
    ${newContent}
</scenario>
`;
            const updatedContent = lastMessageContent.replace(regex, scenarioText);
            newMessages[newMessages.length - 1].content = updatedContent;

            // Update intermediary state
            setTestGenIntermediaryState((prevState) => ({
                ...prevState,
                testPlan: updatedContent,
            }));

            // Update the memory as well
            updateChatEntry(chatArray.length - 1, {
                actor: "assistant",
                message: newMessages[newMessages.length - 1].content,
            });

            return newMessages;
        });
    };

    const regenerateScenarios = async () => {
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = "";
            return newMessages;
        });

        await handleSendQuery(testGenIntermediaryState.content);
    };

    const generateFunctionTests = async () => {
        await processFunctionTestGeneration(
            testGenIntermediaryState.content,
            testGenIntermediaryState.token,
            testGenIntermediaryState.resourceFunction,
            testGenIntermediaryState.testPlan
        );
    };

    const handleRetryRepair = async () => {
        if (currentDiagnostics.length === 0) return;

        setIsCodeLoading(true);
        setIsLoading(true);

        try {
            const token = await rpcClient.getAiPanelRpcClient().getAccessToken();
            const project: ProjectSource = await rpcClient
                .getAiPanelRpcClient()
                .getProjectSource(CodeGenerationType.CODE_GENERATION);

            const usecase = messages[messages.length - 2].content;
            const latestMessage = messages[messages.length - 1].content;

            const diagReq = {
                response: latestMessage,
                diagnostics: currentDiagnostics,
            };

            const reqBody = {
                usecase: usecase,
                chatHistory: chatArray,
                sourceFiles: project.sourceFiles,
                diagnosticRequest: diagReq,
                functions: functions,
                operationType: CodeGenerationType.CODE_GENERATION,
            };
            console.log("Request body for repair:", reqBody);
            const response = await fetchWithToken(
                backendRootUri + "/code/repair",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(reqBody),
                    signal: signal,
                },
                rpcClient
            );

            if (!response.ok) {
                throw new Error("Repair failed");
            }

            const jsonBody = await response.json();
            const repairResponse = jsonBody.repairResponse;
            let fixedResponse = replaceCodeBlocks(latestMessage, repairResponse);

            const postProcessResp: PostProcessResponse = await rpcClient.getAiPanelRpcClient().postProcess({
                assistant_response: fixedResponse,
            });

            fixedResponse = postProcessResp.assistant_response;
            setCurrentDiagnostics(postProcessResp.diagnostics.diagnostics);
            const diagnosedSourceFiles: ProjectSource = getProjectFromResponse(fixedResponse);
            setIsSyntaxError(await rpcClient.getAiPanelRpcClient().checkSyntaxError(diagnosedSourceFiles));
            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = fixedResponse;
                return newMessages;
            });

            // Update chat entry
            const lastIndex = chatArray.length - 1;
            if (lastIndex >= 0 && chatArray[lastIndex].actor === "assistant") {
                updateChatEntry(lastIndex, {
                    actor: "assistant",
                    message: fixedResponse,
                });
            }
        } catch (error) {
            console.error("Repair retry failed:", error);
        } finally {
            setIsCodeLoading(false);
            setIsLoading(false);
        }
    };

    return (
        <AIChatView>
            <Header>
                <Badge>
                    Remaining Free Usage: {"Unlimited"}
                    <br />
                    {/* <ResetsInBadge>{`Resets in: 30 days`}</ResetsInBadge> */}
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "100px",
                            }}
                        >
                            <Icon
                                name="bi-ai-chat"
                                sx={{ width: 60, height: 50 }}
                                iconSx={{ fontSize: "60px", color: "var(--vscode-foreground)", cursor: "default" }}
                            />

                            <div style={{ display: "inline-flex" }}>
                                <h2>WSO2 Copilot</h2>
                                <PreviewContainerDefault>Preview</PreviewContainerDefault>
                            </div>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginBottom: "24px",
                                    color: "var(--vscode-descriptionForeground)",
                                    textAlign: "center",
                                    maxWidth: 350,
                                    fontSize: 14,
                                }}
                            >
                                WSO2 Copilot is powered by AI. It can make mistakes. Make sure to review the generated
                                code before adding it to your integration.
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginBottom: "14px",
                                    color: "var(--vscode-descriptionForeground)",
                                    textAlign: "center",
                                    maxWidth: 350,
                                    fontSize: 14,
                                }}
                            >
                                Type / to use commands
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginBottom: "24px",
                                    color: "var(--vscode-descriptionForeground)",
                                    textAlign: "center",
                                    maxWidth: 350,
                                    fontSize: 14,
                                    gap: 10,
                                    display: "inline-flex",
                                }}
                            >
                                <Icon isCodicon={true} name="new-file" iconSx={{ cursor: "default" }} /> to attatch
                                context
                            </Typography>
                        </div>
                    </Welcome>
                )}
                {otherMessages.map((message, index) => {
                    const showGeneratingFiles = !codeSegmentRendered && index === currentGeneratingPromptIndex;
                    const isLastResponse = index === currentGeneratingPromptIndex;
                    codeSegmentRendered = false;

                    const segmentedContent = splitContent(message.content);
                    const areTestsGenerated = segmentedContent.some((segment) => segment.type === SegmentType.Progress);
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
                            {segmentedContent.map((segment, i) => {
                                if (segment.type === SegmentType.Code) {
                                    const nextSegment = segmentedContent[i + 1];
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
                                                    language: prevSegment.language,
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
                                                diagnostics={currentDiagnostics}
                                                onRetryRepair={handleRetryRepair}
                                                isPromptExecutedInCurrentWindow={isPromptExecutedInCurrentWindow}
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
                                } else if (segment.type === SegmentType.InlineCode) {
                                    // return <BallerinaCodeBlock key={i} code={segment.text} />;
                                    return (
                                        <CodeSegment
                                            source={segment.text}
                                            fileName={"Ballerina"}
                                            language={"ballerina"}
                                            collapsible={false}
                                            showCopyButton={true}
                                        />
                                    );
                                } else if (segment.type === SegmentType.References) {
                                    return <ReferenceDropdown key={i} links={JSON.parse(segment.text)} />;
                                } else if (segment.type === SegmentType.TestScenario) {
                                    return (
                                        <AccordionItem
                                            content={segment.text}
                                            onDelete={onTestScenarioDelete}
                                            isEnabled={
                                                isLastResponse && !isCodeLoading && !areTestsGenerated && isLoading
                                            }
                                            onEdit={handleEdit}
                                        />
                                    );
                                } else if (segment.type === SegmentType.Button) {
                                    if (
                                        "buttonType" in segment &&
                                        segment.buttonType === "add_scenario" &&
                                        !isCodeLoading &&
                                        isLastResponse &&
                                        !areTestsGenerated &&
                                        isLoading
                                    ) {
                                        return (
                                            <VSCodeButton
                                                title="Add a new test scenario"
                                                appearance="secondary"
                                                onClick={onTestScenarioAdd}
                                            >
                                                <span className={`codicon codicon-add`}></span>
                                            </VSCodeButton>
                                        );
                                    } else if (
                                        "buttonType" in segment &&
                                        segment.buttonType === "generate_test_group" &&
                                        !isCodeLoading &&
                                        isLastResponse &&
                                        !areTestsGenerated &&
                                        isLoading
                                    ) {
                                        return (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <VSCodeButton title="Generate Tests" onClick={generateFunctionTests}>
                                                    {"Generate Tests"}
                                                </VSCodeButton>
                                                <VSCodeButton
                                                    title="Regenerate test scenarios"
                                                    appearance="secondary"
                                                    onClick={regenerateScenarios}
                                                >
                                                    <Codicon name="refresh" />
                                                </VSCodeButton>
                                            </div>
                                        );
                                    }
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
                {Array.isArray(otherMessages) && otherMessages.length === 0 && (
                    <FlexRow>
                        <div
                            style={{
                                marginTop: "16px",
                                marginBottom: "6px",
                                marginLeft: "2px",
                                color: "var(--vscode-descriptionForeground)",
                            }}
                        >
                            {DEFAULT_MENU_COMMANDS.map(({ command }, index) => (
                                <div key={index} style={{ marginBottom: "2px" }}>
                                    <a
                                        href="#"
                                        style={{ textDecoration: "none", cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUserInput(command);
                                        }}
                                    >
                                        {command}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </FlexRow>
                )}
                <FlexRow>
                    <AIChatInput
                        value={userInput}
                        baseCommands={commandToTemplate}
                        onSend={handleSend}
                        onStop={handleStop}
                        isLoading={isLoading}
                        loadMentions={loadMentions}
                    />
                </FlexRow>
            </Footer>
        </AIChatView>
    );
}

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

export enum SegmentType {
    Code = "Code",
    Text = "Text",
    Progress = "Progress",
    Attachment = "Attachment",
    Error = "Error",
    InlineCode = "InlineCode",
    References = "References",
    TestScenario = "TestScenario",
    Button = "Button",
}

interface Segment {
    type: SegmentType;
    language?: string;
    loading: boolean;
    text: string;
    fileName?: string;
    command?: string;
    failed?: boolean;
    [key: string]: any;
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
        /<code\s+filename="([^"]+)"(?:\s+type=("test"|"ai_map"))?>\s*```(\w+)\s*([\s\S]*?)```\s*<\/code>|<progress>([\s\S]*?)<\/progress>|<attachment>([\s\S]*?)<\/attachment>|<error>([\s\S]*?)<\/error>|<scenario>([\s\S]*?)<\/scenario>|<button\s+type="([^"]+)">([\s\S]*?)<\/button>|<inlineCode>([\s\S]*?)<inlineCode>|<references>([\s\S]*?)<references>/g;
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
        } else if (match[8]) {
            // <scenario> block matched
            const scenarioContent = match[8].trim();

            updateLastProgressSegmentLoading(true);
            segments.push({
                type: SegmentType.TestScenario,
                loading: false,
                text: scenarioContent,
            });
        } else if (match[9]) {
            // <button> block matched
            const buttonType = match[9].trim();
            const buttonContent = match[10].trim();

            updateLastProgressSegmentLoading(true);
            segments.push({
                type: SegmentType.Button,
                loading: false,
                text: buttonContent,
                buttonType: buttonType,
            });
        } else if (match[11]) {
            segments.push({
                type: SegmentType.InlineCode,
                text: match[11].trim(),
                loading: false,
            });
        } else if (match[12]) {
            segments.push({
                type: SegmentType.References,
                text: match[12].trim(),
                loading: false,
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
function generateChatHistoryForSummarize(chatArray: ChatEntry[]): ChatEntry[] {
    return chatArray
        .slice(integratedChatIndex)
        .filter(
            (chatEntry) =>
                chatEntry.actor.toLowerCase() == "user" &&
                !chatEntry.message.includes(GENERATE_TEST_AGAINST_THE_REQUIREMENT) &&
                !chatEntry.message.includes(GENERATE_CODE_AGAINST_THE_REQUIREMENT) &&
                !chatEntry.message.includes(CHECK_DRIFT_BETWEEN_CODE_AND_DOCUMENTATION)
        );
}
