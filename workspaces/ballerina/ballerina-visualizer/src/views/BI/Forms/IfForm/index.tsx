/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Codicon, CompletionItem, LinkButton } from "@wso2-enterprise/ui-toolkit";

import { FlowNode, Branch, LineRange, TRIGGER_CHARACTERS, TriggerCharacter } from "@wso2-enterprise/ballerina-core";
import { Colors } from "../../../../resources/constants";
import { FormValues, ExpressionEditor } from "@wso2-enterprise/ballerina-side-panel";
import { FormStyles } from "../styles";
import { convertBalCompletion, convertNodePropertyToFormField } from "../../../../utils/bi";
import { cloneDeep, debounce } from "lodash";
import { RemoveEmptyNodesVisitor, traverseNode } from "@wso2-enterprise/bi-diagram";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

interface IfFormProps {
    fileName: string;
    node: FlowNode;
    targetLineRange: LineRange;
    onSubmit: (node?: FlowNode) => void;
}

export function IfForm(props: IfFormProps) {
    const { fileName, node, targetLineRange, onSubmit } = props;
    const { control, getValues, setValue, handleSubmit } = useForm<FormValues>();

    const { rpcClient } = useRpcContext();
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const isChainedExpression = useRef<boolean>(false);
    const triggerCompletionOnNextRequest = useRef<boolean>(false);
    const [activeEditor, setActiveEditor] = useState<number>(0);

    const [branches, setBranches] = useState<Branch[]>(cloneDeep(node.branches));

    console.log(">>> form fields", { node, values: getValues(), branches });

    const clearExpressionEditor = () => {
        // clear memory for expression editor
        setCompletions([]);
        setFilteredCompletions([]);
        isChainedExpression.current = false;
        triggerCompletionOnNextRequest.current = false;
    }

    const handleOnSave = (data: FormValues) => {
        clearExpressionEditor();
        if (node && targetLineRange) {
            let updatedNode = cloneDeep(node);

            if(!updatedNode.codedata.lineRange){
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
                const conditionValue = data[branch.label]?.trim();
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
        clearExpressionEditor();
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
                value: "true",
                optional: false,
                editable: true,
            },
            },
            children: [],
        };
        // add new branch to branches and add branch to before last branch
        setBranches([...branches.slice(0, -1), newBranch, branches[branches.length - 1]]);
    };

    const debouncedGetCompletions = debounce(
        async (value: string, offset: number, triggerCharacter?: string, onlyVariables?: boolean) => {
            let expressionCompletions: CompletionItem[] = [];
            const endOfChainRegex = new RegExp(`[^a-zA-Z0-9_'${TRIGGER_CHARACTERS.join('')}]$`);
            if (
                offset > 0 &&
                endOfChainRegex.test(value[offset - 1]) &&
                !onlyVariables &&
                !triggerCompletionOnNextRequest
            ) {
                // Case 1: When a character unrelated to triggering completions is entered
                isChainedExpression.current = false;
                setCompletions([]);
            } else if (
                completions.length > 0 &&
                !triggerCharacter &&
                !isChainedExpression &&
                !onlyVariables &&
                !triggerCompletionOnNextRequest
            ) {
                // Case 2: When completions have already been retrieved and only need to be filtered
                expressionCompletions = completions
                    .filter((completion) => {
                        const text = value.slice(0, offset).match(/[a-zA-Z0-9_']+$/)?.[0] ?? '';
                        const lowerCaseText = text.toLowerCase();
                        const lowerCaseLabel = completion.label.toLowerCase();

                        return lowerCaseLabel.includes(lowerCaseText);
                    })
                    .sort((a, b) => a.sortText.localeCompare(b.sortText));
            } else {
                // Case 3: When completions need to be retrieved from the language server
                if (triggerCharacter) {
                    isChainedExpression.current = true;
                } else {
                    const triggerRegex = new RegExp(`[${TRIGGER_CHARACTERS.join('')}]\\w*`);
                    if (triggerRegex.test(value.slice(0, offset))) {
                        isChainedExpression.current = true;
                    } else {
                        isChainedExpression.current = false;
                    }
                }

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
                const convertedCompletions = completions?.map((completion) => convertBalCompletion(completion)) ?? [];
                setCompletions(convertedCompletions);

                if (triggerCharacter) {
                    expressionCompletions = convertedCompletions;
                } else {
                    expressionCompletions = convertedCompletions
                        .filter((completion) => {
                            const text = value.slice(0, offset).match(/[a-zA-Z0-9_']+$/)?.[0] ?? '';
                            const lowerCaseText = text.toLowerCase();
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
    }

    const handleExpressionEditorCancel = () => {
        setFilteredCompletions([]);
        setCompletions([]);
    };

    const handleCompletionSelect = async () => {
        debouncedGetCompletions.cancel();
        handleExpressionEditorCancel();
    }

    const handleEditorFocus = (activeEditor: number) => {
        setActiveEditor(activeEditor);
    }

    useEffect(() => {
        branches.forEach((branch) => {
            if (branch.properties?.condition) {
                const field = convertNodePropertyToFormField(branch.label, branch.properties.condition);
                setValue(field.key, field.value);
            }
        });
    }, [branches]);

    // TODO: support multiple type fields
    return (
        <FormStyles.Container>
            {branches.map((branch, index) => {
                if (branch.properties?.condition) {
                    const field = convertNodePropertyToFormField(branch.label, branch.properties.condition);
                    return (
                        <FormStyles.Row key={branch.label}>
                            <ExpressionEditor
                                control={control}
                                field={field}
                                completions={activeEditor === index ? filteredCompletions : []}
                                triggerCharacters={TRIGGER_CHARACTERS}
                                onRetrieveCompletions={handleGetCompletions}
                                onCompletionSelect={handleCompletionSelect}
                                onCancel={handleExpressionEditorCancel}
                                onFocus={() => handleEditorFocus(index)}
                            />
                        </FormStyles.Row>
                    );
                }
            })}

            <LinkButton onClick={addNewCondition} sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                <Codicon name={"add"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                Add Else IF Condition
            </LinkButton>

            {onSubmit && (
                <FormStyles.Footer>
                    <Button appearance="primary" onClick={handleSubmit(handleOnSave)}>
                        Save
                    </Button>
                </FormStyles.Footer>
            )}
        </FormStyles.Container>
    );
}

export default IfForm;
