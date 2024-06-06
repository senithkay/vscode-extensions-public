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
import { css } from '@emotion/css';
import { Block, Node, ObjectLiteralExpression, ReturnStatement } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';
import { createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getFnDeclStructure, operators } from '../Operators/operators';

const functionNames = Object.keys(operators);

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
    applyModifications: () => void
}

export default function ExpressionBar(props: ExpressionBarProps) {
    const { applyModifications } = props;
    const classes = useStyles();

    const [, setForceUpdate] = useState(false);

    const textFieldRef = useRef<HTMLInputElement>(null);
    const expressionRef = useRef("");

    const { focusedPort, inputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        inputPort: state.inputPort
    }));

    useEffect(() => {
        // Keep the text field focused when an input port is selected
        if (textFieldRef.current) {
            const inputElement = textFieldRef.current.shadowRoot.querySelector('input');
            if (focusedPort) {
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
    
            if (Node.isPropertyAssignment(focusedNode)) {
                value = focusedNode.getInitializer()?.getText();
            } else {
                value = focusedNode ? focusedNode.getText() : "";
            }

            if (textFieldRef.current) {
                textFieldRef.current.focus();
            }
    
            disabled = focusedPort.isDisabled();
        } else if (textFieldRef.current) {
            textFieldRef.current.blur();
        }
    
        expressionRef.current = value;
        return disabled;
    }, [focusedPort]);

    const onChangeTextField = (text: string) => {
        expressionRef.current = text;

        if (text === '') {
            // Render auto-complete suggestions when the text field is empty
            setForceUpdate(prev => !prev);
        }
    };

    const onChangeAutoComplete = (text: string) => {
        let updatedText = text;
        const fnName = text.split('(')[0];
        const isFunctionName = functionNames.includes(text);
        const hasFunctionName = functionNames.includes(fnName);
        const isFunction = isFunctionName || hasFunctionName;

        updatedText = isFunctionName ? `${text}(` : addClosingBracketIfNeeded(text);
        expressionRef.current = updatedText;

        const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
        const fnST = focusedNode.context.functionST;
        const sourceFile = fnST.getSourceFile();

        const isFunctionPresent = sourceFile.getFunctions().find(fn => fn.getName() === text);
        if (isFunction && !isFunctionPresent) {
            sourceFile.addFunction(getFnDeclStructure(fnName));
        }
        
        applyChanges();
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Apply the expression when the Enter key is pressed
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default behavior of the Enter key
            expressionRef.current = addClosingBracketIfNeeded(expressionRef.current);
            applyChanges();
        }
    };

    const applyChanges = () => {
        const focusedFieldValue = focusedPort?.typeWithValue.value;

        if (focusedFieldValue) {
            let targetExpr: Node;

            if (Node.isPropertyAssignment(focusedFieldValue)) {
                targetExpr = focusedFieldValue.getInitializer();
            }

            if (expressionRef.current !== '') {
                targetExpr.replaceWithText(expressionRef.current);
            } else {
                if (Node.isPropertyAssignment(focusedFieldValue)) {
                    focusedFieldValue.remove();
                }
                // TODO: Handle other types of nodes
            }

            applyModifications();
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

            createSourceForUserInput(
                focusedPort?.typeWithValue, objLitExpr, expressionRef.current, fnBody, applyModifications
            );
        }
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
                updatedText+= ')';
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
                        sx={{ fontFamily: 'monospace', fontSize: '12px' }}
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
