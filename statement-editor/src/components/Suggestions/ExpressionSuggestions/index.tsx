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
import React, { useContext, useState } from "react";
import {
    Avatar, List, ListItem, ListItemIcon, ListItemText, Typography, Input, InputAdornment
} from "@material-ui/core";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";
import LibrarySearchIcon from "../../../assets/icons/LibrarySearchIcon";
import { expressions, ExpressionGroup, Expression, SELECTED_EXPRESSION } from "../../../utils/expressions";
import { filter } from "lodash";

export interface ExpressionSuggestionsProps {
    model: STNode;
    isOperator: boolean;
    isType: boolean;
}

export function ExpressionSuggestions(props: ExpressionSuggestionsProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { model, isType, isOperator } = props;
    const inputEditorCtx = useContext(InputEditorContext);
    const [keyword, setKeyword] = useState('');
    const [filteredExpressions, setFilteredExpressions] = useState(expressions);
    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickExpressionSuggestion = (expression: Expression) => {
        const text = expression.template.replace(SELECTED_EXPRESSION, model.source);
        updateModel(text, model.position);
        inputEditorCtx.onInputChange('');
    }

    const searchExpressions = (searchValue: string) => {
        setKeyword(searchValue);
        const filteredGroups: ExpressionGroup[] = [];
        expressions.forEach(group => {
            // Search expression in case insensitive manner 
            let filtered: Expression[] = group.expressions.filter(
                (ex) => ex.name.toLowerCase().includes(searchValue.toLowerCase()));
            // Only push group to filter list if have at least one expression
            if (filtered.length > 0) {
                filteredGroups.push({
                    name: group.name,
                    expressions: filtered
                })
            }
        });
        setFilteredExpressions(filteredGroups);
    }

    return (
        <>
            <div className={statementEditorClasses.expressionSuggestionList}>
                <Input
                    className={statementEditorClasses.librarySearchBox}
                    value={keyword}
                    placeholder={`Search Expression`}
                    onChange={(e) => searchExpressions(e.target.value)}
                    endAdornment={(
                        <InputAdornment position={"end"} style={{ padding: '8.5px' }}>
                            <LibrarySearchIcon />
                        </InputAdornment>
                    )}
                />
                {!!filteredExpressions.length && (<>
                    {filteredExpressions.map((group, i) => (<>
                        <h3 className={statementEditorClasses.librarySearchSubHeader}>{group.name}</h3>
                        <List className={statementEditorClasses.expressionList}>
                            {
                                group.expressions.map((expression, i) => (
                                    <ListItem
                                        button={true}
                                        className={statementEditorClasses.suggestionListItem}
                                        key={i}
                                        onClick={() => onClickExpressionSuggestion(expression)}
                                        disableRipple={true}
                                    >
                                        <ListItemText
                                            title={expression.name}
                                            primary={(
                                                <Typography>
                                                    {expression.example}
                                                </Typography>
                                            )}
                                        />
                                    </ListItem>
                                ))
                            }
                        </List>
                    </>))}
                </>)}
            </div>
            {!filteredExpressions.length && (
                <p className={statementEditorClasses.noSuggestionText}>Expressions not available</p>
            )}
        </>
    );
}
