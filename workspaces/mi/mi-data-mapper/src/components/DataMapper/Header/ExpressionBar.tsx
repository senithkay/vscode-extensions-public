/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Block, Node, ObjectLiteralExpression, PropertyAssignment, SyntaxKind, ts } from 'ts-morph';
import { debounce } from 'lodash';

import { css } from '@emotion/css';
import { ExpressionBar, CompletionItem, ExpressionBarRef } from '@wso2-enterprise/ui-toolkit';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { READONLY_MAPPING_FUNCTION_NAME } from './constants';
import { filterCompletions, getInnermostPropAsmtNode } from './utils';
import { View } from '../Views/DataMapperView';
import { DMTypeWithValue } from '../../../components/Diagram/Mappings/DMTypeWithValue';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';
import { buildInputAccessExpr, createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { useDMExpressionBarStore, useDMRegenerateNodesStore } from '../../../store/store';

const useStyles = () => ({
    exprBarContainer: css({
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--vscode-input-background)",
    }),
    textField: css({
        '&::part(control)': {
            fontFamily: 'monospace',
            fontSize: '12px'
        },
    })
});

export interface ExpressionBarProps {
    views: View[];
    filePath: string;
    applyModifications: (fileContent: string) => Promise<void>;
}

export default function ExpressionBarWrapper(props: ExpressionBarProps) {
    const { views, filePath, applyModifications } = props;
    const { rpcClient } = useVisualizerContext();
    const classes = useStyles();
    const textFieldRef = useRef<ExpressionBarRef>(null);
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>();
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [action, triggerAction] = useState<boolean>(false);

    // Refs for undoing and saving operations
    const prevFocusedFilter = useRef<Node | undefined>();
    const prevTypeWithValue = useRef<DMTypeWithValue>();
    const savedNodeValue = useRef<string | undefined>();

    const { focusedPort, focusedFilter, inputPort, resetInputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        focusedFilter: state.focusedFilter,
        inputPort: state.inputPort,
        resetInputPort: state.resetInputPort
    }));

    const { regenerateNodes } = useDMRegenerateNodesStore(state => ({
        regenerateNodes: state.regenerateNodes
    }));

    const getCompletions = async (): Promise<CompletionItem[]> => {
        if (!focusedPort && !focusedFilter) {
            return [];
        }

        let nodeForSuggestions: Node;
        if (focusedPort) {
            nodeForSuggestions = focusedPort.typeWithValue.value ||
            (focusedPort.getNode() as DataMapperNodeModel)?.context.functionST;
        } else {
            nodeForSuggestions = focusedFilter;
        }

        if (nodeForSuggestions && !nodeForSuggestions.wasForgotten()) {
            const fileContent = nodeForSuggestions.getSourceFile().getFullText();
            const cursorPosition = nodeForSuggestions.getEnd();
            const response = await rpcClient.getMiDataMapperRpcClient().getCompletions({
                filePath,
                fileContent,
                cursorPosition
            });

            if (!response.completions) {
                return [];
            }

            const completions = response.completions as { entry: ts.CompletionEntry, details: ts.CompletionEntryDetails }[];

            const localFunctionNames = nodeForSuggestions
                .getSourceFile()
                .getFunctions()
                .map(fn => fn.getName())
                .filter(name => name !== READONLY_MAPPING_FUNCTION_NAME);

            const filteredCompletions: CompletionItem[] = [];
            for (const completion of completions) {
                const details = filterCompletions(completion.entry, completion.details, localFunctionNames);
                if (details) {
                    filteredCompletions.push(details);
                }
            }
            
            return filteredCompletions;
        }

        return [];
    }

    useEffect(() => {
        (async () => {
            if (inputPort) {
                // Keep the text field focused when an input port is selected
                if (textFieldRef.current) {
                    const inputElement = textFieldRef.current.shadowRoot.querySelector('input');
                    if (focusedPort || focusedFilter) {
                        inputElement.focus();
                    } else {
                        inputElement.blur();
                    }
                    // Update the expression text when an input port is selected
                    const cursorPosition = textFieldRef.current.shadowRoot.querySelector('input').selectionStart;
                    const inputAccessExpr = buildInputAccessExpr(inputPort.fieldFQN);
                    const updatedText =
                        textFieldValue.substring(0, cursorPosition) +
                        inputAccessExpr +
                        textFieldValue.substring(cursorPosition);
                    await onChangeTextField(updatedText);
                    resetInputPort();
                }
            }
        })();
    }, [inputPort]);

    const undoChangesOnPrevSelectedNode = () => {
        if (prevTypeWithValue.current) {
            const prevFocusedNode = prevTypeWithValue.current.value;
            if (
                prevFocusedNode &&
                !prevFocusedNode.wasForgotten() &&
                Node.isPropertyAssignment(prevFocusedNode)
            ) {
                const parent = prevFocusedNode.getParent();
                const propName = prevFocusedNode.getName();
                prevFocusedNode.remove();
                const propertyAssignment = parent.addPropertyAssignment({
                    name: propName,
                    initializer: savedNodeValue.current
                });
                prevTypeWithValue.current.setValue(propertyAssignment);
                prevTypeWithValue.current = undefined;
            }
        } else if (prevFocusedFilter.current) {
            prevFocusedFilter.current.replaceWithText(savedNodeValue.current);
            prevFocusedFilter.current = undefined;
        }
    };

    const disabled = useMemo(() => {
        let value = "";
        let disabled = true;

        undoChangesOnPrevSelectedNode();
    
        if (focusedPort) {
            setPlaceholder('Insert a value for the selected port.');
            const focusedNode = focusedPort.typeWithValue.value;
            prevTypeWithValue.current = focusedPort.typeWithValue;
            if (focusedNode && !focusedNode.wasForgotten()) {
                if (Node.isPropertyAssignment(focusedNode)) {
                    value = focusedNode.getInitializer()?.getText();
                } else {
                    value = focusedNode ? focusedNode.getText() : "";
                }
            }
            disabled = focusedPort.isDisabled();
        } else if (focusedFilter) {
            value = focusedFilter.getText();
            prevFocusedFilter.current = focusedFilter;
            disabled = false;
        } else {
            // If displaying a focused view
            if (views.length > 1 && !views[views.length - 1].subMappingInfo) {
                setPlaceholder('Click on an output field or a filter to add/edit expressions.');
            } else {
                setPlaceholder('Click on an output field to add/edit expressions.');
            }
        }
    
        savedNodeValue.current = value;

        setTextFieldValue(value);
        triggerAction(!action);

        return disabled;
    }, [focusedPort, focusedFilter, views]);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (disabled) {
                textFieldRef.current?.blur();
            } else if (focusedPort || focusedFilter) {
                textFieldRef.current?.focus();
            }
        });
    }, [disabled, action]);

    const updateST = useCallback(debounce(async (text: string) => {
        let propertyAssignment: PropertyAssignment;
        const focusedFieldValue = focusedPort?.typeWithValue.value;
        if (focusedFieldValue) {
            if (focusedFieldValue.wasForgotten()) {
                return;
            }
            
            if (Node.isPropertyAssignment(focusedFieldValue)) {
                const parent = focusedFieldValue.getParent();
                const propName = focusedFieldValue.getName();
                const parentContent = parent.getFullText();
                const propertyCount = parent.getProperties().length;
                focusedFieldValue.remove();
                propertyAssignment = parent.addPropertyAssignment({
                    name: propName,
                    initializer: text
                });
                
                if (parent.getProperties().some(prop => prop.isKind(SyntaxKind.ShorthandPropertyAssignment))) {
                    /** 
                     * Creating a PropertyAssignment with invalid or incomplete text can result in unexpected
                     * ShorthandPropertyAssignments in ts-morph. To avoid this issue, we do not update the
                     * project at this stage. Instead, we revert the operations and return to the previous state.
                     */
                    const prevParent = parent.replaceWithText(parentContent) as ObjectLiteralExpression;
                    const prevFocusedFieldValue = prevParent.getProperties()[propertyCount - 1];
                    focusedPort.typeWithValue.setValue(prevFocusedFieldValue);
                } else {
                    focusedPort.typeWithValue.setValue(propertyAssignment);
                }
            }
        } else if (focusedFilter) {
            const filter = focusedFilter.replaceWithText(text);
            prevFocusedFilter.current = filter;
        } else {
            const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
            const fnBody = focusedNode.context.functionST.getBody() as Block;

            let objLitExpr: ObjectLiteralExpression;
            let parentPort = focusedPort?.parentModel;

            while (parentPort) {
                const parentValue = parentPort.typeWithValue?.value;
                if (parentValue && Node.isObjectLiteralExpression(parentValue)) {
                    objLitExpr = parentValue;
                    break;
                }
                parentPort = parentPort?.parentModel;
            }

            propertyAssignment = await createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, "", fnBody
            );

            const portValue = getInnermostPropAsmtNode(propertyAssignment) || propertyAssignment;
            focusedPort.typeWithValue.setValue(portValue);

            await updateST(text);
        }
        setCompletions(await getCompletions());
    }, 300), [focusedPort, focusedFilter]);

    const onChangeTextField = async (text: string) => {
        setTextFieldValue(text);
        await updateST(text);
    };

    const handleExpressionSave = async (value: string) => {
        if (savedNodeValue.current === value) {
            return;
        }
        savedNodeValue.current = value;
        await updateST.flush();
        await applyChanges(value);
    }

    const handleCompletionSelect = async (value: string) => {
        if (savedNodeValue.current === value) {
            return;
        }
        savedNodeValue.current = value;
        await updateST.flush();
        await applyChanges(value);
    }

    const handleCancelCompletions = () => {
        setCompletions([]);
    }

    const handleUndoUncommitedChanges = async () => {
        regenerateNodes();
    }

    const applyChanges = async (value: string) => {
        if (focusedPort) {
            await applyChangesOnFocusedPort(value);
        } else if (focusedFilter) {
            await applyChangesOnFocusedFilter();
        }
    };

    const applyChangesOnFocusedPort = async (value: string) => {
        const focusedFieldValue = focusedPort?.typeWithValue.value;
        let updatedSourceContent;
        if (focusedFieldValue) {
            if (focusedFieldValue.wasForgotten()) {
                return;
            }

            let targetExpr: Node;
            if (Node.isPropertyAssignment(focusedFieldValue)) {
                const parent = focusedFieldValue.getParent();

                if (value === '') {
                    focusedFieldValue.remove();
                }

                updatedSourceContent = parent.getSourceFile().getFullText();
            } else {
                targetExpr = focusedFieldValue;
                const replaceWith = value === ''
                    ? getDefaultValue(focusedPort.typeWithValue.type.kind)
                    : value;

                const updatedNode = targetExpr.replaceWithText(replaceWith);
                updatedSourceContent = updatedNode.getSourceFile().getFullText();
            }
            await applyModifications(updatedSourceContent);
        }
    };

    const applyChangesOnFocusedFilter = async () => {
        await applyModifications(focusedFilter.getSourceFile().getFullText());
    };

    return (
        <div className={classes.exprBarContainer}>
            <ExpressionBar
                id='expression-bar'
                ref={textFieldRef}
                disabled={disabled}
                value={textFieldValue}
                placeholder={placeholder}
                completions={completions}
                onChange={onChangeTextField}
                onCompletionSelect={handleCompletionSelect}
                onSave={handleExpressionSave}
                onCancel={handleCancelCompletions}
                undoUncommitedChanges={handleUndoUncommitedChanges}
                sx={{ display: 'flex', alignItems: 'center' }}
            />
        </div>
    );
}

