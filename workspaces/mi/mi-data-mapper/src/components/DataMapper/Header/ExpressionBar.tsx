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
import { Block, FunctionDeclarationStructure, Node, ObjectLiteralExpression, ReturnStatement } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';
import { createSourceForUserInput } from '../../../components/Diagram/utils/modification-utils';
import { DataMapperNodeModel } from '../../../components/Diagram/Node/commons/DataMapperNode';
import { getFnDeclStructure, operators } from '../Operators/operators';
import { getDefaultValue } from '../../../components/Diagram/utils/common-utils';
import { enrichExpression, extractExpression } from './utils';

type DescriptionType = {
    description: string;
}

const formatFunctionNames = (operators: Record<string, FunctionDeclarationStructure>): ItemType[] => {
    const descriptionRegex = /^(?:#{4}[^#]*#{4})\s*([^@\n]+)/
    return Object.keys(operators).map((name) => {
        const descriptionMatch = (operators[name].docs![0] as DescriptionType).description.match(descriptionRegex)!;
        return {
            label: name,
            description: descriptionMatch[1],
            args: operators[name].parameters?.map(param => param.name)
        };
    });
}

const functionNames = formatFunctionNames(operators);

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
}

export default function ExpressionBarWrapper(props: ExpressionBarProps) {
    const { applyModifications } = props;
    const classes = useStyles();
    const textFieldRef = useRef<HTMLInputElement>(null);
    const [textFieldValue, setTextFieldValue] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>();

    const { focusedPort, inputPort, resetInputPort } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        inputPort: state.inputPort,
        resetInputPort: state.resetInputPort,
    }));

    useEffect(() => {
        if (inputPort) {
            // Keep the text field focused when an input port is selected
            if (textFieldRef.current) {
                const inputElement = textFieldRef.current.shadowRoot.querySelector('input');
                if (focusedPort) {
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
            setPlaceholder('Prefix "=" to use functions.');
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
            setPlaceholder('Click on an output port to use the Expression Editor.');
            textFieldRef.current.blur();
        }
    
        setTextFieldValue(enrichExpression(value));
        return disabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textFieldRef.current, focusedPort]);

    const onChangeTextField = async (text: string) => {
        setTextFieldValue(text);
    };

    const handleExpressionSave = async (value: string) => {
        setTextFieldValue(value);
        await applyChanges(extractExpression(value));
    }

    const onItemSelect = async (item: ItemType, text: string) => {
        const focusedNode = focusedPort.getNode() as DataMapperNodeModel;
        const fnST = focusedNode.context.functionST;
        const sourceFile = fnST.getSourceFile();
    
        const isFunctionPresent = sourceFile.getFunctions().find(fn => fn.getName() === item.label);
        if (!isFunctionPresent) {
            sourceFile.addFunction(getFnDeclStructure(item.label));
        }
        
        await applyChanges(extractExpression(text));
    }

    const applyChanges = async (value: string) => {
        const focusedFieldValue = focusedPort?.typeWithValue.value;

        if (focusedFieldValue) {
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

    return (
        <div className={classes.exprBarContainer}>
            <ExpressionBar
                id='expression-bar'
                ref={textFieldRef}
                disabled={disabled}
                items={functionNames}
                value={textFieldValue}
                placeholder={placeholder}
                onChange={onChangeTextField}
                onItemSelect={onItemSelect}
                onSave={handleExpressionSave}
                sx={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontSize: '12px' }}
            />
        </div>
    );
}

