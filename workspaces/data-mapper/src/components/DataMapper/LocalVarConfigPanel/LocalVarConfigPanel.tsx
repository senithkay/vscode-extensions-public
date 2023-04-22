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
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { Link } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl/FormControl";
import AddIcon from "@material-ui/icons/Add";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DeleteButton,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FormHeaderSection,
    LinePrimaryButton,
    Panel,
    PrimaryButton,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LetVarDecl, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
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

export interface LetVarDeclModel {
    letVarDecl: LetVarDecl;
    checked: boolean;
    hasDiagnostics: boolean;
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

    const formClasses = useFormStyles();
    const overlayClasses = useStyles();

    const onCancel = () => {
        handleLocalVarConfigPanel(false);
    };

    const onAddNewVar = async (index?: number) => {
        const addModification = getLetExprAddModification(index, fnDef, letExpression, letVarDecls);
        await applyModifications([addModification]);
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
        await applyModifications(modifications);
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
                data-testid="data-mapper-local-variables-form"
                className={formClasses.wizardFormControlExtended}
            >
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.DataMapper.localVarConfigTitle"}
                    defaultMessage={"Local Variables"}
                />
                <div className={overlayClasses.localVarFormWrapper}>
                    {letVarList}
                    <div className={overlayClasses.addNewButtonWrapper}>
                        <LinePrimaryButton
                            text={"Add New"}
                            fullWidth={true}
                            onClick={onAddNewVar}
                            dataTestId="create-new-local-variable-btn"
                            startIcon={<AddIcon />}
                        />
                    </div>
                    <div className={overlayClasses.varMgtToolbar}>
                        <Link
                            key={'select-all'}
                            onClick={onSelectAll}
                            className={overlayClasses.marginSpace}
                            data-testid={'select-all-local-variables'}
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
                            data-testid={'delete-selected-local-variables'}
                        >
                            <DeleteButton /> {deleteSelected}
                        </div>
                    </div>
                </div>
                <div className={overlayClasses.doneButtonWrapper}>
                    <PrimaryButton
                        dataTestId="done-btn"
                        text={"Done"}
                        fullWidth={false}
                        disabled={letVarDecls.some(decl => decl.hasDiagnostics)}
                        onClick={onCancel}
                    />
                </div>
            </FormControl>
        </Panel>
    );
}
