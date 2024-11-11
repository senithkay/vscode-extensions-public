/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import { FieldValues, useForm, UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { Button, Codicon, CompletionItem, ExpressionBarRef, LinkButton } from "@wso2-enterprise/ui-toolkit";

import {
    FlowNode,
    Branch,
    LineRange,
    TRIGGER_CHARACTERS,
    TriggerCharacter,
    SubPanel,
    SubPanelView,
} from "@wso2-enterprise/ballerina-core";
import { Colors } from "../../../../resources/constants";
import { FormValues, ExpressionEditor, ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";
import { FormStyles } from "../styles";
import { convertBalCompletion, convertNodePropertyToFormField, convertToFnSignature } from "../../../../utils/bi";
import { cloneDeep, debounce } from "lodash";
import { RemoveEmptyNodesVisitor, traverseNode } from "@wso2-enterprise/bi-diagram";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

interface IfFormProps {
    fileName: string;
    node: FlowNode;
    targetLineRange: LineRange;
    onSubmit: (node?: FlowNode) => void;
    openSubPanel: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    isActiveSubPanel?: boolean;
}

export function IfForm(props: IfFormProps) {
    const {
        fileName,
        node,
        targetLineRange,
        onSubmit,
        openSubPanel,
        updatedExpressionField,
        resetUpdatedExpressionField,
        isActiveSubPanel,
    } = props;
    const { 
        control, 
        getValues, 
        setValue, 
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isValidating, isDirty },
    } = useForm<FormValues>();

    const { rpcClient } = useRpcContext();
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [activeEditor, setActiveEditor] = useState<number>(0);
    const [branches, setBranches] = useState<Branch[]>(cloneDeep(node.branches));
    const triggerCompletionOnNextRequest = useRef<boolean>(false);

    const exprRef = useRef<ExpressionBarRef>(null);

    const hasElseBranch = branches.find(
        (branch) =>
            branch.label === "Else" &&
            ((branch.children?.length > 0 &&
                !(branch.children[0].codedata.node === "EMPTY" && branch.children[0].metadata.draft)) ||
                branch.children?.length === 0)
    );

    useEffect(() => {
        if (updatedExpressionField) {
            const currentValue = getValues(updatedExpressionField.key);

            if (currentValue !== undefined) {
                const cursorPosition =
                    exprRef.current?.shadowRoot?.querySelector("textarea")?.selectionStart ?? currentValue.length;
                const newValue =
                    currentValue.slice(0, cursorPosition) +
                    updatedExpressionField.value +
                    currentValue.slice(cursorPosition);

                setValue(updatedExpressionField.key, newValue);
                resetUpdatedExpressionField && resetUpdatedExpressionField();
            }
        }
    }, [updatedExpressionField]);

    useEffect(() => {
        branches.forEach((branch, index) => {
            if (branch.properties?.condition) {
                const conditionValue = branch.properties.condition.value;
                setValue(`branch-${index}`, conditionValue || "");
            }
        });
    }, []);

    const handleExpressionEditorCancel = () => {
        setFilteredCompletions([]);
        setCompletions([]);
        triggerCompletionOnNextRequest.current = false;
    };

    const handleOnSave = (data: FormValues) => {
        handleExpressionEditorCancel();
        if (node && targetLineRange) {
            let updatedNode = cloneDeep(node);

            if (!updatedNode.codedata.lineRange) {
                updatedNode.codedata.lineRange = {
                    ...node.codedata.lineRange,
                    startLine: targetLineRange.startLine,
                    endLine: targetLineRange.endLine,
                };
            }

            // loop data and update branches (properties.condition.value)
            branches.forEach((branch, index) => {
                if (branch.label === "Else") {
                    return;
                }
                const conditionValue = data[`branch-${index}`]?.trim();
                if (conditionValue) {
                    branch.properties.condition.value = conditionValue;
                    if (branch.label !== "Then") {
                        branch.label = "";
                    }
                }
            });

            updatedNode.branches = branches;

            // check all nodes and remove empty nodes
            const removeEmptyNodeVisitor = new RemoveEmptyNodesVisitor(updatedNode);
            traverseNode(updatedNode, removeEmptyNodeVisitor);
            const updatedNodeWithoutEmptyNodes = removeEmptyNodeVisitor.getNode();

            onSubmit(updatedNodeWithoutEmptyNodes);
        }
    };

    const addNewCondition = () => {
        handleExpressionEditorCancel();
        // create new branch obj
        const newBranch: Branch = {
            label: "branch-" + branches.length,
            kind: "block",
            codedata: {
                node: "CONDITIONAL",
                lineRange: null,
            },
            repeatable: "ONE_OR_MORE",
            properties: {
                condition: {
                    metadata: {
                        label: "Else If Condition",
                        description: "Add condition to evaluate if the previous conditions are false",
                    },
                    valueType: "EXPRESSION",
                    value: "",
                    placeholder: "true",
                    optional: false,
                    editable: true,
                },
            },
            children: [],
        };

        setValue(`branch-${branches.length}`, "");
        // add new branch to end of the current branches
        setBranches([...branches, newBranch]);
    };

    const removeCondition = (index: number) => {
        handleExpressionEditorCancel();
        // Don't remove if it's the first branch (Then) or last branch (Else)
        if (index === 0 || (hasElseBranch && index === branches.length - 1)) {
            return;
        }
        // Remove the branch at the specified index
        const updatedBranches = branches.filter((_, i) => i !== index);
        setBranches(updatedBranches);

        for (let i = index + 1; i < branches.length; i++) {
            const value = getValues(`branch-${i}`);
            setValue(`branch-${i - 1}`, value);
        }
    };

    const addElseBlock = () => {
        if (hasElseBranch) {
            return;
        }
        const elseBranch: Branch = {
            label: "Else",
            kind: "block",
            codedata: {
                node: "ELSE",
                lineRange: null,
            },
            repeatable: "ZERO_OR_ONE",
            properties: {
                condition: {
                    metadata: {
                        label: "Else",
                        description: "Add condition to evaluate if the previous conditions are false",
                    },
                    valueType: "EXPRESSION",
                    value: "",
                    placeholder: "true",
                    optional: false,
                    editable: true,
                },
            },
            children: [],
        };
        // add new branch to end of the current branches
        setBranches([...branches, elseBranch]);
    };

    const removeElseBlock = () => {
        if (!hasElseBranch) {
            return;
        }
        // remove the else branch
        const updatedBranches = branches.filter((branch) => branch.label !== "Else");
        setBranches(updatedBranches);
    };

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
                    startLine: targetLineRange.startLine,
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

    const handleExpressionDiagnostics = debounce(async (
        expression: string,
        type: string,
        key: string,
        setError: UseFormSetError<FieldValues>,
        clearErrors: UseFormClearErrors<FieldValues>
    ) => {
        const response = await rpcClient.getBIDiagramRpcClient().getExpressionDiagnostics({
            filePath: fileName,
            expression: expression,
            type: type,
            startLine: targetLineRange.startLine,
        });

        const diagnosticsMessage = response.diagnostics.map((diagnostic) => diagnostic.message).join("\n");
        
        if (diagnosticsMessage.length > 0) {
            setError(key, { type: "validate", message: diagnosticsMessage });
        } else {
            clearErrors(key);
        }
    }, 250);

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
            startLine: targetLineRange.startLine,
            offset: cursorPosition,
            context: {
                isRetrigger: false,
                triggerKind: 1,
            },
        });

        return convertToFnSignature(signatureHelp);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    const handleCompletionSelect = async () => {
        debouncedGetCompletions.cancel();
        handleExpressionEditorCancel();
    };

    const handleEditorFocus = (currentActive: number) => {
        if (isActiveSubPanel && activeEditor !== currentActive) {
            openSubPanel && openSubPanel({ view: SubPanelView.UNDEFINED });
        }
        setActiveEditor(currentActive);
    };

    const disableSaveButton = Object.keys(errors).length > 0 || !isDirty || isValidating;

    // TODO: support multiple type fields
    return (
        <FormStyles.Container>
            {branches.map((branch, index) => {
                if (branch.properties?.condition && branch.label !== "Else") {
                    const field = convertNodePropertyToFormField(`branch-${index}`, branch.properties.condition);
                    return (
                        <FormStyles.Row key={field.key}>
                            <ExpressionEditor
                                ref={exprRef}
                                control={control}
                                field={field}
                                setError={setError}
                                clearErrors={clearErrors}
                                completions={activeEditor === index ? filteredCompletions : []}
                                triggerCharacters={TRIGGER_CHARACTERS}
                                retrieveCompletions={handleGetCompletions}
                                extractArgsFromFunction={extractArgsFromFunction}
                                getExpressionDiagnostics={handleExpressionDiagnostics}
                                onCompletionSelect={handleCompletionSelect}
                                onCancel={handleExpressionEditorCancel}
                                onFocus={() => handleEditorFocus(index)}
                                onBlur={handleExpressionEditorBlur}
                                openSubPanel={openSubPanel}
                                targetLineRange={targetLineRange}
                                fileName={fileName}
                                onRemove={index !== 0 && !branch.label.includes("Else") ? () => removeCondition(index) : undefined}
                            />
                        </FormStyles.Row>
                    );
                }
            })}

            <LinkButton onClick={addNewCondition} sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                <Codicon name={"add"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                Add Else IF Block
            </LinkButton>

            {!hasElseBranch && (
                <LinkButton onClick={addElseBlock} sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                    <Codicon name={"add"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                    Add Else Block
                </LinkButton>
            )}

            {hasElseBranch && (
                <LinkButton onClick={removeElseBlock} sx={{ fontSize: 12, padding: 8, color: Colors.ERROR, gap: 4 }}>
                    <Codicon name={"chrome-minimize"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                    Remove Else Block
                </LinkButton>
            )}

            {onSubmit && (
                <FormStyles.Footer>
                    <Button appearance="primary" onClick={handleSubmit(handleOnSave)} disabled={disableSaveButton}>
                        Save
                    </Button>
                </FormStyles.Footer>
            )}
        </FormStyles.Container>
    );
}

export default IfForm;
