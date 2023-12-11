/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useEffect, useMemo, useState } from "react";
// import { useIntl } from "react-intl";

import { Link } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl/FormControl";
import {
    DeleteButton,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
// import {
//     FormHeaderSection,
//     LinePrimaryButton,
//     Panel,
//     PrimaryButton,
//     useStyles as useFormStyles
// } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LetVarDecl, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Button, SidePanel } from "@wso2-enterprise/ui-toolkit";
import classNames from "classnames";

import { ExpressionInfo } from "../DataMapper";

import { LetVarDeclItem } from "./LetVarDeclItem";
import {
    getLetExprAddModification,
    getLetExprDeleteModifications,
    getLetExpression,
    getLetExpressions,
    getLetVarDeclarations
} from "./local-var-mgt-utils";
import { NewLetVarDeclPlusButton } from "./NewLetVarDeclPlusButton";
import { useStyles } from "./style";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { applyModifications } from "../../Diagram/utils/ls-utils";

export interface LetVarDeclModel {
    letVarDecl: LetVarDecl;
    checked: boolean;
    hasDiagnostics: boolean;
}

export interface LocalVarConfigPanelProps {
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
    enableStatementEditor: (expressionInfo: ExpressionInfo) => void;
    fnDef: STNode;
    filePath: string;
}

export function LocalVarConfigPanel(props: LocalVarConfigPanelProps) {
    const {
        handleLocalVarConfigPanel,
        fnDef,
        enableStatementEditor,
        filePath
    } = props;

    // const intl = useIntl();

    const { ballerinaRpcClient } = useVisualizerContext();
    const letExpression = getLetExpression(fnDef);
    const [letVarDecls, setLetVarDecls] = useState<LetVarDeclModel[]>([]);
    const hasSelectedLetVarDecl = letVarDecls.some(decl => decl.checked);

    useEffect(() => {
        const letVarDeclarations = letExpression
            ? getLetVarDeclarations(letExpression).filter(decl => STKindChecker.isLetVarDecl(decl)) as LetVarDecl[]
            : [];
        setLetVarDecls(letVarDeclarations.map(decl => {
            return {
                letVarDecl: decl,
                checked: false,
                hasDiagnostics: !!decl?.typeData?.diagnostics?.length
            };
        }))
    }, [fnDef]);

    // const formClasses = useFormStyles();
    const overlayClasses = useStyles();

    const onCancel = () => {
        handleLocalVarConfigPanel(false);
    };

    const onAddNewVar = async (index?: number) => {
        const addModification = getLetExprAddModification(index, fnDef, letExpression, letVarDecls);
        await applyModifications(filePath, [addModification], ballerinaRpcClient);
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
        const letExpressions = getLetExpressions(letExpression);
        const modifications: STModification[] = [];
        letExpressions.forEach(expr => {
            modifications.push(...getLetExprDeleteModifications(expr, letVarDecls));
        });
        const updatedVarList = letVarDecls.filter(decl => !decl.checked);
        setLetVarDecls(updatedVarList);
        await applyModifications(filePath, modifications, ballerinaRpcClient);
    };

    // const overviewSelectAll = intl.formatMessage({
    //     id: "lowcode.develop.configForms.recordEditor.overview.overviewSelectAll",
    //     defaultMessage: "Select All"
    // });

    // const deleteSelected = intl.formatMessage({
    //     id: "lowcode.develop.configForms.recordEditor.overview.deleteSelected",
    //     defaultMessage: "Delete Selected"
    // });

    const letVarList: ReactNode = useMemo(() => {
        return (
            <>
                {
                    letVarDecls && letVarDecls.map((decl, index) => {
                        return (
                            <>
                                <NewLetVarDeclPlusButton index={index} onAddNewVar={onAddNewVar}/>
                                <LetVarDeclItem
                                    index={index}
                                    key={decl.letVarDecl.source}
                                    letVarDeclModel={decl}
                                    handleOnCheck={handleOnCheck}
                                    onEditClick={onEditClick}
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
        <SidePanel>
            <FormControl
                variant="outlined"
                data-testid="data-mapper-local-variables-form"
                // className={formClasses.wizardFormControlExtended}
            >
                {/* <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.DataMapper.localVarConfigTitle"}
                    defaultMessage={"Local Variables"}
                /> */}
                <div className={overlayClasses.localVarFormWrapper}>
                    {letVarList}
                    <div className={overlayClasses.addNewButtonWrapper}>
                        <Button
                            tooltip={"Add New"}
                            onClick={onAddNewVar}
                        />
                        {/* <LinePrimaryButton
                            text={"Add New"}
                            fullWidth={true}
                            onClick={onAddNewVar}
                            dataTestId="create-new-local-variable-btn"
                            startIcon={<AddIcon />}
                        /> */}
                    </div>
                    <div className={overlayClasses.varMgtToolbar}>
                        <Link
                            key={'select-all'}
                            onClick={onSelectAll}
                            className={overlayClasses.marginSpace}
                            data-testid={'select-all-local-variables'}
                        >
                            {"Select All"}
                        </Link>

                        <div
                            className={classNames(
                                overlayClasses.deleteLetVarDecl,
                                overlayClasses.marginSpace,
                                hasSelectedLetVarDecl && overlayClasses.deleteLetVarDeclEnabled
                            )}
                            onClick={hasSelectedLetVarDecl ? onDeleteSelected : undefined}
                            data-testid={'delete-selected-local-variables'}
                        >
                            <DeleteButton /> {"Delete"}
                        </div>
                    </div>
                </div>
                <div className={overlayClasses.doneButtonWrapper}>
                    <Button
                        tooltip={"Done"}
                        onClick={onCancel}
                    />
                    {/* <PrimaryButton
                        dataTestId="done-btn"
                        text={"Done"}
                        fullWidth={false}
                        disabled={letVarDecls.some(decl => decl.hasDiagnostics)}
                        onClick={onCancel}
                    /> */}
                </div>
            </FormControl>
        </SidePanel>
    );
}
