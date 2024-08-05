/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ExpressionBar, CompletionItem } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import { Block, Node, ObjectLiteralExpression, ReturnStatement, ts } from 'ts-morph';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { useDMExpressionBarStore } from '../../../store/store';
import { buildInputAccessExpr, createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';
import { filterCompletions, getInnermostPropAsmtNode } from './utils';
import { READONLY_MAPPING_FUNCTION_NAME } from './constants';
import { View } from '../Views/DataMapperView';
import { ArrayOutputNode, ObjectOutputNode } from '../../../components/Diagram/Node';

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
    const textFieldRef = useRef<HTMLInputElement>(null);
    const savedTextFieldValue = useRef<string>("");
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>();

    const { focusedPort, focusedFilter, inputPort, resetInputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        focusedFilter: state.focusedFilter,
        inputPort: state.inputPort,
        resetInputPort: state.resetInputPort
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
            const fileContent = nodeForSuggestions.getSourceFile().getText();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputPort]);

    const disabled = useMemo(() => {
        let value = "";
        let disabled;
    
        if (focusedPort) {
            setPlaceholder('Insert a value for the selected port.');
            const focusedNode = focusedPort.typeWithValue.value;
            if (focusedNode && !focusedNode.wasForgotten()) {
                if (Node.isPropertyAssignment(focusedNode)) {
                    value = focusedNode.getInitializer()?.getText();
                } else {
                    value = focusedNode ? focusedNode.getText() : "";
                }
            }

            if (textFieldRef.current) {
                textFieldRef.current.focus();
            }

            disabled = focusedPort.isDisabled();
        } else if (focusedFilter) {
            value = focusedFilter.getText();

            if (textFieldRef.current) {
                textFieldRef.current.focus();
            }

            disabled = false;
        } else if (textFieldRef.current) {
            // If displaying a focused view
            if (views.length > 1 && !views[views.length - 1].subMappingInfo) {
                setPlaceholder('Click on an output field or a filter to add/edit expressions.');
            } else {
                setPlaceholder('Click on an output field to add/edit expressions.');
            }

            textFieldRef.current.blur();
        }
    
        savedTextFieldValue.current = textFieldValue;
        setTextFieldValue(value);
        return disabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textFieldRef.current, focusedPort, focusedFilter, views]);

    const onChangeTextField = async (text: string) => {
        setTextFieldValue(text);
        const focusedFieldValue = focusedPort?.typeWithValue.value;
        if (focusedFieldValue) {
            if (focusedFieldValue.wasForgotten()) {
                return;
            }
            
            if (Node.isPropertyAssignment(focusedFieldValue)) {
                const parent = focusedFieldValue.getParent();
                const propName = focusedFieldValue.getName();
                focusedFieldValue.remove();
                const properties = parent.getProperties();
                
                // Workaround for https://github.com/wso2/mi-vscode/issues/246
                // Remove short hand property assignments and property assinments without names
                properties.filter(property => (Node.isPropertyAssignment(property) && property.getName() === "")
                    || (Node.isShorthandPropertyAssignment(property)))
                        .forEach(property => {
                            property.remove();
                        });

                const propertyAssignment = parent.addPropertyAssignment({
                    name: propName,
                    initializer: text
                });
                focusedPort.typeWithValue.setValue(propertyAssignment);
            }
        } else if (focusedFilter) {
            focusedFilter.replaceWithText(text);
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

            const propertyAssignment = await createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, text, fnBody
            );

            const portValue = getInnermostPropAsmtNode(propertyAssignment) || propertyAssignment;

            focusedPort.typeWithValue.setValue(portValue);
        }
    };

    const handleExpressionSave = async (value: string) => {
        if (savedTextFieldValue.current === value) {
            return;
        }
        savedTextFieldValue.current = value;
        await applyChanges(value);
    }

    const handleCompletionSelect = async (value: string) => {
        if (savedTextFieldValue.current === value) {
            return;
        }
        savedTextFieldValue.current = value;
        await applyChanges(value);
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
        if (focusedFieldValue) {
            if (focusedFieldValue.wasForgotten()) {
                return;
            }

            let targetExpr: Node;
            if (Node.isPropertyAssignment(focusedFieldValue)) {
                if (value === '') {
                    focusedFieldValue.remove();
                }
            } else {
                targetExpr = focusedFieldValue;
                const replaceWith = value === ''
                    ? getDefaultValue(focusedPort.typeWithValue.type.kind)
                    : value;

                targetExpr.replaceWithText(replaceWith);
            }
            await applyModifications(focusedFieldValue.getSourceFile().getFullText());
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
                disabled={disabled ?? false}
                value={textFieldValue}
                placeholder={placeholder}
                onChange={onChangeTextField}
                onCompletionSelect={handleCompletionSelect}
                onSave={handleExpressionSave}
                getCompletions={getCompletions}
                sx={{ display: 'flex', alignItems: 'center' }}
            />
        </div>
    );
}

