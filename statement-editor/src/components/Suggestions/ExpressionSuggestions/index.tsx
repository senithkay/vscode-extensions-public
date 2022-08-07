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

import { FormControl, Input, InputAdornment, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import LibrarySearchIcon from "../../../assets/icons/LibrarySearchIcon";
import {
    CALL_CONFIG_TYPE,
    CONFIGURABLE_VALUE_REQUIRED_TOKEN,
    DEFAULT_WHERE_INTERMEDIATE_CLAUSE,
    QUERY_INTERMEDIATE_CLAUSES
} from "../../../constants";
import { Suggestion } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getFilteredExpressions } from "../../../utils";
import {
    Expression,
    ExpressionGroup,
    expressions,
    EXPR_PLACEHOLDER,
    SELECTED_EXPRESSION
} from "../../../utils/expressions";
import { ModelType } from "../../../utils/statement-editor-viewstate";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";

export function ExpressionSuggestions() {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
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

    const onClickExpressionSuggestion = (expression: Expression, clickedSuggestion : Suggestion) => {
        if (clickedSuggestion){
            setSelectedSuggestion({selectedGroup: clickedSuggestion.selectedGroup, selectedListItem: clickedSuggestion.selectedListItem});
            updateModelWithSuggestion(expression);
        }
    }

    const updateModelWithSuggestion = (expression: Expression) => {
        const currentModelSource = STKindChecker.isOrderKey(currentModel.model) ? currentModel.model.expression.source :
            (currentModel.model.source ? currentModel.model.source.trim() : currentModel.model.value.trim());
        const text = currentModelSource !== CONFIGURABLE_VALUE_REQUIRED_TOKEN
            ? expression.template.replace(SELECTED_EXPRESSION, currentModelSource)
            : expression.template.replace(SELECTED_EXPRESSION, EXPR_PLACEHOLDER);
        updateModel(text, currentModel.model.position)
        inputEditorCtx.onInputChange('');
        inputEditorCtx.onSuggestionSelection(text);
    }

    useEffect(() => {
        if (currentModel.model) {
            let filteredGroups: ExpressionGroup[] = getFilteredExpressions(expressions, currentModel.model);
            if (currentModel.model.source?.trim() === DEFAULT_WHERE_INTERMEDIATE_CLAUSE){
                filteredGroups = expressions.filter(
                    (exprGroup) => exprGroup.name === QUERY_INTERMEDIATE_CLAUSES);
            } else if ((config.type === CALL_CONFIG_TYPE) && STKindChecker.isFunctionCall(currentModel.model)) {
                filteredGroups = []
            }
            setFilteredExpressions(filteredGroups);
        }
    }, [currentModel.model]);

    const changeSelectionOnUpDown = (key: number) => {
        if (selectedSuggestions == null && filteredExpressions?.length > 0){
            setSelectedSuggestion({ selectedListItem: 0, selectedGroup: 0 });
        }else if (selectedSuggestions) {
            let newSelected = selectedSuggestions.selectedListItem + key;
            let newGroup = selectedSuggestions.selectedGroup;

            if (newSelected >= 0 && filteredExpressions[selectedSuggestions.selectedGroup].expressions.length > 3 &&
                newSelected < filteredExpressions[selectedSuggestions.selectedGroup].expressions.length) {

                setSelectedSuggestion({ selectedListItem: newSelected, selectedGroup: newGroup });
            } else if (newSelected >= 0 &&
                (selectedSuggestions.selectedListItem === filteredExpressions[selectedSuggestions.selectedGroup].expressions.length - 1 ||
                    newSelected >= filteredExpressions[selectedSuggestions.selectedGroup].expressions.length) &&
                selectedSuggestions.selectedGroup < filteredExpressions.length - 1) {

                newGroup = selectedSuggestions.selectedGroup + 1;
                newSelected = 0;
                setSelectedSuggestion({ selectedListItem: newSelected, selectedGroup: newGroup });
            } else if (newSelected < 0 && newGroup >= 0) {
                newGroup = selectedSuggestions.selectedGroup - 1;
                newSelected = filteredExpressions[newGroup].expressions.length - 1;
                setSelectedSuggestion({ selectedListItem: newSelected, selectedGroup: newGroup });
            }
        }
    }

    const changeSelectionOnRightLeft = (key: number) => {
        if (selectedSuggestions){
            const newSelected = selectedSuggestions.selectedListItem + key;
            const newGroup = selectedSuggestions.selectedGroup;
            if (newSelected >= 0 && newSelected < filteredExpressions[selectedSuggestions.selectedGroup].expressions.length) {
                setSelectedSuggestion({selectedListItem: newSelected, selectedGroup: newGroup});
            }
        }
    }

    const enterOnSuggestion = () => {
        if (selectedSuggestions){
            const expression: Expression =
                filteredExpressions[selectedSuggestions.selectedGroup]?.expressions[selectedSuggestions.selectedListItem];
            updateModelWithSuggestion(expression);
            setSelectedSuggestion(null);
        }
    }

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['right'], changeSelectionOnRightLeft, 1);
        client.bindNewKey(['left'], changeSelectionOnRightLeft, -1);
        client.bindNewKey(['up'], changeSelectionOnUpDown, -3);
        client.bindNewKey(['down'], changeSelectionOnUpDown, 3);
        client.bindNewKey(['enter'], enterOnSuggestion);

    }, [selectedSuggestions, currentModel.model]);

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
        setFilteredExpressions(getFilteredExpressions(filteredGroups, currentModel.model));
        setSelectedSuggestion({selectedGroup: 0, selectedListItem: 0});
    }

    return (
        <>

            <div className={stmtEditorHelperClasses.expressionSuggestionList} data-testid="expression-list">
                <FormControl style={{ width: '100%', padding: '0 25px' }}>
                    <Input
                        data-testid="expr-suggestions-searchbar"
                        className={stmtEditorHelperClasses.librarySearchBox}
                        value={keyword}
                        placeholder={`Search Expression`}
                        onChange={(e) => searchExpressions(e.target.value)}
                        endAdornment={(
                            <InputAdornment position={"end"} style={{ padding: '8.5px' }}>
                                <LibrarySearchIcon/>
                            </InputAdornment>
                        )}
                    />
                </FormControl>
                {!filteredExpressions.length && (
                    <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                        <p>Expressions not available</p>
                    </div>
                )}
                <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                    {!!filteredExpressions.length && (
                        <>
                            {filteredExpressions.map((group, groupIndex) => (
                                <>
                                    <div className={stmtEditorHelperClasses.helperPaneSubHeader}>{group.name}</div>
                                    <List className={stmtEditorHelperClasses.expressionList}>
                                        {
                                            group.expressions.map((expression, index) => (
                                                <ListItem
                                                    button={true}
                                                    className={stmtEditorHelperClasses.expressionListItem}
                                                    key={index}
                                                    selected={
                                                        groupIndex === selectedSuggestions?.selectedGroup &&
                                                        index === selectedSuggestions?.selectedListItem
                                                    }
                                                    onMouseDown={() => onClickExpressionSuggestion(expression,
                                                        {selectedGroup: groupIndex, selectedListItem: index})}
                                                    disableRipple={true}
                                                >
                                                    <ListItemText
                                                        data-testid="expression-title"
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
                                    <div className={statementEditorClasses.separatorLine}/>
                                </>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
