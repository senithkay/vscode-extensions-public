/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext, useEffect, useState } from "react";

import {
    IconButton,
    Typography
} from "@material-ui/core";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import {
    CALL_CONFIG_TYPE,
    CONFIGURABLE_VALUE_REQUIRED_TOKEN,
    DEFAULT_WHERE_INTERMEDIATE_CLAUSE,
    QUERY_INTERMEDIATE_CLAUSES
} from "../../../constants";
import { Suggestion } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import {
    displayCheckBoxAsExpression,
    getFilteredExpressions,
    getRecordFieldSource,
    getRecordSwitchedSource,
    getRecordUpdatePosition, isClosedRecord, isQuestionMarkFromRecordField, isRecordFieldName
} from "../../../utils";
import {
    Expression,
    ExpressionGroup,
    expressions,
    EXPR_PLACEHOLDER,
    optionalRecordField,
    recordFiledOptions,
    operators,
    SELECTED_EXPRESSION,
    switchOpenClose
} from "../../../utils/expressions";
import { useStatementEditorStyles, useStatementEditorToolbarStyles, useStmtEditorHelperPanelStyles } from "../../styles";

export function ToolbarOperators() {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const statementEditorToolbarClasses = useStatementEditorToolbarStyles();
    const inputEditorCtx = useContext(InputEditorContext);
    const [keyword, setKeyword] = useState('');
    const [filteredExpressions, setFilteredExpressions] = useState(expressions);
    const [selectedSuggestions, setSelectedSuggestion] = React.useState<Suggestion>(null);

    const {
        modelCtx: {
            currentModel,
            updateModel,
        },
        config
    } = useContext(StatementEditorContext);

    const onClickExpressionSuggestion = (expression: Expression, clickedSuggestion: Suggestion) => {
        setKeyword('');
        if (clickedSuggestion) {
            setSelectedSuggestion({
                selectedGroup: clickedSuggestion.selectedGroup,
                selectedListItem: clickedSuggestion.selectedListItem
            });
            updateModelWithSuggestion(expression);
        }
    }

    const updateModelWithSuggestion = (expression: Expression) => {
        const currentModelSource = STKindChecker.isOrderKey(currentModel.model) ? currentModel.model.expression.source :
            (currentModel.model.source ? currentModel.model.source.trim() : currentModel.model.value.trim());
        let text;
        let updatePosition = currentModel.model.position;
        if (STKindChecker.isRecordField(currentModel.model)) {
            text = expression.template.replace(SELECTED_EXPRESSION, getRecordFieldSource(currentModel.model));
        } else if (STKindChecker.isRecordTypeDesc(currentModel.model) && expression.name ===
            "Switches Open/Close record to Close/Open") {
            text = expression.template.replace(SELECTED_EXPRESSION, getRecordSwitchedSource(currentModel.model));
            updatePosition = getRecordUpdatePosition(currentModel.model)
        } else {
            text = currentModelSource !== CONFIGURABLE_VALUE_REQUIRED_TOKEN
                ? expression.template.replace(SELECTED_EXPRESSION, currentModelSource)
                : expression.template.replace(SELECTED_EXPRESSION, EXPR_PLACEHOLDER);
        }
        updateModel(text, updatePosition)
        inputEditorCtx.onInputChange('');
        inputEditorCtx.onSuggestionSelection(text);
    }

    useEffect(() => {
        if (currentModel.model) {
            let filteredGroups: ExpressionGroup[] = getFilteredExpressions(expressions, currentModel.model);
            filteredGroups=[operators]

            // filter context based toolbar operators on statement
            // switch (config.type) {
            //     case "Variable" || "AssignmentStatement":
            //         break;
            //     case "If":
            //         break;
            //     case "While":
            //         break;
            //     case "ForEach":
            //         break;
            //     case "Call" || "Log":
            //         break;
            //     case "Return":
            //         break;
            //     case "Configurable":
            //         break;
            //     case "ConstDeclaration":
            //         break;
            //     default:
            //         break;
            // }

            // if (currentModel.model.source?.trim() === DEFAULT_WHERE_INTERMEDIATE_CLAUSE) {
            //     filteredGroups = expressions.filter(
            //         (exprGroup) => exprGroup.name === QUERY_INTERMEDIATE_CLAUSES);
            // } else if ((config.type === CALL_CONFIG_TYPE) && STKindChecker.isFunctionCall(currentModel.model)) {
            //     filteredGroups = []
            // } else if (isRecordFieldName(currentModel.model)) {
            //     filteredGroups = [optionalRecordField]
            // } else if (isQuestionMarkFromRecordField(currentModel.model)) {
            //     filteredGroups = []
            // } else if (STKindChecker.isRecordField(currentModel.model)) {
            //     filteredGroups = [recordFiledOptions]
            // } else if (STKindChecker.isRecordTypeDesc(currentModel.model)) {
            //     filteredGroups = [switchOpenClose].concat(filteredGroups);
            // }
            setFilteredExpressions(filteredGroups);
        }
    }, [currentModel.model]);

    return (
        <>
            <div data-testid="expression-list">
                {!!filteredExpressions.length && (
                    <>
                        {filteredExpressions.map((group, groupIndex) => (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'row', padding: 0 }}>
                                    {
                                        group.expressions.map((expression, index) => (
                                            // <>
                                            <StatementEditorHint content={expression.name}>
                                                <IconButton
                                                    onClick={() => onClickExpressionSuggestion(expression,
                                                        { selectedGroup: groupIndex, selectedListItem: index })}
                                                    style={{ color: '#40404B' }}
                                                    className={statementEditorToolbarClasses.toolbarIcons}
                                                >
                                                    <Typography style={{fontFamily: 'monospace'}}>
                                                        {expression.symbol}
                                                    </Typography>
                                                </IconButton>
                                            </StatementEditorHint>
                                        ))
                                    }
                                </div>
                            </>
                        ))}
                    </>
                )}
            </div>
        </>
    );
}
