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
import { useMutation } from '@tanstack/react-query';
import { ExpressionBar, CompletionItem, ExpressionBarRef } from '@wso2-enterprise/ui-toolkit';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { READONLY_MAPPING_FUNCTION_NAME } from './constants';
import { filterCompletions, getInnermostPropAsmtNode } from './utils';
import { View } from '../Views/DataMapperView';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';
import { buildInputAccessExpr, createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { useDMExpressionBarStore } from '../../../store/store';

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
    const cursorPositionBeforeSaving = useRef<number>(0);
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>();
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [action, triggerAction] = useState<boolean>(false);

    const {
        focusedPort,
        focusedFilter,
        lastFocusedPort,
        lastFocusedFilter,
        inputPort,
        savedNodeValue,
        lastSavedNodeValue,
        setLastFocusedPort,
        setLastFocusedFilter,
        resetInputPort,
        setSavedNodeValue,
        setLastSavedNodeValue,
        resetSavedNodeValue,
        resetLastSavedNodeValue,
        resetLastFocusedPort,
        resetLastFocusedFilter,
    } = useDMExpressionBarStore(state => state);

    const portChanged = !!(lastFocusedPort && lastFocusedPort.fieldFQN !== focusedPort?.fieldFQN);

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
    };

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

            setLastFocusedPort(focusedPort);
        } else if (focusedFilter) {
            const filter = focusedFilter.replaceWithText(text);
            setLastFocusedFilter(filter);
        }

        setCompletions(await getCompletions());
    }, 300), [focusedPort, focusedFilter]);

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
                    await handleChange(updatedText);
                    resetInputPort();
                }
            }
        })();
    }, [inputPort]);

    const disabled = useMemo(() => {
        let value = "";
        let disabled = true;

        if (focusedPort) {
            setPlaceholder('Insert a value for the selected port.');
            const focusedNode = focusedPort.typeWithValue.value;
            if (focusedNode && !focusedNode.wasForgotten()) {
                if (Node.isPropertyAssignment(focusedNode)) {
                    value = focusedNode.getInitializer()?.getText();
                } else {
                    value = focusedNode.getText();
                }
            }

            setSavedNodeValue(value);
            disabled = focusedPort.isDisabled();
        } else if (focusedFilter) {
            value = focusedFilter.getText();
            
            setLastFocusedFilter(focusedFilter);
            setSavedNodeValue(value);
            disabled = false;
        } else {
            // If displaying a focused view
            if (views.length > 1 && !views[views.length - 1].subMappingInfo) {
                setPlaceholder('Click on an output field or a filter to add/edit expressions.');
            } else {
                setPlaceholder('Click on an output field to add/edit expressions.');
            }

            resetSavedNodeValue();
        }

        // Set cursor position
        cursorPositionBeforeSaving.current = value.length;
        
        setTextFieldValue(value);
        triggerAction(!action);

        return disabled;
    }, [focusedPort, focusedFilter, views]);

    useEffect(() => {
        requestAnimationFrame(async () => {
            // Get the value to be saved
            let value = "";
            const focusedNode = lastFocusedPort?.typeWithValue.value;
            if (focusedNode && !focusedNode.wasForgotten()) {
                if (Node.isPropertyAssignment(focusedNode)) {
                    value = focusedNode.getInitializer()?.getText();
                } else {
                    value = focusedNode.getText();
                }
            } else if (lastFocusedFilter) {
                value = lastFocusedFilter.getText();
            } else if (!lastFocusedPort && !lastFocusedFilter) {
                value = undefined;
            }

            if (disabled) {
                await textFieldRef.current?.blur(value);
            } else if (portChanged) {
                await textFieldRef.current?.saveExpression(value);
                await textFieldRef.current?.focus();
            } else {
                await textFieldRef.current?.focus();
            }
        });
    }, [disabled, action, lastFocusedPort, lastFocusedFilter]);

    const initializeValue = async () => {
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

        const propertyAssignment = await createSourceForUserInput(
            focusedPort?.typeWithValue, objLitExpr, "", fnBody
        );

        const portValue = getInnermostPropAsmtNode(propertyAssignment) || propertyAssignment;
        focusedPort.typeWithValue.setValue(portValue);
    }

    const applyChanges = async (value: string) => {
        await updateST.flush();
        setSavedNodeValue(value);

        // Save the cursor position before saving
        cursorPositionBeforeSaving.current = textFieldRef.current.shadowRoot.querySelector('input').selectionStart;

        if (lastFocusedPort) {
            await applyChangesOnFocusedPort(value);
        } else if (lastFocusedFilter) {
            await applyChangesOnFocusedFilter();
        }
    };

    const applyChangesOnFocusedPort = async (value: string) => {
        const focusedFieldValue = lastFocusedPort?.typeWithValue.value;
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
        const updatedSourceContent = lastFocusedFilter.getSourceFile().getFullText();
        await applyModifications(updatedSourceContent);
    };

    const handleChange = async (text: string) => {
        setTextFieldValue(text);
        await updateST(text);
    };

    const updateSource = async (value: string) => {
        if (savedNodeValue === value) {
            return;
        } else {
            if (portChanged && lastSavedNodeValue === value) {
                return;
            }
        }
        await applyChanges(value);
    }

    const handleCancelCompletions = () => {
        setCompletions([]);
    }

    const handleFocus = async () => {
        const focusedNode = focusedPort?.typeWithValue.value;
        if (!focusedNode && !focusedFilter) {
            await initializeValue();
        }
        setCompletions(await getCompletions());

        // Set the cursor position to the last saved position
        textFieldRef.current.shadowRoot.querySelector('input').setSelectionRange(
            cursorPositionBeforeSaving.current, cursorPositionBeforeSaving.current
        );

        // Update the last focused port and filter
        setLastFocusedPort(focusedPort);
        setLastFocusedFilter(focusedFilter);
        setLastSavedNodeValue(savedNodeValue);
    }

    const handleBlur = async () => {
        // Reset the last focused port and filter
        resetLastFocusedPort();
        resetLastFocusedFilter();
        resetLastSavedNodeValue();

        // Reset text field value
        setTextFieldValue("");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useDisableOnChange = (fn: (...args: any[]) => Promise<any>) => {
        return useMutation({
            mutationFn: fn
        });
    }

    return (
        <div className={classes.exprBarContainer}>
            <ExpressionBar
                id='expression-bar'
                ref={textFieldRef}
                disabled={disabled}
                value={textFieldValue}
                placeholder={placeholder}
                completions={completions}
                onChange={handleChange}
                onCompletionSelect={updateSource}
                onSave={updateSource}
                onCancel={handleCancelCompletions}
                useTransaction={useDisableOnChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                sx={{ display: 'flex', alignItems: 'center' }}
            />
        </div>
    );
}

