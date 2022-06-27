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
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NamedArg, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import {
    getCurrentModelParams, getUpdatedContentForNewNamedArg,
    getUpdatedContentOnCheck, getUpdatedContentOnUncheck,
    isAllowedIncludedArgsAdded
} from "../../../utils";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";
import { NamedArgIncludedRecord } from "../NamedArgIncludedRecord";
import { RequiredArg } from "../RequiredArg";

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export interface ParameterListProps {
    checkedList: any[]
    setCheckedList: (list: any[]) => void
    paramsInModel?: STNode[]
}

export function ParameterList(props: ParameterListProps) {
    const { checkedList, setCheckedList } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const {
        modelCtx: {
            currentModel,
            updateModel,
            restArg
        },
        documentation : {
            documentation : {
                parameters
            }
        }
    } = useContext(StatementEditorContext);
    let includedRecordHeader: boolean = false;
    let isNewRecordBtnClicked: boolean = false;
    const [plusButtonClick, setPlusButtonClicked] = React.useState(false);

    const handleCheckboxClick = (value: number, param?: ParameterInfo) => () => {
        const currentIndex = checkedList.indexOf(value);
        const newChecked = [...checkedList];

        if (currentIndex === -1) {
            newChecked.push(value);

            if (STKindChecker.isFunctionCall(currentModel.model)) {
                if (param.kind === SymbolParameterType.REST) {
                    restArg(true);
                }
                updateModel(getUpdatedContentOnCheck(currentModel.model, param, parameters), currentModel.model.position);
            }
        } else {
            newChecked.splice(currentIndex, 1);
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                updateModel(getUpdatedContentOnUncheck(currentModel.model, currentIndex), currentModel.model.position);
            }
        }

        setCheckedList(newChecked);
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
                            disabled={isAllowedIncludedArgsAdded(parameters, checkedList)}
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

    const addIncludedRecords = (param: ParameterInfo, value: number) => {

        let argList: STNode[] = [];
        if (currentModel.model) {
            argList = getCurrentModelParams(currentModel.model);
        }
        const argument = checkedList.indexOf(value);
        return (
            <>
                {argument !== -1 && (
                    <ListItem className={stmtEditorHelperClasses.docListDefault}>
                        <Checkbox
                            classes={{
                                root: stmtEditorHelperClasses.parameterCheckbox,
                                checked: stmtEditorHelperClasses.checked
                            }}
                            style={{ flex: 'inherit' }}
                            checked={argument !== -1}
                            onClick={handleCheckboxClick(value, param)}
                        />
                        <ListItemText
                            className={stmtEditorHelperClasses.docListItemText}
                            primary={(argList[argument] && STKindChecker.isNamedArg(argList[argument])) ?
                                (argList[argument] as NamedArg).argumentName.source : param.name}
                        />
                    </ListItem>
                )}
            </>
        );
    }

    const addIncludedRecordToModel = (userInput: string, value: number) => {
        const newChecked = [...checkedList];
        const currentIndex = checkedList.indexOf(value);
        if (currentIndex === -1) {
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                newChecked.push(value);
                updateModel(getUpdatedContentForNewNamedArg(currentModel.model, userInput), currentModel.model.position);
                setCheckedList(newChecked);
                setPlusButtonClicked(false);
            }
        }
    }

    return (
        <>
            {!!parameters?.length && (
                <>
                    <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                        Configure Parameters
                        <ListItemText
                            secondary={"Select parameters from the list given below"}
                        />
                    </ListSubheader>
                    {parameters?.map((param: ParameterInfo, value: number) => (
                            <>
                                {param.kind === SymbolParameterType.REQUIRED ? (
                                    <RequiredArg param={param} value={value} checkedList={checkedList}/>
                                ) : (
                                    <>
                                        {param.kind === SymbolParameterType.INCLUDED_RECORD ? (
                                            <>
                                                {addIncludedRecordHeader(param, value)}
                                                {addIncludedRecords(param, value)}
                                                {(checkedList.indexOf(value) === -1 && !isNewRecordBtnClicked) && (
                                                    <>
                                                        <NamedArgIncludedRecord
                                                            isNewRecord={plusButtonClick}
                                                            value={value}
                                                            addIncludedRecordToModel={addIncludedRecordToModel}
                                                        />
                                                        {isNewRecordBtnClicked = true}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {param.kind !== SymbolParameterType.INCLUDED_RECORD && (
                                                    <ListItem key={value} className={stmtEditorHelperClasses.docListDefault}>
                                                        <Checkbox
                                                            classes={{
                                                                root: stmtEditorHelperClasses.parameterCheckbox,
                                                                checked: stmtEditorHelperClasses.checked
                                                            }}
                                                            checked={checkedList.indexOf(value) !== -1}
                                                            onClick={handleCheckboxClick(value, param)}
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
                </>
            )}
        </>
    );
}
