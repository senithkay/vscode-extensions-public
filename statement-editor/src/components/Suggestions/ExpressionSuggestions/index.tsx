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
    FormControl,
    Input, InputAdornment, List, ListItem, ListItemText, Typography
} from "@material-ui/core";

import LibrarySearchIcon from "../../../assets/icons/LibrarySearchIcon";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { Expression, ExpressionGroup, expressions, SELECTED_EXPRESSION } from "../../../utils/expressions";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";

export function ExpressionSuggestions() {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const inputEditorCtx = useContext(InputEditorContext);
    const [keyword, setKeyword] = useState('');
    const [filteredExpressions, setFilteredExpressions] = useState(expressions);
    const {
        modelCtx: {
            currentModel,
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickExpressionSuggestion = (expression: Expression) => {
        const currentModelSource = currentModel.model.source
            ? currentModel.model.source.trim()
            : currentModel.model.value.trim();
        const text = expression.template.replace(SELECTED_EXPRESSION, currentModelSource);
        updateModel(text, currentModel.model.position);
        inputEditorCtx.onInputChange('');
    }

    useEffect(() => {
        if (currentModel.model) {
            const filteredGroups: ExpressionGroup[] = expressions.filter(
                (exprGroup) => exprGroup.relatedModelType === currentModel.model.viewState.modelType);
            setFilteredExpressions(filteredGroups);
        }
    }, [currentModel.model]);

    const searchExpressions = (searchValue: string) => {
        setKeyword(searchValue);
        const filteredGroups: ExpressionGroup[] = [];
        expressions.forEach(group => {
            // Search expression in case insensitive manner
            const filtered: Expression[] = group.expressions.filter(
                (ex) => ex.name.toLowerCase().includes(searchValue.toLowerCase()));
            // Only push group to filter list if have at least one expression
            if (filtered.length > 0) {
                filteredGroups.push({
                    name: group.name,
                    expressions: filtered,
                    relatedModelType: group.relatedModelType
                })
            }
        });
        setFilteredExpressions(filteredGroups);
    }

    return (
        <>

            <div className={stmtEditorHelperClasses.expressionSuggestionList}>
                <FormControl style={{ width: '100%', padding: '0 25px'}}>
                    <Input
                        className={stmtEditorHelperClasses.librarySearchBox}
                        value={keyword}
                        placeholder={`Search Expression`}
                        onChange={(e) => searchExpressions(e.target.value)}
                        endAdornment={(
                            <InputAdornment position={"end"} style={{ padding: '8.5px' }}>
                                <LibrarySearchIcon />
                            </InputAdornment>
                        )}
                    />
                </FormControl>
                {!!filteredExpressions.length && (
                    <>
                        {filteredExpressions.map((group) => (
                            <>
                                <div className={stmtEditorHelperClasses.librarySearchSubHeader}>{group.name}</div>
                                <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                                    <List className={stmtEditorHelperClasses.expressionList}>
                                        {
                                            group.expressions.map((expression, index) => (
                                                <ListItem
                                                    button={true}
                                                    className={stmtEditorHelperClasses.expressionListItem}
                                                    key={index}
                                                    onClick={() => onClickExpressionSuggestion(expression)}
                                                    disableRipple={true}
                                                >
                                                    <ListItemText
                                                        title={expression.name}
                                                        primary={(
                                                            <Typography style={{ fontFamily: 'monospace' }}>
                                                                {expression.example}
                                                            </Typography>
                                                        )}
                                                    />
                                                </ListItem>
                                            ))
                                        }
                                    </List>
                                </div>
                                <div className={statementEditorClasses.separatorLine} />
                            </>
                        ))}
                    </>
                )}
            </div>
            {!filteredExpressions.length && (
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <p>Expressions not available</p>
                </div>
            )}
        </>
    );
}
