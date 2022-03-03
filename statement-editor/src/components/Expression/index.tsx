/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { VariableUserInputs } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { getExpressionTypeComponent, getRemainingContent, isPositionsEquals } from "../../utils";
import DeleteButton from "../Button/DeleteButton";
import { useStatementEditorStyles } from "../styles";

export interface ExpressionComponentProps {
    model: STNode;
    userInputs?: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
    isTypeDescriptor: boolean;
    onSelect?: (event: React.MouseEvent) => void;
    children?: React.ReactElement[];
    classNames?: string;
    isNotDeletable?: boolean;
}

export function ExpressionComponent(props: ExpressionComponentProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler,
            isTypeDescriptor, onSelect, children, classNames, isNotDeletable } = props;

    const component = getExpressionTypeComponent(model, userInputs, isElseIfMember, diagnosticHandler, isTypeDescriptor);

    const [isHovered, setHovered] = React.useState(false);
    const [deletable, setDeletable] = React.useState(false);
    const [defaultDeletable, setDefaultDeletable] = React.useState(false);

    const { modelCtx } = useContext(StatementEditorContext);
    const {
        statementModel: completeModel,
        currentModel: selectedModel,
        updateModel
    } = modelCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const isSelected = selectedModel.model && model && isPositionsEquals(selectedModel.model.position, model.position);

    useEffect(() => {
        let exprDeletable = !isNotDeletable;
        if (model.source && model.source.trim() === 'EXPRESSION') {
            exprDeletable = defaultDeletable;
        }
        setDeletable(exprDeletable);
    }, [model.source]);

    const onMouseOver = (e: React.MouseEvent) => {
        setHovered(true);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseOut = (e: React.MouseEvent) => {
        setHovered(false);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onSelect) {
            onSelect(e);
        }
    }

    const onClickOnClose = () => {
        const {
            code: newCode,
            position: newPosition,
            defaultDeletable: defaultExprDeletable
        } = getRemainingContent(model.position, completeModel);
        setDefaultDeletable(defaultExprDeletable);
        updateModel(newCode, newPosition);
    }

    return (
        <span
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            // tslint:disable-next-line: jsx-no-multiline-js
            className={cn(statementEditorClasses.expressionElement,
                isSelected && statementEditorClasses.expressionElementSelected,
                {
                    "hovered": !isSelected && isHovered,
                },
                classNames
            )}
            onClick={onMouseClick}
        >
            {component}
            {children}
            {isSelected && deletable && (
                <div className={statementEditorClasses.expressionDeleteButton}>
                    <DeleteButton onClick={onClickOnClose} />
                </div>
            )}
        </span>
    );
}
