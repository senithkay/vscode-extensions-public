/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";

export interface AddButtonProps {
    model: STNode;
    onClick?: (model?: STNode) => void;
    isLastElement?: boolean;
    startColumn?: number;
}

export function NewExprAddButton(props: AddButtonProps) {
    const { model, onClick, isLastElement, startColumn } = props;

    const {
        formCtx: {
            formModelPosition: targetPosition
        }
    } = useContext(StatementEditorContext);

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnAddButton = () => {
        onClick(model);
    };

    return (
        <>
            { isLastElement
                ? (
                    <>
                        <span
                            className={statementEditorClasses.mappingConstructorPlusIconLast}
                            onClick={onClickOnAddButton}
                            style={{marginLeft : (targetPosition.startColumn + startColumn) * 5, position : 'absolute'}}
                        >
                            +
                        </span>
                    </>
                )
                : (
                    <span
                        className={statementEditorClasses.mappingConstructorPlusIcon}
                        onClick={onClickOnAddButton}
                    >
                        +
                    </span>
                )
            }
        </>
    );
}
