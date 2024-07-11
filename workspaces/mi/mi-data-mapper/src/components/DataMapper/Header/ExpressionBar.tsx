/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ExpressionBar, ItemType } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import { Block, Node, ObjectLiteralExpression, ReturnStatement, ts } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';
import { createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';
import { filterOperators } from './utils';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

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
    filePath: string;
    applyModifications: () => Promise<void>
}

export default function ExpressionBarWrapper(props: ExpressionBarProps) {
    const { filePath, applyModifications } = props;
    const { rpcClient } = useVisualizerContext();
    const classes = useStyles();
    const textFieldRef = useRef<HTMLInputElement>(null);
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>();

    const { focusedPort, focusedFilter, inputPort, resetInputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        focusedFilter: state.focusedFilter,
        inputPort: state.inputPort,
        resetInputPort: state.resetInputPort
    }));

    const getCompletions = async (): Promise<ItemType[]> => {
        if (!focusedPort) {
            return [];
        }

        const focusedNode = ((focusedPort.typeWithValue.value ||
            (focusedPort.getNode() as DataMapperNodeModel)?.context.functionST) as Node);
        if (focusedNode && !focusedNode.wasForgotten()) {
            const fileContent = focusedNode.getSourceFile().getText();
            const cursorPosition = focusedNode.getEnd();
            const response = await rpcClient.getMiDataMapperRpcClient().getOperators({
                filePath,
                fileContent,
                cursorPosition
            });

            if (!response.operators) {
                return [];
            }

            const operators = response.operators as { entry: ts.CompletionEntry, details: ts.CompletionEntryDetails }[];
            
            const filteredOperators: ItemType[] = [];
            for (const operator of operators) {
                const details = filterOperators(operator.entry, operator.details);
                if (details) {
                    filteredOperators.push(details);
                }
            }
            
            return filteredOperators;
        }

        return [];
    }

    useEffect(() => {
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
                const cursorPosition = (textFieldRef.current.shadowRoot.getElementById('control') as HTMLInputElement)
                    .selectionStart
                const updatedText = 
                    textFieldValue.substring(0, cursorPosition) +
                    inputPort.fieldFQN +
                    textFieldValue.substring(cursorPosition);
                setTextFieldValue(updatedText);
                resetInputPort();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setPlaceholder('Click on an output port to use the Expression Editor.');
            textFieldRef.current.blur();
        }
    
        setTextFieldValue(value);
        return disabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textFieldRef.current, focusedPort, focusedFilter]);

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
                const propertyAssignment = parent.addPropertyAssignment({
                    name: propName,
                    initializer: text
                });
                focusedPort.typeWithValue.setValue(propertyAssignment);
            }
        } else {
            const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
            const fnBody = focusedNode.context.functionST.getBody() as Block;

            const returnExpr = (fnBody.getStatements().find((statement) =>
                Node.isReturnStatement(statement)
            ) as ReturnStatement)?.getExpression();

            let objLitExpr: ObjectLiteralExpression;
            if (returnExpr && Node.isObjectLiteralExpression(returnExpr)) {
                objLitExpr = returnExpr;
            }

            const propertyAssignment = await createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, text, fnBody
            );
            focusedPort.typeWithValue.setValue(propertyAssignment);
        }
    };

    const handleExpressionSave = async (value: string) => {
        setTextFieldValue(value);
        await applyChanges(value);
    }

    const onItemSelect = async () => {
        await applyChanges();
    }

    const applyChanges = async (value?: string) => {
        if (focusedPort) {
            applyChangesOnFocusedPort(value);
        } else if (focusedFilter) {
            applyChangesOnFocusedFilter(value);
        }
    };

    const applyChangesOnFocusedPort = async (value?: string) => {
        if (value === undefined) {
            await applyModifications();
            return;
        }

        const focusedFieldValue = focusedPort?.typeWithValue.value;
        if (focusedFieldValue) {
            if (focusedFieldValue.wasForgotten()) {
                return;
            }

            let targetExpr: Node;
            if (Node.isPropertyAssignment(focusedFieldValue)) {
                targetExpr = focusedFieldValue.getInitializer();

                if (value !== '') {
                    const parent = focusedFieldValue.getParent();
                    const propName = focusedFieldValue.getName();

                    focusedFieldValue.remove();
                    parent.addPropertyAssignment({
                        name: propName,
                        initializer: value
                    });
                } else {
                    focusedFieldValue.remove();
                }
            } else {
                targetExpr = focusedFieldValue;
                const replaceWith = value === ''
                    ? getDefaultValue(focusedPort.typeWithValue.type.kind)
                    : value;

                targetExpr.replaceWithText(replaceWith);
            }

            await applyModifications();
        } else {
            const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
            const fnBody = focusedNode.context.functionST.getBody() as Block;

            const returnExpr = (fnBody.getStatements().find((statement) =>
                Node.isReturnStatement(statement)
            ) as ReturnStatement)?.getExpression();

            let objLitExpr: ObjectLiteralExpression;
            if (returnExpr && Node.isObjectLiteralExpression(returnExpr)) {
                objLitExpr = returnExpr;
            }

            await createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, value, fnBody, applyModifications
            );
        }
    };

    const applyChangesOnFocusedFilter = async (value: string) => {
        focusedFilter.replaceWithText(value);
        await applyModifications();
    };

    return (
        <div className={classes.exprBarContainer}>
            <ExpressionBar
                id='expression-bar'
                ref={textFieldRef}
                disabled={disabled}
                value={textFieldValue}
                placeholder={placeholder}
                onChange={onChangeTextField}
                onItemSelect={onItemSelect}
                onSave={handleExpressionSave}
                getCompletions={getCompletions}
                sx={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontSize: '12px' }}
            />
        </div>
    );
}

