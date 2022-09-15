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
import React, { useContext } from "react";

import { Checkbox, IconButton, ListItem, ListItemText, ListSubheader, Typography } from "@material-ui/core";
import { AddCircleOutline } from "@material-ui/icons";
import { ParameterInfo, SymbolDocumentation } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import {
    getParamHighlight,
    getParamUpdateModelPosition,
    getParentFunctionModel,
    getUpdatedContentForNewNamedArg,
    getUpdatedContentOnCheck,
    getUpdatedContentOnUncheck,
    isDocumentationSupportedModel,
} from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { useStmtEditorHelperPanelStyles } from "../../styles";
import { IncludedRecord } from "../IncludedRecord";
import { NamedArgIncludedRecord } from "../NamedArgIncludedRecord";
import { RequiredArg } from "../RequiredArg";

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export interface ParameterListProps {
    paramDocumentation : SymbolDocumentation;
}

export function ParameterList(props: ParameterListProps) {
    const { paramDocumentation } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const {
        modelCtx: {
            currentModel : {
                model
            },
            statementModel,
            updateModel,
            restArg
        }
    } = useContext(StatementEditorContext);
    let includedRecordHeader: boolean = false;
    let isNewRecordBtnClicked: boolean = false;
    const [plusButtonClick, setPlusButtonClicked] = React.useState(false);

    const handleCheckboxClick = (param: ParameterInfo) => () => {
        if (!param.modelPosition) {
            if (param.kind === SymbolParameterType.REST) {
                restArg(true);
            }
            if (isDocumentationSupportedModel(model)) {
                updateModel(getUpdatedContentOnCheck(model, param, paramDocumentation.parameters),
                    getParamUpdateModelPosition(model));
            } else {
                const parentModel : STNode = getParentFunctionModel((model.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                    statementModel);
                updateModel(getUpdatedContentOnCheck(parentModel, param, paramDocumentation.parameters),
                    getParamUpdateModelPosition(parentModel));
            }
        } else {
            if (param.kind === SymbolParameterType.REST) {
                restArg(false);
            }
            if (isDocumentationSupportedModel(model)) {
                updateModel(getUpdatedContentOnUncheck(model, param.modelPosition), getParamUpdateModelPosition(model));
            } else {
                const parentModel : STNode = getParentFunctionModel((model.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                    statementModel);
                updateModel(getUpdatedContentOnUncheck(parentModel, param.modelPosition),
                    getParamUpdateModelPosition(parentModel));
            }
        }
    };

    const addIncludedRecordHeader = (param: ParameterInfo, value: number) => {
        return (
            <>
                {!includedRecordHeader && (
                    <ListItem key={value} className={stmtEditorHelperClasses.includedRecordHeaderList}>
                        <ListItemText className={stmtEditorHelperClasses.docListItemText} primary={"Add Named Argument"}/>
                        <IconButton
                            className={stmtEditorHelperClasses.includedRecordPlusBtn}
                            onClick={handlePlusButton()}
                            disabled={false}
                        >
                            <AddCircleOutline/>
                        </IconButton>
                    </ListItem>
                )}
                {includedRecordHeader = true}
            </>
        );
    }

    const handlePlusButton = () => () => {
        setPlusButtonClicked(true);
    }

    const addIncludedRecordToModel = (userInput: string) => {
        const modelToUpdate : STNode = isDocumentationSupportedModel(model) ? model :
            getParentFunctionModel((model.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                statementModel)
        updateModel(getUpdatedContentForNewNamedArg(modelToUpdate, userInput), getParamUpdateModelPosition(modelToUpdate));
        setPlusButtonClicked(false);
    }

    return (
        <>
            {!!paramDocumentation.parameters?.length && (
                <div data-testid="parameter-list">
                    <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                        Configure Parameters
                        <ListItemText
                            secondary={"Select parameters from the list given below"}
                        />
                    </ListSubheader>
                    <div className={stmtEditorHelperClasses.paramList}>
                    {paramDocumentation.parameters?.map((param: ParameterInfo, value: number) => (
                            <>
                                {param.kind === SymbolParameterType.REQUIRED ? (
                                    <RequiredArg param={param} value={value} handleCheckboxClick={handleCheckboxClick}/>
                                ) : (
                                    <>
                                        {param.kind === SymbolParameterType.INCLUDED_RECORD ? (
                                            <>
                                                {addIncludedRecordHeader(param, value)}
                                                {param.fields ? (
                                                    param.fields.map((field, key: number) => (
                                                        <IncludedRecord
                                                            key={key}
                                                            param={field}
                                                            handleCheckboxClick={handleCheckboxClick}
                                                        />
                                                    ))
                                                ) : (
                                                    <IncludedRecord
                                                        param={param}
                                                        handleCheckboxClick={handleCheckboxClick}
                                                    />
                                                )}
                                                {(!param.modelPosition && !isNewRecordBtnClicked) && (
                                                    <>
                                                        <NamedArgIncludedRecord
                                                            isNewRecord={plusButtonClick}
                                                            addIncludedRecordToModel={addIncludedRecordToModel}
                                                        />
                                                        {isNewRecordBtnClicked = true}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {param.kind !== SymbolParameterType.INCLUDED_RECORD && (
                                                    <ListItem
                                                        key={value}
                                                        className={stmtEditorHelperClasses.docListDefault}
                                                        style={getParamHighlight(model, param)}
                                                        data-testid="optional-arg"
                                                    >
                                                        <Checkbox
                                                            classes={{
                                                                root: stmtEditorHelperClasses.parameterCheckbox,
                                                                checked: stmtEditorHelperClasses.checked
                                                            }}
                                                            checked={param.modelPosition !== undefined}
                                                            onClick={handleCheckboxClick(param)}
                                                            data-testid="arg-check"
                                                        />
                                                        <ListItemText
                                                            className={stmtEditorHelperClasses.docListItemText}
                                                            primary={param.name}
                                                        />
                                                        <ListItemText
                                                            className={stmtEditorHelperClasses.paramDataType}
                                                            primary={(
                                                                <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                                                    {param.type.includes("?") ? param.type + " (Optional)" : param.type}
                                                                </Typography>
                                                            )}
                                                        />
                                                        {param.description !== undefined && (
                                                            <ListItemText
                                                                className={stmtEditorHelperClasses.docParamDescriptionText}
                                                                primary={" : " + param.description}
                                                            />
                                                        )}
                                                    </ListItem>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )
                    )}
                    </div>
                </div>
            )}
        </>
    );
}
