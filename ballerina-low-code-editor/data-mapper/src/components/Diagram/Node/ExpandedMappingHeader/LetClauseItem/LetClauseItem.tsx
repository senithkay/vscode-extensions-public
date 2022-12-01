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
// tslint:disable: jsx-no-lambda  jsx-no-multiline-js
import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import {
    CaptureBindingPattern,
    LetClause,
    LetVarDecl,
    NodePosition,
    QueryExpression,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { getRenameEdits } from "../../../utils/ls-utils";
import { ClauseAddButton } from "../ClauseAddButton";
import { useStyles } from "../styles";

export function LetClauseItem(props: {
    intermediateNode: LetClause;
    onEditClick: () => void;
    onDeleteClick: () => Promise<void>;
    context: IDataMapperContext;
    queryExprNode: QueryExpression;
    itemIndex: number;
}) {
    const {
        onEditClick,
        onDeleteClick,
        intermediateNode,
        context,
        queryExprNode,
        itemIndex,
    } = props;
    const classes = useStyles();
    const [nameEditable, setNameEditable] = useState(false);
    const letVarDeclaration = intermediateNode.letVarDeclarations[0] as LetVarDecl;
    const variableName = (
        letVarDeclaration.typedBindingPattern.bindingPattern as CaptureBindingPattern
    )?.variableName?.value;
    const [updatedName, setUpdatedName] = useState(variableName);
    const [isLoading, setLoading] = useState(false);

    const onDelete = async () => {
        setLoading(true);
        try {
            await onDeleteClick();
        } finally {
            setLoading(false);
        }
    };

    const onKeyUp = async (key: string, node?: STNode) => {
        if (key === "Escape") {
            setNameEditable(false);
            setUpdatedName("");
        }
        if (key === "Enter") {
            setLoading(true);
            try {
                const workspaceEdit = await getRenameEdits(
                    context.filePath,
                    updatedName,
                    node.position as NodePosition,
                    context.langClientPromise
                );
                const modifications: STModification[] = [];

                Object.values(workspaceEdit?.changes).forEach((edits) => {
                    edits.forEach((edit) => {
                        modifications.push({
                            type: "INSERT",
                            config: { STATEMENT: edit.newText },
                            endColumn: edit.range.end.character,
                            endLine: edit.range.end.line,
                            startColumn: edit.range.start.character,
                            startLine: edit.range.start.line,
                        });
                    });
                });

                modifications.sort((a, b) => a.startLine - b.startLine)
                await context.applyModifications(modifications);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <div className={classes.clauseItem}>
                <div className={classes.clauseKeyWrap}>{intermediateNode.letKeyword.value}</div>

                <div className={classes.clauseWrap}>
                    <span className={classes.clauseExpression}>
                        {nameEditable ? (
                            <input
                                spellCheck={false}
                                className={classes.input}
                                autoFocus={true}
                                value={updatedName}
                                onChange={(event) => setUpdatedName(event.target.value)}
                                onKeyUp={(event) =>
                                    onKeyUp(
                                        event.key,
                                        (
                                            letVarDeclaration.typedBindingPattern
                                                .bindingPattern as CaptureBindingPattern
                                        )?.variableName
                                    )
                                }
                                onBlur={() => {
                                    setNameEditable(false);
                                    setUpdatedName(variableName);
                                }}
                                data-testid={`let-clause-name-input-${itemIndex}`}
                            />
                        ) : (
                            <span onClick={() => setNameEditable(true)} data-testid={`let-clause-name-${itemIndex}`}>{updatedName}</span>
                        )}
                    </span>
                    <span>{letVarDeclaration.equalsToken.value}</span>
                    <span className={classes.clauseExpression} onClick={onEditClick} data-testid={`let-clause-expression-${itemIndex}`}>
                        {letVarDeclaration.expression.source}
                    </span>
                </div>

                {isLoading ? (
                    <CircularProgress size={18} />
                ) : (
                    <DeleteOutline className={classes.deleteIcon} onClick={onDelete} data-testid={`let-clause-delete-${itemIndex}`}/>
                )}
            </div>

            <ClauseAddButton context={context} queryExprNode={queryExprNode} addIndex={itemIndex} />
        </>
    );
}
