/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Icon, TextField } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import { Block, Node, ObjectLiteralExpression, ReturnStatement } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';
import { createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from 'src/components/Diagram/Node/commons/DataMapperNode';

const useStyles = () => ({
    textField: css({
        '&::part(control)': {
            fontFamily: 'monospace',
            fontSize: '12px',
        },
    }),
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
            const updatedText = `${expressionRef.current} + ${inputPort.fieldFQN}`;
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

    const onChange = (text: string) => {
        expressionRef.current = text;
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Apply the expression when the Enter key is pressed
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents the default behavior of the Enter key

            const focusedFieldValue = focusedPort?.typeWithValue.value;

            if (focusedFieldValue) {
                let targetExpr: Node;

                if (Node.isPropertyAssignment(focusedFieldValue)) {
                    targetExpr = focusedFieldValue.getInitializer();
                }
    
                targetExpr.replaceWithText(expressionRef.current );
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
        }
    };

    return (
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
            onTextChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
}
