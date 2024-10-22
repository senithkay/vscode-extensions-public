/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode, useRef, useState } from "react";
import styled from "@emotion/styled";
import { ExpressionFormField, Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { SubPanel } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { debounce } from "lodash";
import { convertBalCompletion, convertToFnSignature } from "../../../../utils/bi";
import { TRIGGER_CHARACTERS, TriggerCharacter } from "@wso2-enterprise/ballerina-core";
import { CompletionItem } from "@wso2-enterprise/ui-toolkit";

const Container = styled.div`
    max-width: 600px;
`;

export interface SidePanelProps {
    id?: string;
    className?: string;
    isOpen?: boolean;
    overlay?: boolean;
    children?: React.ReactNode;
    alignment?: "left" | "right";
    width?: number;
    sx?: any;
    onClose?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    subPanel?: ReactNode;
    subPanelWidth?: number;
    isSubPanelOpen?: boolean;
}

interface ConnectionConfigViewProps {
    fileName: string; // file path of `connection.bal`
    fields: FormField[];
    onSubmit: (data: FormValues) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    isActiveSubPanel?: boolean;

}

export function ConnectionConfigView(props: ConnectionConfigViewProps) {
    const { fileName, fields, onSubmit, openSubPanel, updatedExpressionField, resetUpdatedExpressionField, isActiveSubPanel } = props;
    const { rpcClient } = useRpcContext();
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const triggerCompletionOnNextRequest = useRef<boolean>(false);

    const debouncedGetCompletions = debounce(
        async (value: string, offset: number, triggerCharacter?: string, onlyVariables?: boolean) => {
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
                    filePath: fileName,
                    expression: value,
                    startLine: { line: 0, offset: 0 },
                    offset: offset,
                    context: {
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

    const handleGetCompletions = async (
        value: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => {
        await debouncedGetCompletions(value, offset, triggerCharacter, onlyVariables);

        if (triggerCharacter) {
            await debouncedGetCompletions.flush();
        }
    };

    const extractArgsFromFunction = async (value: string, cursorPosition: number) => {
        const signatureHelp = await rpcClient.getBIDiagramRpcClient().getSignatureHelp({
            filePath: fileName,
            expression: value,
            startLine: { line: 0, offset: 0 },
            offset: cursorPosition,
            context: {
                isRetrigger: false,
                triggerKind: 1,
            },
        });

        return convertToFnSignature(signatureHelp);
    };

    const handleExpressionEditorCancel = () => {
        setFilteredCompletions([]);
        setCompletions([]);
        triggerCompletionOnNextRequest.current = false;
    };

    const handleCompletionSelect = async () => {
        debouncedGetCompletions.cancel();
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    return (
        <Container>
            <Form
                formFields={fields}
                onSubmit={onSubmit}
                openSubPanel={openSubPanel}
                isActiveSubPanel={isActiveSubPanel}
                targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                fileName={fileName}
                updatedExpressionField={updatedExpressionField}
                resetUpdatedExpressionField={resetUpdatedExpressionField}
                expressionEditor={{
                    completions: filteredCompletions,
                    triggerCharacters: TRIGGER_CHARACTERS,
                    retrieveCompletions: handleGetCompletions,
                    extractArgsFromFunction: extractArgsFromFunction,
                    onCompletionSelect: handleCompletionSelect,
                    onCancel: handleExpressionEditorCancel,
                    onBlur: handleExpressionEditorBlur,
                }}
            />
        </Container>
    );
}

export default ConnectionConfigView;
