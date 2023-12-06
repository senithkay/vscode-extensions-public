/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { ReactNode, useMemo, useState } from "react";

// import { CheckBoxGroup } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
// tslint:disable-next-line:no-submodule-imports
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { IBallerinaLangClient, STModification } from "@wso2-enterprise/ballerina-languageclient";
import { CaptureBindingPattern, LetVarDecl, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { getRenameEdits } from "../../Diagram/utils/ls-utils";

import { LetVarDeclModel } from "./LocalVarConfigPanel";
import { useStyles } from "./style";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";

interface LetVarDeclItemProps {
    index: number;
    letVarDeclModel: LetVarDeclModel;
    handleOnCheck: () => void;
    onEditClick: (letVarDecl: LetVarDecl) => void;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    filePath: string;
}

export function LetVarDeclItem(props: LetVarDeclItemProps) {
    const {index, letVarDeclModel, handleOnCheck, onEditClick, applyModifications, filePath} = props;
    const overlayClasses = useStyles();
    const { ballerinaRpcClient } = useVisualizerContext();
    const varNameNode = (letVarDeclModel.letVarDecl.typedBindingPattern.bindingPattern as CaptureBindingPattern)
        .variableName;
    const exprSource = letVarDeclModel.letVarDecl.expression.source.trim();
    const isExprPlaceholder = exprSource === "EXPRESSION";

    const [type, varName] = useMemo(() => {
        const pattern = letVarDeclModel.letVarDecl.typedBindingPattern;
        if (STKindChecker.isCaptureBindingPattern(pattern.bindingPattern)) {
            return [pattern.typeDescriptor.source.trim(), pattern.bindingPattern.variableName.value];
        }
        return [undefined, undefined];
    }, [letVarDeclModel]);

    const [updatedName, setUpdatedName] = useState(varName);
    const [nameEditable, setNameEditable] = useState(false);
    const [isLoading, setLoading] = useState(false);

    // const handleCheckboxClick = (list: string[]) => {
    //     letVarDeclModel.checked = list.length > 0;
    //     handleOnCheck();
    // };


    const handleEdit = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        event.preventDefault();
        onEditClick(letVarDeclModel.letVarDecl);
    };

    const onKeyUp = async (key: string, node?: STNode) => {
        if (key === "Escape") {
            setNameEditable(false);
            setUpdatedName("");
        }
        if (key === "Enter") {
            setLoading(true);
            try {
                const workspaceEdit = await getRenameEdits(filePath, updatedName, node.position as NodePosition, ballerinaRpcClient);
                const modifications: STModification[] = [];

                Object.values(workspaceEdit?.changes).forEach((edits) => {
                    edits.forEach((edit) => {
                        modifications.push({
                            type: "INSERT",
                            config: {STATEMENT: edit.newText},
                            endColumn: edit.range.end.character,
                            endLine: edit.range.end.line,
                            startColumn: edit.range.start.character,
                            startLine: edit.range.start.line,
                        });
                    });
                });

                modifications.sort((a, b) => a.startLine - b.startLine);
                await applyModifications(modifications);
            } finally {
                setLoading(false);
            }
        }
    };

    const expression: ReactNode = (
        <>
            <div className={overlayClasses.declWrap}>
                <span className={overlayClasses.declExpression}>
                    {nameEditable ? (
                        <input
                            spellCheck={false}
                            className={overlayClasses.input}
                            autoFocus={true}
                            value={updatedName}
                            onChange={(event) => setUpdatedName(event.target.value)}
                            onKeyUp={(event) =>
                                onKeyUp(
                                    event.key,
                                    varNameNode
                                )
                            }
                            onBlur={() => {
                                setNameEditable(false);
                                setUpdatedName(varName);
                            }}
                            data-testid={`local-variable-name-input-${index}`}
                        />
                    ) : (
                        <span
                            onClick={() => setNameEditable(true)}
                            data-testid={`local-variable-name-${index}`}
                        >
                            {updatedName}
                        </span>
                    )}
                </span>
                <span>{letVarDeclModel.letVarDecl.equalsToken.value}</span>
                <span>
                    <span
                        className={classNames(
                            overlayClasses.declExpression,
                            isExprPlaceholder && overlayClasses.exprPlaceholder
                        )}
                        onClick={(event) => handleEdit(event)}
                        data-testid={`local-variable-value-${index}`}
                    >
                        {isExprPlaceholder ? `<add-expression>` : exprSource}
                    </span>
                </span>
            </div>
        </>
    );

    return (
        <div className={overlayClasses.headerWrapper} data-testid={`${varName}-item`}>
            <div className={overlayClasses.contentSection}>
                {/* <CheckBoxGroup
                    values={[`${type} ${varName}`]}
                    defaultValues={letVarDeclModel.checked ? [`${type} ${varName}`] : []}
                    onChange={handleCheckboxClick}
                    checkBoxLabel={expression}
                    checkBoxTestId={`select-local-variable-${index}`}
                /> */}
                <VSCodeCheckbox checked={letVarDeclModel.checked} onChange={handleOnCheck} id="select-local-var">
                    {`${type} ${varName}`}
                </VSCodeCheckbox>
            </div>
        </div>
    );
}
