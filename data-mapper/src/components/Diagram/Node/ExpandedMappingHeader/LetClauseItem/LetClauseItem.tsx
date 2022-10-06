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
import React, { useState } from "react";

import DeleteOutline from "@material-ui/icons/DeleteOutline";
import {
    CaptureBindingPattern,
    LetClause,
    LetVarDecl,
    QueryExpression,
    STNode,
} from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { useStyles } from "../styles";
import { ClauseAddButton } from "../ClauseAddButton";
import clsx from "clsx";
import { getRenameEdits } from "../../../utils/ls-utils";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";

export function LetClauseItem(props: {
    intermediateNode: LetClause;
    onEditClick: () => void;
    onDeleteClick: () => void;
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
    const letVarDeclaration = intermediateNode
        .letVarDeclarations[0] as LetVarDecl;
    const variableName = (
        letVarDeclaration.typedBindingPattern
            .bindingPattern as CaptureBindingPattern
    )?.variableName?.value;
    const [updatedName, setUpdatedName] = useState(variableName);

    const onKeyUp = async (key: string, node?: STNode) => {
        if (key === "Escape") {
            setNameEditable(false);
            setUpdatedName("");
        }
        if (key === "Enter") {
            const workspaceEdit = await getRenameEdits(context.filePath, updatedName, node.position, context.langClientPromise);
            const modifications: STModification[] = []

            Object.values(workspaceEdit?.changes).forEach(edits => {
                edits.forEach(edit => {
                    modifications.push({
                        type: "INSERT",
                        config: { STATEMENT: edit.newText },
                        endColumn: edit.range.end.character,
                        endLine: edit.range.end.line,
                        startColumn: edit.range.start.character,
                        startLine: edit.range.start.line,
                    })
                })
            })

            context.applyModifications(modifications);
        }
    };

    return (
        <>
            <div className={clsx(classes.element, classes.clauseWrap)}>
                <div className={classes.clause}>
                    <span>{intermediateNode.letKeyword.value}</span>
                    <span>{` ${letVarDeclaration.typedBindingPattern.typeDescriptor.source}`}</span>
                    <span className={classes.clauseExpression}>
                        {nameEditable ? (
                            <input
                                spellCheck={false}
                                className={classes.input}
                                autoFocus={true}
                                value={updatedName}
                                onChange={(event) =>
                                    setUpdatedName(event.target.value)
                                }
                                onKeyUp={(event) =>
                                    onKeyUp(
                                        event.key,
                                        (
                                            letVarDeclaration
                                                .typedBindingPattern
                                                .bindingPattern as CaptureBindingPattern
                                        )?.variableName
                                    )
                                }
                                onBlur={() => setNameEditable(false)}
                            />
                        ) : (
                            <span onClick={() => setNameEditable(true)}>
                                {updatedName}
                            </span>
                        )}
                    </span>
                    <span>{` ${letVarDeclaration.equalsToken.value} `}</span>
                    <span
                        className={classes.clauseExpression}
                        onClick={onEditClick}
                    >
                        {letVarDeclaration.expression.source}
                    </span>
                </div>
                <DeleteOutline
                    className={clsx(classes.deleteIcon)}
                    onClick={onDeleteClick}
                />
            </div>
            <div className={classes.addIconWrap}>
                <ClauseAddButton
                    context={context}
                    queryExprNode={queryExprNode}
                    addIndex={itemIndex}
                />
            </div>
        </>
    );
}
