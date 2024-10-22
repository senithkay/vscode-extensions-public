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
import { Button, Codicon, CompletionItem, Typography } from "@wso2-enterprise/ui-toolkit";
import { ExpressionFormField, Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { BodyText } from "../../../styles";
import { Colors } from "../../../../resources/constants";
import { SubPanel } from "@wso2-enterprise/ballerina-core";
import { S } from "../../../Connectors/ActionList";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { debounce } from "lodash";
import { convertBalCompletion, convertToFnSignature } from "../../../../utils/bi";
import { TRIGGER_CHARACTERS, TriggerCharacter } from "@wso2-enterprise/ballerina-core";

const Container = styled.div`
    max-width: 600px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    color: ${Colors.ON_SURFACE};
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

const SubPanelContainer = styled.div<SidePanelProps>`
    position: fixed;
    top: 0;
    ${(props: SidePanelProps) => props.alignment === "left" ? "left" : "right"}: ${(props: SidePanelProps) => `${props.width}px`};
    width: ${(props: SidePanelProps) => `${props.subPanelWidth}px`};
    height: 100%;
    box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    z-index: 1999;
    opacity: ${(props: SidePanelProps) => props.isSubPanelOpen ? 1 : 0};
    transform: translateX(${(props: SidePanelProps) => props.alignment === 'left'
        ? (props.isSubPanelOpen ? '0%' : '-100%')
        : (props.isSubPanelOpen ? '0%' : '100%')});
    transition: transform 0.4s ease 0.1s, opacity 0.4s ease 0.1s;
`;

interface ConnectionConfigViewProps {
    fileName: string; // file path of `connection.bal`
    name: string;
    fields: FormField[];
    onSubmit: (data: FormValues) => void;
    onBack?: () => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    isActiveSubPanel?: boolean;

}

export function ConnectionConfigView(props: ConnectionConfigViewProps) {
    const { fileName, name, fields, onSubmit, onBack, openSubPanel, updatedExpressionField, resetUpdatedExpressionField, isActiveSubPanel } = props;
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
                const convertedCompletions = completions?.map((completion) => convertBalCompletion(completion)) ?? [];
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

    // TODO: With the InlineEditor implementation, the targetLine, fileName and expressionEditor should be passed to the Form component
    return (
        <Container>
            <Form
                formFields={fields}
                onSubmit={onSubmit}
                openSubPanel={openSubPanel}
                isActiveSubPanel={isActiveSubPanel}
                targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                fileName={""}
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
