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
import { default as AddIcon } from "@material-ui/icons/Add";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DeleteButton,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
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

import { isPositionsEquals } from "../../../../utils/st-utils";
import { ExpressionInfo } from "../../../DataMapper/DataMapper";
import { getLetExpression, getLetVarDeclarations } from "../../utils/dm-utils";

import { LetVarDeclItem } from "./LetVarDeclItem";
import { useStyles } from "./style";

export interface LetVarDeclModel {
    letVarDecl: LetVarDecl;
    checked: boolean;
}

export interface LocalVarConfigPanelProps {
    langClientPromise: Promise<IBallerinaLangClient>;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    updateFileContent: (content: string, skipForceSave?: boolean) => Promise<boolean>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    importStatements: string[];
    cancelStatementEditor: () => void;
    closeStatementEditor: () => void;
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
    enableStatementEditor: (expressionInfo: ExpressionInfo) => void;
    fnDef: STNode;
}

export function LocalVarConfigPanel(props: LocalVarConfigPanelProps) {
    const {
        handleLocalVarConfigPanel,
        applyModifications,
        fnDef,
        enableStatementEditor
    } = props;

    const intl = useIntl();

    const letExpression = getLetExpression(fnDef);
    const [letVarDecls, setLetVarDecls] = useState<LetVarDeclModel[]>();

    useEffect(() => {
        const letVarDeclarations1 = getLetVarDeclarations(letExpression);
        setLetVarDecls(letVarDeclarations1.map(decl => {
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
        await applyModifications([
            {
                type: "INSERT",
                config: {STATEMENT: ` let var variable1 = EXPRESSION in`},
                ...addPosition,
            },
        ]);
    };

    const handleOnCheck = () => {
        setLetVarDecls([...letVarDecls]);
    };

    const onEditClick = (letVarDecl: LetVarDecl) => {
        enableStatementEditor({
            label: "Let Expression",
            value: letVarDecl.source,
            valuePosition: letVarDecl.position
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
        })
        setLetVarDecls(letVarDeclsClone);

        const allLetVarDecls = letExpression.letVarDeclarations;
        const deleteIndices = allLetVarDecls.map((decl, index) => {
            return selectedLetVarDecls.some(selectedDecl =>
                isPositionsEquals(selectedDecl.position, decl.position)
            ) ? index : -1;
        }).filter(v => v !== -1);

        const modifications: STModification[] = deleteIndices.map(index => {
            const selected = allLetVarDecls[index];
            const previous = allLetVarDecls[index - 1];
            const next = allLetVarDecls[index + 1];
            const isLastElement = index + 1 === allLetVarDecls.length;

            let deletePosition = selected.position;
            if (previous && STKindChecker.isCommaToken(previous) && isLastElement) {
                // if its the last element, need to delete previous comma as well
                const hasAlreadyCapturedComma = deleteIndices.includes(index - 2);
                if (!hasAlreadyCapturedComma) {
                    deletePosition = {
                        ...selected.position,
                        startLine: (previous.position as NodePosition)?.startLine,
                        startColumn: (previous.position as NodePosition)?.startColumn,
                    };
                }
            } else if (next && STKindChecker.isCommaToken(next)) {
                // if its not the last element, need to delete the following comma as well
                deletePosition = {
                    ...selected.position,
                    endLine: (next.position as NodePosition)?.endLine,
                    endColumn: (next.position as NodePosition)?.endColumn,
                };
            }

            return {
                type: "DELETE",
                ...deletePosition
            }
        });

        // const modifications: STModification[] = selectedLetVarDecls.map(decl => {
        //     return {
        //         type: "DELETE",
        //         ...decl.position
        //     }
        // });
        await applyModifications(modifications);
        if (letVarDeclsClone.length === 0) {
            onCancel();
        }
    };

    const getLetExprAddPosition = (): NodePosition => {
        let addPosition: NodePosition;
        if (STKindChecker.isFunctionDefinition(fnDef) && STKindChecker.isExpressionFunctionBody(fnDef.functionBody)) {
            if (STKindChecker.isLetExpression(fnDef.functionBody.expression)) {
                addPosition = {
                    ...fnDef.functionBody.expression,
                    endLine: fnDef.functionBody.expression.position.startLine,
                    endColumn: fnDef.functionBody.expression.position.startColumn
                }
            } else {
                addPosition = {
                    ...fnDef.functionBody.expression.position,
                    endLine: fnDef.functionBody.expression.position.startLine,
                    endColumn: fnDef.functionBody.expression.position.startColumn
                }
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
                            <LetVarDeclItem
                                key={decl.letVarDecl.source}
                                letVarDeclModel={decl}
                                handleOnCheck={handleOnCheck}
                                onEditClick={onEditClick}
                            />
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
                <div className={overlayClasses.recordFormWrapper}>
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
                            className={classNames(overlayClasses.deleteRecord, overlayClasses.marginSpace)}
                            onClick={onDeleteSelected}
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
