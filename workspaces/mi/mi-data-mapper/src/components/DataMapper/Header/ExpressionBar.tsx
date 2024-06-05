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
import { DataMapperNodeModel } from 'src/components/Diagram/Node/commons/DataMapperNode';

// TODO: Fetch this from the operators module
const functionNames = [
    'sum',
    'max',
    'min',
    'average',
    'ceiling',
    'floor',
    'round',
    'toNumber',
    'toBoolean',
    'numberToString',
    'booleanToString',
    'concat',
    'split',
    'toUppercase',
    'toLowercase',
    'stringLength',
    'startsWith',
    'endsWith',
    'substring',
    'trim',
    'replaceFirst',
    'match'
];

const useStyles = () => ({
    textField: css({
        '&::part(control)': {
            fontFamily: 'monospace',
            fontSize: '12px',
        },
    }),
    autoCompleteContainer: css({
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--vscode-input-background)",
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
        // Update the expression text when an input port is selected
        if (inputPort) {
            const updatedText = `${expressionRef.current}${inputPort.fieldFQN}`;
            expressionRef.current = updatedText;
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
    };

    const onChangeAutoComplete = (text: string) => {
        expressionRef.current = text + '(';
        applyChanges();

    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Apply the expression when the Enter key is pressed
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default behavior of the Enter key
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
            const dmNode = focusedPort.getNode() as DataMapperNodeModel;
            const fnBody = dmNode.context.functionST.getBody() as Block;

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

    return (
        <>
            {expressionRef.current !== "" || !focusedPort ? (
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
            ) : (
                // Hack to list down the operator suggestions whenever the expression is empty
                <div className={classes.autoCompleteContainer}>
                    <Icon
                        name={"function-icon"}
                        iconSx={{ fontSize: "15px", color: "var(--vscode-input-placeholderForeground)" }}
                        sx={{ margin: "5px" }}
                    />
                    <AutoComplete
                        sx={{ fontFamily: 'monospace', fontSize: '12px' }}
                        identifier='expression-bar-autocomplete'
                        items={functionNames}
                        allowItemCreate={true}
                        hideDropdown={true}
                        onValueChange={onChangeAutoComplete}
                    />
                </div>
            )}
        </>
    );
}
