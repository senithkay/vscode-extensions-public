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
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import { useIntl } from "react-intl";

import { IconButton, Link } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl/FormControl";
import AddIcon from "@material-ui/icons/Add";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DeleteButton,
    STModification,
    UndoIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FormHeaderSection,
    LinePrimaryButton,
    Panel,
    PrimaryButton,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LetVarDecl, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { genLetExpressionVariableName, isPositionsEquals } from "../../../../utils/st-utils";
import { ExpressionInfo } from "../../../DataMapper/DataMapper";
import { getLetExpression, getLetVarDeclarations } from "../../utils/dm-utils";

import { LetVarDeclItem } from "./LetVarDeclItem";
import { NewLetVarDeclPlusButton } from "./NewLetVarDeclPlusButton";
import { useStyles } from "./style";

export interface LetVarDeclModel {
    letVarDecl: LetVarDecl;
    checked: boolean;
}

export interface LocalVarConfigPanelProps {
    applyModifications: (modifications: STModification[]) => Promise<void>;
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
    enableStatementEditor: (expressionInfo: ExpressionInfo) => void;
    fnDef: STNode;
    langClientPromise: Promise<IBallerinaLangClient>;
    filePath: string;
}

export function LocalVarConfigPanel(props: LocalVarConfigPanelProps) {
    const {
        handleLocalVarConfigPanel,
        applyModifications,
        fnDef,
        enableStatementEditor,
        langClientPromise,
        filePath
    } = props;

    const intl = useIntl();

    const letExpression = getLetExpression(fnDef);
    const [letVarDecls, setLetVarDecls] = useState<LetVarDeclModel[]>([]);
    const hasSelectedLetVarDecl = letVarDecls.some(decl => decl.checked);

    useEffect(() => {
        const letVarDeclarations = letExpression ? getLetVarDeclarations(letExpression) : [];
        setLetVarDecls(letVarDeclarations.map(decl => {
            return {
                letVarDecl: decl,
                checked: false
            };
        }))
    }, [fnDef]);

    const formClasses = useFormStyles();
    const overlayClasses = useStyles();

    const onCancel = () => {
        handleLocalVarConfigPanel(false);
    };

    const onAddNewVar = async () => {
        const addPosition = getLetExprAddPosition();
        const varName = genLetExpressionVariableName([letExpression]);
        const expr = letExpression ? `, var ${varName} = EXPRESSION` : `let var ${varName} = EXPRESSION in `;
        await applyModifications([
            {
                type: "INSERT",
                config: {STATEMENT: expr},
                ...addPosition,
            },
        ]);
    };

    const handleOnCheck = () => {
        setLetVarDecls([...letVarDecls]);
    };

    const onEditClick = (letVarDecl: LetVarDecl) => {
        enableStatementEditor({
            label: "Let Variable Expression",
            value: letVarDecl.expression.source,
            valuePosition: letVarDecl.expression.position
        });
    };

    const onSelectAll = () => {
        let checkAll = true;
        if (letVarDecls.every(value => value.checked)) {
            checkAll = false;
        }
        letVarDecls.forEach(decl => decl.checked = checkAll);
        setLetVarDecls([...letVarDecls]);
    }

    const onDeleteSelected = async () => {
        const selectedLetVarDecls: LetVarDecl[] = [];
        const letVarDeclsClone = [...letVarDecls];
        letVarDecls.forEach(decl => {
            if (decl.checked) {
                selectedLetVarDecls.push(decl.letVarDecl);
                const index = letVarDeclsClone
                    .findIndex(item => isPositionsEquals(item.letVarDecl.position, decl.letVarDecl.position));
                if (index !== -1) {
                    letVarDeclsClone.splice(index, 1);
                }
            }
        });

        const allLetVarDecls = letExpression.letVarDeclarations;
        const deleteIndices = allLetVarDecls.map((decl, index) => {
            return selectedLetVarDecls.some(selectedDecl =>
                isPositionsEquals(selectedDecl.position, decl.position)
            ) ? index : -1;
        }).filter(v => v !== -1);

        let modifications: STModification[] = [];
        if (selectedLetVarDecls.length === letVarDecls.length) {
            // Should delete the 'let' and 'in' keywords too
            modifications.push({
                type: "DELETE",
                startLine: letExpression.letKeyword.position.startLine,
                startColumn: letExpression.letKeyword.position.startColumn,
                endLine: letExpression.inKeyword.position.endLine,
                endColumn: letExpression.inKeyword.position.endColumn
            });
        } else {
            modifications = deleteIndices.reverse().map(index => {
                const previous = allLetVarDecls[index - 1];
                const next = allLetVarDecls[index + 1];
                const isLastElement = index + 1 === allLetVarDecls.length;
                const selected = allLetVarDecls[index];

                let deletePosition = selected.position;

                if (previous && STKindChecker.isCommaToken(previous) && isLastElement) {
                    // if its the last element, need to delete previous comma as well
                    deletePosition = {
                        ...selected.position,
                        startLine: (previous.position as NodePosition)?.startLine,
                        startColumn: (previous.position as NodePosition)?.startColumn,
                    };
                    allLetVarDecls.splice(index - 1);
                } else if (next && STKindChecker.isCommaToken(next)) {
                    // if its not the last element, need to delete the following comma as well
                    deletePosition = {
                        ...selected.position,
                        endLine: (next.position as NodePosition)?.endLine,
                        endColumn: (next.position as NodePosition)?.endColumn,
                    };
                    allLetVarDecls.splice(index, 2);
                } else {
                    allLetVarDecls.splice(index, 1);
                }
                return {
                    type: "DELETE",
                    ...deletePosition
                }
            });
        }

        setLetVarDecls(letVarDeclsClone);
        await applyModifications(modifications.reverse());
        if (letVarDeclsClone.length === 0) {
            onCancel();
        }
    };

    const getLetExprAddPosition = (): NodePosition => {
        const fnBody = STKindChecker.isFunctionDefinition(fnDef)
            && STKindChecker.isExpressionFunctionBody(fnDef.functionBody)
            && fnDef.functionBody;
        let addPosition: NodePosition;

        if (!letExpression) {
            addPosition = {
                ...fnBody.expression.position,
                endLine: fnBody.expression.position.startLine,
                endColumn: fnBody.expression.position.startColumn
            }
        } else {
            const lastLetDeclPosition = letVarDecls[letVarDecls.length - 1].letVarDecl.position;
            addPosition = {
                ...lastLetDeclPosition,
                startLine: lastLetDeclPosition.endLine,
                startColumn: lastLetDeclPosition.endColumn
            }
        }
        return addPosition;
    };

    const overviewSelectAll = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.overviewSelectAll",
        defaultMessage: "Select All"
    });

    const deleteSelected = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.overview.deleteSelected",
        defaultMessage: "Delete Selected"
    });

    const letVarList: ReactNode = useMemo(() => {
        return (
            <>
                {
                    letVarDecls && letVarDecls.map(decl => {
                        return (
                            <>
                                <NewLetVarDeclPlusButton onAddNewVar={onAddNewVar}/>
                                <LetVarDeclItem
                                    key={decl.letVarDecl.source}
                                    letVarDeclModel={decl}
                                    handleOnCheck={handleOnCheck}
                                    onEditClick={onEditClick}
                                    applyModifications={applyModifications}
                                    langClientPromise={langClientPromise}
                                    filePath={filePath}
                                />
                            </>
                        );
                    })
                }
            </>
        );
    }, [letVarDecls]);

    return (
        <Panel onClose={onCancel}>
            <FormControl
                variant="outlined"
                data-testid="data-mapper-form"
                className={formClasses.wizardFormControlExtended}
            >
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.DataMapper.localVarConfigTitle"}
                    defaultMessage={"Data Mapper"}
                />
                <div className={overlayClasses.localVarFormWrapper}>
                    {letVarList}
                    <div className={overlayClasses.createButtonWrapper}>
                        <LinePrimaryButton
                            text={"Add New"}
                            fullWidth={true}
                            onClick={onAddNewVar}
                            dataTestId="create-new-btn"
                            startIcon={<AddIcon />}
                        />
                    </div>
                    <div className={overlayClasses.recordOptions}>
                        <Link
                            key={'select-all'}
                            onClick={onSelectAll}
                            className={overlayClasses.marginSpace}
                        >
                            {overviewSelectAll}
                        </Link>

                        <div
                            className={classNames(
                                overlayClasses.deleteLetVarDecl,
                                overlayClasses.marginSpace,
                                hasSelectedLetVarDecl && overlayClasses.deleteLetVarDeclEnabled
                            )}
                            onClick={hasSelectedLetVarDecl ? onDeleteSelected : undefined}
                        >
                            <DeleteButton /> {deleteSelected}
                        </div>
                        <IconButton
                            onClick={undefined}
                            className={classNames(overlayClasses.undoButton, overlayClasses.marginSpace)}
                            data-testid="overview-undo"
                        >
                            <UndoIcon />
                        </IconButton>

                    </div>
                </div>
                <div className={overlayClasses.doneButtonWrapper}>
                    <PrimaryButton
                        dataTestId="done-btn"
                        text={"Done"}
                        fullWidth={false}
                        onClick={onCancel}
                    />
                </div>
            </FormControl>
        </Panel>
    );
}
