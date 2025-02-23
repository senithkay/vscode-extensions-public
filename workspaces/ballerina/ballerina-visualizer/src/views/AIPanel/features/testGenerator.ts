/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { AttachmentResult } from "@wso2-enterprise/ballerina-core";

export interface TestGeneratorIntermediaryState {
    content: [string, AttachmentResult[]];
    token: string;
    resourceFunction: string;
    testPlan: string;
}

// export async function processTestPlanning(
//     content: [string, AttachmentResult[]],
//     resourceFunction: string,
//     setMessages: React.Dispatch<React.SetStateAction<any[]>>,
//     setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
//     setIsTestPlanLoading: React.Dispatch<React.SetStateAction<boolean>>,
//     setTestGenIntermediaryState: React.Dispatch<React.SetStateAction<TestGeneratorIntermediaryState>>,
//     rpcClient: BallerinaRpcClient,
// ) {
//     setIsTestPlanLoading(true);
//     let assistantResponse = "";
//     const funcSource: string = await rpcClient.getAiPanelRpcClient().getResourceSource(resourceFunction);
//     const requestBody: any = {
//         testPlanFor: "function",
//         code: funcSource,
//     };

//     const response = (await rpcClient.getAiPanelRpcClient().fetchData({
//         url: "http://localhost:9094/ai/testplan",
//         options: {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(requestBody),
//         },
//     })).response;

//     if (!response.ok) {
//         setIsLoading(false);
//         if (response.status == 401) {
//             await rpcClient.getAiPanelRpcClient().promptLogin();
//             return;
//         }
//         console.log("Error: " + response);
//         throw new Error("Error: Unknown error occurred while fetching the test plan.");
//     }

//     const reader: ReadableStreamDefaultReader<Uint8Array> = response.body?.getReader();
//     const decoder = new TextDecoder();
//     let buffer = "";
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//             assistantResponse += `\n\n<button type="generate_test_group">Generate Tests</button>`;
//             setMessages((prevMessages) => {
//                 const newMessages = [...prevMessages];
//                 newMessages[newMessages.length - 1].content = assistantResponse;
//                 return newMessages;
//             });
//             setTestGenIntermediaryState({
//                 content: content,
//                 resourceFunction: resourceFunction,
//                 testPlan: assistantResponse,
//             });
//             setIsTestPlanLoading(false);
//             break;
//         }

//         buffer += decoder.decode(value, { stream: true });

//         let boundary = buffer.indexOf("\n\n");
//         while (boundary !== -1) {
//             const chunk = buffer.slice(0, boundary + 2);
//             buffer = buffer.slice(boundary + 2);
//             try {
//                 await processSSEEvent(chunk);
//             } catch (error) {
//                 console.error("Failed to parse SSE event:", error);
//             }

//             boundary = buffer.indexOf("\n\n");
//         }
//     }

//     async function processSSEEvent(chunk: string) {
//         const event = parseHttpSSEEvent(chunk);
//         if (event.event == "content_block_delta") {
//             let text = event.body.delta.text;
//             assistantResponse += text;

//             handleContentBlockDelta(text);
//         } else if (event.event == "error") {
//             console.log("Streaming Error: " + event.body);
//             setIsLoading(false);
//             setMessages((prevMessages) => {
//                 const newMessages = [...prevMessages];
//                 newMessages[newMessages.length - 1].content +=
//                     "\nUnknown error occurred while receiving the response.";
//                 newMessages[newMessages.length - 1].type = "Error";
//                 return newMessages;
//             });
//             assistantResponse = "\nUnknown error occurred while receiving the response.";
//             throw new Error("Streaming error");
//         }
//     }

//     function handleContentBlockDelta(text: string) {
//         setMessages((prevMessages) => {
//             const newMessages = [...prevMessages];
//             newMessages[newMessages.length - 1].content += text;
//             return newMessages;
//         });
//     }
// }
