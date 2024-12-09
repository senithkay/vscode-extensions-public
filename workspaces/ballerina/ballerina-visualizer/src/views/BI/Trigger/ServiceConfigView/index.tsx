/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Typography, ProgressRing, CompletionItem } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { TRIGGER_CHARACTERS, TriggerCharacter, TriggerNode } from "@wso2-enterprise/ballerina-core";
import { Colors } from "../../../../resources/constants";
import { debounce } from "lodash";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { convertBalCompletion, convertToFnSignature, convertToVisibleTypes, convertTriggerServiceConfig, updateTriggerServiceConfig } from "../../../../utils/bi";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    height: 100%;
    > div:last-child {
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const FormContainer = styled.div`
    padding-bottom: 15px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    color: ${Colors.ON_SURFACE};
`;

interface ServiceConfigViewProps {
    triggerNode: TriggerNode;
    onSubmit: (data: TriggerNode) => void;
    onBack: () => void;
}

export function ServiceConfigView(props: ServiceConfigViewProps) {
    const { rpcClient } = useRpcContext();

    const { triggerNode, onSubmit, onBack } = props;
    const [serviceFields, setListenerFields] = useState<FormField[]>([]);


    // Expression Editor related start------->
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);
    const triggerCompletionOnNextRequest = useRef<boolean>(false);
    // Expression Editor related end------->

    useEffect(() => {
        triggerNode && setListenerFields(convertTriggerServiceConfig(triggerNode));
    }, [triggerNode]);

    const handleListenerSubmit = async (data: FormValues) => {
        serviceFields.forEach(val => {
            if (data[val.key]) {
                val.value = Array.isArray(data[val.key]) ? JSON.stringify(data[val.key]) : data[val.key];
            }
        })
        const response = updateTriggerServiceConfig(serviceFields, triggerNode);
        onSubmit(response);
    };



    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            const functionFilePath = Utils.joinPath(URI.file(context.projectUri!), 'triggers.bal');
            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: functionFilePath.fsPath,
                position: { line: 0, offset: 0 },
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        const filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
        return { visibleTypes, filteredTypes };
    }, 250);

    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        return await debouncedGetVisibleTypes(value, cursorPosition) as any;
    };

    const handleCompletionSelect = async () => {
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    const handleGetCompletions = async (
        value: string,
        key: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => {
        await debouncedGetCompletions(value, key, offset, triggerCharacter, onlyVariables);

        if (triggerCharacter) {
            await debouncedGetCompletions.flush();
        }
    };

    const debouncedGetCompletions = debounce(
        async (value: string, key: string, offset: number, triggerCharacter?: string, onlyVariables?: boolean) => {
            let expressionCompletions: CompletionItem[] = [];
            const effectiveText = value.slice(0, offset);
            const completionFetchText = effectiveText.match(/[a-zA-Z0-9_']+$/)?.[0] ?? "";
            const endOfStatementRegex = /[\)\]]\s*$/;
            if (offset > 0 && endOfStatementRegex.test(effectiveText)) {
                // Case 1: When a character unrelated to triggering completions is entered
                setCompletions([]);
            } else if (
                completions.length > 0 &&
                completionFetchText.length > 0 &&
                !triggerCharacter &&
                !onlyVariables &&
                !triggerCompletionOnNextRequest.current
            ) {
                // Case 2: When completions have already been retrieved and only need to be filtered
                expressionCompletions = completions
                    .filter((completion) => {
                        const lowerCaseText = completionFetchText.toLowerCase();
                        const lowerCaseLabel = completion.label.toLowerCase();

                        return lowerCaseLabel.includes(lowerCaseText);
                    })
                    .sort((a, b) => a.sortText.localeCompare(b.sortText));
            } else {
                // Case 3: When completions need to be retrieved from the language server
                // Retrieve completions from the ls
                let completions = await rpcClient.getBIDiagramRpcClient().getExpressionCompletions({
                    filePath: "",
                    context: {
                        expression: value,
                        startLine: { line: 0, offset: 0 },
                        offset: offset,
                        node: triggerNode,
                        property: key
                    },
                    completionContext: {
                        triggerKind: triggerCharacter ? 2 : 1,
                        triggerCharacter: triggerCharacter as TriggerCharacter,
                    },
                });

                if (onlyVariables) {
                    // If only variables are requested, filter out the completions based on the kind
                    // 'kind' for variables = 6
                    completions = completions?.filter((completion) => completion.kind === 6);
                    triggerCompletionOnNextRequest.current = true;
                } else {
                    triggerCompletionOnNextRequest.current = false;
                }

                // Convert completions to the ExpressionBar format
                let convertedCompletions: CompletionItem[] = [];
                completions?.forEach((completion) => {
                    if (completion.detail) {
                        // HACK: Currently, completion with additional edits apart from imports are not supported
                        // Completions that modify the expression itself (ex: member access)
                        convertedCompletions.push(convertBalCompletion(completion));
                    }
                });
                setCompletions(convertedCompletions);

                if (triggerCharacter) {
                    expressionCompletions = convertedCompletions;
                } else {
                    expressionCompletions = convertedCompletions
                        .filter((completion) => {
                            const lowerCaseText = completionFetchText.toLowerCase();
                            const lowerCaseLabel = completion.label.toLowerCase();

                            return lowerCaseLabel.includes(lowerCaseText);
                        })
                        .sort((a, b) => a.sortText.localeCompare(b.sortText));
                }
            }

            setFilteredCompletions(expressionCompletions);
        },
        250
    );

    const extractArgsFromFunction = async (value: string, key: string, cursorPosition: number) => {
        const signatureHelp = await rpcClient.getBIDiagramRpcClient().getSignatureHelp({
            filePath: "",
            context: {
                expression: value,
                startLine: { line: 0, offset: 0 },
                offset: cursorPosition,
                node: triggerNode,
                property: key
            },
            signatureHelpContext: {
                isRetrigger: false,
                triggerKind: 1,
            },
        });

        return convertToFnSignature(signatureHelp);
    };

    // <------------- Expression Editor Util functions list end --------------->

    return (
        <Container>

            {!triggerNode &&
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Trigger Configurations...</Typography>
                </LoadingContainer>
            }

            {triggerNode &&
                <>
                    {serviceFields.length > 0 &&
                        <FormContainer>
                            <Form
                                onCancelForm={onBack}
                                formFields={serviceFields}
                                onSubmit={handleListenerSubmit}
                                expressionEditor={
                                    {
                                        completions: filteredCompletions,
                                        triggerCharacters: TRIGGER_CHARACTERS,
                                        retrieveCompletions: handleGetCompletions,
                                        extractArgsFromFunction: extractArgsFromFunction,
                                        types: filteredTypes,
                                        retrieveVisibleTypes: handleGetVisibleTypes,
                                        onCompletionItemSelect: handleCompletionSelect,
                                        onCancel: handleExpressionEditorCancel,
                                        onBlur: handleExpressionEditorBlur,
                                    }
                                }
                            />
                        </FormContainer>
                    }
                </>
            }
        </Container>
    );
}

export default ServiceConfigView;
