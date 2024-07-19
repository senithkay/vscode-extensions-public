/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AutoComplete, Icon, TextField } from '@wso2-enterprise/ui-toolkit';
import { DMOperator } from "@wso2-enterprise/mi-core";
import { css } from '@emotion/css';
import { Block, Node, ObjectLiteralExpression, PropertyAssignment, ReturnStatement, SyntaxKind, Expression } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';
import { createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getFnDeclStructure, operators } from '../Operators/operators';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';

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
    applyModifications: () => Promise<void>
    operators: DMOperator[];
}

export default function ExpressionBar(props: ExpressionBarProps) {
    const { applyModifications, operators } = props;
    const classes = useStyles();

    const [, setForceUpdate] = useState(false);

    const textFieldRef = useRef<HTMLInputElement>(null);
    const expressionRef = useRef("");

    const { focusedPort, focusedFilter, inputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        focusedFilter: state.focusedFilter,
        inputPort: state.inputPort
    }));

    const functionNames = operators.map(op => (op.action ?? "") + op.label);

    useEffect(() => {
        // Keep the text field focused when an input port is selected
        if (textFieldRef.current) {
            const inputElement = textFieldRef.current.shadowRoot.querySelector('input');
            if (focusedPort || focusedFilter) {
                inputElement.focus();
            } else {
                inputElement.blur();
            }
        }
        // Update the expression text when an input port is selected
        if (inputPort && textFieldRef.current) {
            const inputElement = textFieldRef.current.shadowRoot.querySelector('input');
            const cursorPosition = inputElement.selectionStart;
            const currentText = expressionRef.current;
            const beforeCursor = currentText.substring(0, cursorPosition);
            const afterCursor = currentText.substring(cursorPosition);
            const updatedText = `${beforeCursor}${inputPort.fieldFQN}${afterCursor}`;
            expressionRef.current = updatedText;
            inputElement.value = updatedText; // Update the text field's value
            inputElement.setSelectionRange(cursorPosition + inputPort.fieldFQN.length, cursorPosition + inputPort.fieldFQN.length); // Set cursor position right after the inserted text
            setForceUpdate(prev => !prev);
        }
    }, [inputPort]);

    const disabled = useMemo(() => {
        let value = "";
        let disabled = true;

        if (focusedPort) {
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
            textFieldRef.current.blur();
        }

        expressionRef.current = value;
        return disabled;
    }, [focusedPort, focusedFilter]);

    const onChangeTextField = (text: string) => {
        expressionRef.current = text;

        if (text === '') {
            // Render auto-complete suggestions when the text field is empty
            setForceUpdate(prev => !prev);
        }
    };

    const onChangeAutoComplete = async (text: string) => {
        let updatedText = text;
        const fnName = text.split('(')[0];
        const isFunctionName = functionNames.includes(text);
        const hasFunctionName = functionNames.includes(fnName);
        const isFunction = isFunctionName || hasFunctionName;

        updatedText = isFunctionName ? `${text}(` : addClosingBracketIfNeeded(text);
        expressionRef.current = updatedText;

        await applyChanges();
    };

    const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Apply the expression when the Enter key is pressed
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default behavior of the Enter key
            expressionRef.current = addClosingBracketIfNeeded(expressionRef.current);
            await applyChanges();
        }
    };

    const applyChanges = async () => {
        if (focusedPort) {
            applyChangesOnFocusedPort();
        } else if (focusedFilter) {
            applyChangesOnFocusedFilter();
        }
    };

    const applyChangesOnFocusedPort = async () => {
        const focusedFieldValue = focusedPort?.typeWithValue.value;



        if (focusedFieldValue) {
            let targetExpr: Node;

            if (Node.isPropertyAssignment(focusedFieldValue)) {
                targetExpr = focusedFieldValue.getInitializer();

                if (expressionRef.current !== '') {
                    const parent = focusedFieldValue.getParent();
                    const propName = focusedFieldValue.getName();

                    focusedFieldValue.remove();
                    parent.addPropertyAssignment({
                        name: propName,
                        initializer: expressionRef.current
                    });
                } else {
                    focusedFieldValue.remove();
                }
            } else {
                targetExpr = focusedFieldValue;
                const replaceWith = expressionRef.current === ''
                    ? getDefaultValue(focusedPort.typeWithValue.type.kind)
                    : expressionRef.current;

                targetExpr.replaceWithText(replaceWith);
            }

            await applyModifications();
        } else {
            const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
            const fnBody = focusedNode.context.functionST.getBody() as Block;

            let returnExpr: Expression;

            //Condition to check array mapping or not
            if (focusedNode.context.views.length > 1) {
                const propertyAssignment = focusedNode.context.focusedST as PropertyAssignment;
                const arrowFunction = propertyAssignment?.getInitializerIfKindOrThrow(SyntaxKind.CallExpression)
                    ?.getArguments()?.[0]
                    ?.asKindOrThrow(SyntaxKind.ArrowFunction);
                const returnStatement = arrowFunction?.getDescendantsOfKind(SyntaxKind.ReturnStatement)?.[0];
                returnExpr = returnStatement?.getExpression();
            } else {
                returnExpr = (fnBody.getStatements().find((statement) =>
                    Node.isReturnStatement(statement)
                ) as ReturnStatement)?.getExpression();
            }

            let objLitExpr: ObjectLiteralExpression;
            if (returnExpr && Node.isObjectLiteralExpression(returnExpr)) {
                objLitExpr = returnExpr;
            }

            await createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, expressionRef.current, fnBody, applyModifications
            );
        }
    };

    const applyChangesOnFocusedFilter = async () => {
        const replaceWith = expressionRef.current;
        focusedFilter.replaceWithText(replaceWith);

        await applyModifications();
    };

    const addClosingBracketIfNeeded = (text: string) => {
        let updatedText = text;

        if (text.endsWith('(')) return updatedText;

        const closingBracket = updatedText.includes('(') && !updatedText.includes(')');

        // Add a closing bracket if the expression has an opening bracket but no closing bracket
        if (closingBracket) {
            updatedText += ')';
        } else {
            const openBrackets = (updatedText.match(/\(/g) || []).length;
            const closeBrackets = (updatedText.match(/\)/g) || []).length;
            if (openBrackets > closeBrackets) {
                updatedText += ')';
            }
        }

        return updatedText;
    }

    return (
        <div className={classes.exprBarContainer}>
            {focusedPort && expressionRef.current === "" ? (
                // Hack to list down the operator suggestions whenever the expression is empty
                <>
                    <Icon
                        name={"function-icon"}
                        iconSx={{ fontSize: "15px", color: "var(--vscode-input-placeholderForeground)" }}
                        sx={{ margin: "5px 9px" }}
                    />
                    <AutoComplete
                        sx={{ fontFamily: 'monospace', fontSize: '12px', height: 'auto' }}
                        identifier='expression-bar-autocomplete'
                        items={functionNames}
                        allowItemCreate={true}
                        hideDropdown={true}
                        onValueChange={onChangeAutoComplete}
                    />
                </>
            ) : (
                <TextField
                    ref={textFieldRef}
                    sx={{ width: '100%' }}
                    className={classes.textField}
                    disabled={disabled}
                    icon={{
                        iconComponent: (
                            <Icon
                                name={"function-icon"}
                                iconSx={{ fontSize: "15px", color: "var(--vscode-input-placeholderForeground)" }}
                            />
                        ),
                        position: "start"
                    }}
                    value={expressionRef.current}
                    onTextChange={onChangeTextField}
                    onKeyDown={onKeyDown}
                />
            )}
        </div>
    );
}
