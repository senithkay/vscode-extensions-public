/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { FormControl, Input, InputAdornment } from "@material-ui/core";
import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import LibrarySearchIcon from "../../../assets/icons/LibrarySearchIcon";
import {
    ACTION,
    FUNCTION_COMPLETION_KIND,
    FUNCTION_TYPE_DESCRIPTER,
    HTTP_ACTION,
    MAPPING_TYPE_DESCRIPTER,
    METHOD_COMPLETION_KIND,
    OBJECT_TYPE_DESCRIPTER,
    PROPERTY_COMPLETION_KIND, SERVICE_TYPE_DESCRIPTER, SUGGESTION_COLUMN_SIZE, TABLE_TYPE_DESCRIPTER
} from "../../../constants";
import { Suggestion, SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getExprWithArgs } from "../../../utils";
import { getActionExprWithArgs } from "../../Parameters/ParameterTree/utils";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";

import { SuggestionsList } from "./SuggestionsList";

export function LSSuggestions() {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const inputEditorCtx = useContext(InputEditorContext);

    const {
        modelCtx: {
            currentModel,
            updateModel,
        },
        suggestionsCtx: {
            lsSuggestions,
            lsSecondLevelSuggestions
        },
        formCtx: {
            formArgs: {
                connector,
            }
        },
        targetPosition,
        config
    } = useContext(StatementEditorContext);
    const selectionForSecondLevel = lsSecondLevelSuggestions?.selection;
    const secondLevelSuggestions = lsSecondLevelSuggestions?.secondLevelSuggestions;
    const resourceAccessRegex = /.+\./gm;
    const [keyword, setKeyword] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionItem[]>(lsSuggestions);
    const [filteredSecondLevelSuggestions, setFilteredSecondLevelSuggestions] = useState<SuggestionItem[]>(secondLevelSuggestions);
    const [selectedSuggestion, setSelectedSuggestion] = React.useState<Suggestion>(null);


    useEffect(() => {
        setFilteredSuggestions(lsSuggestions);
        setFilteredSecondLevelSuggestions(secondLevelSuggestions);
    }, [lsSuggestions, lsSecondLevelSuggestions, currentModel.model]);


    const changeSelectionOnRightLeft = (key: number) => {
        if (selectedSuggestion) {
            setSelectedSuggestion((prevState) => {
                const newSelected = prevState.selectedListItem + key;
                const newGroup = prevState.selectedGroup;
                const suggestionList = newGroup === 0 ? filteredSuggestions : filteredSecondLevelSuggestions;

                if (newSelected >= 0 && newSelected < suggestionList?.length) {
                    return { selectedListItem: newSelected, selectedGroup: newGroup };
                }
                return prevState;
            });
        }
    }

    const changeSelectionOnUpDown = (key: number) => {
        if (selectedSuggestion === null) {
            setSelectedSuggestion((prevState) => {
                if (filteredSuggestions?.length >= 0) {
                    return { selectedListItem: 0, selectedGroup: 0 };
                } else if (filteredSecondLevelSuggestions?.length >= 0) {
                    return { selectedListItem: 0, selectedGroup: 1 };
                }
                return prevState;
            });
        } else if (selectedSuggestion) {
            setSelectedSuggestion((prevState) => {
                let newSelected = prevState.selectedListItem + key;
                let newGroup = prevState.selectedGroup;
                const suggestionList = newGroup === 0 ? filteredSuggestions : filteredSecondLevelSuggestions;

                if (suggestionList?.length > 0) {
                    if (newSelected >= 0) {
                        if (suggestionList.length > SUGGESTION_COLUMN_SIZE && newSelected < suggestionList.length) {
                            return { selectedListItem: newSelected, selectedGroup: newGroup };
                        } else if ((selectedSuggestion.selectedListItem === suggestionList.length - 1 ||
                                newSelected >= suggestionList.length) &&
                            selectedSuggestion.selectedGroup < 1 &&
                            filteredSecondLevelSuggestions?.length > 0) {
                            newGroup = selectedSuggestion.selectedGroup + 1;
                            newSelected = 0;
                            return { selectedListItem: newSelected, selectedGroup: newGroup };
                        }
                    } else if (newSelected < 0 && newGroup > 0 && filteredSuggestions?.length > 0) {
                        newGroup = selectedSuggestion.selectedGroup - 1;
                        newSelected = filteredSuggestions.length - 1;
                        return { selectedListItem: newSelected, selectedGroup: newGroup };
                    }
                }
                return prevState;
            });
        }
    }

    const enterOnSuggestion = () => {
        if (selectedSuggestion) {
            const enteredSuggestion: SuggestionItem = selectedSuggestion.selectedGroup === 0 ?
                filteredSuggestions[selectedSuggestion.selectedListItem] :
                filteredSecondLevelSuggestions[selectedSuggestion.selectedListItem];
            onClickLSSuggestion(enteredSuggestion);
            setSelectedSuggestion(null);
        }
    }

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['right'], changeSelectionOnRightLeft, 1);
        client.bindNewKey(['left'], changeSelectionOnRightLeft, -1);
        client.bindNewKey(['up'], changeSelectionOnUpDown, -SUGGESTION_COLUMN_SIZE);
        client.bindNewKey(['down'], changeSelectionOnUpDown, SUGGESTION_COLUMN_SIZE);
        client.bindNewKey(['enter'], enterOnSuggestion);

    }, [selectedSuggestion, currentModel.model]);

    const onClickLSSuggestion = (suggestion: SuggestionItem) => {
        setKeyword('');
        const completionKind = suggestion.completionKind;
        let value = completionKind === PROPERTY_COMPLETION_KIND ? suggestion.insertText : suggestion.value;
        const prefix = (inputEditorCtx.userInput.includes('.') && resourceAccessRegex.exec(inputEditorCtx.userInput)[0])
            || suggestion.prefix;
        if ((config.type === ACTION || config.type === HTTP_ACTION) && completionKind === FUNCTION_COMPLETION_KIND) {
            value = getActionExprWithArgs(value, connector);
        } else if (completionKind === METHOD_COMPLETION_KIND || completionKind === FUNCTION_COMPLETION_KIND) {
            value = getExprWithArgs(value, prefix);
        } else if (prefix) {
            value = prefix + value;
        }

        switch (value) {
            case "map": {
                value = MAPPING_TYPE_DESCRIPTER;
                break;
            }
            case "table": {
                value = TABLE_TYPE_DESCRIPTER;
                break;
            }
            case "object": {
                value = OBJECT_TYPE_DESCRIPTER;
                break;
            }
            case "service": {
                value = SERVICE_TYPE_DESCRIPTER;
                break;
            }
            case "function": {
                value = FUNCTION_TYPE_DESCRIPTER;
                break;
            }
        }

        const nodePosition: NodePosition = currentModel
            ? (currentModel.stmtPosition
                ? currentModel.stmtPosition
                : currentModel.model.position)
            : targetPosition;
        updateModel(value, nodePosition);
        inputEditorCtx.onInputChange('');
        inputEditorCtx.onSuggestionSelection(value);
    }

    const searchSuggestions = (e: any) => {
        const searchValue = e.target.value;
        setKeyword(searchValue);
        setFilteredSuggestions(lsSuggestions.filter(suggestion => suggestion.value.toLowerCase().includes(searchValue.toLowerCase())));
        setFilteredSecondLevelSuggestions(secondLevelSuggestions.filter(suggestion => suggestion.value.toLowerCase().includes(searchValue.toLowerCase())))
        setSelectedSuggestion(null);
    }

    return (
        <>
            <FormControl style={{ width: '100%', padding: '0 25px' }}>
                <Input
                    data-testid="ls-suggestions-searchbar"
                    className={stmtEditorHelperClasses.librarySearchBox}
                    placeholder={`Search Suggestions`}
                    onChange={searchSuggestions}
                    value={keyword}
                    endAdornment={(
                        <InputAdornment position={"end"} style={{ padding: '8.5px' }}>
                            <LibrarySearchIcon/>
                        </InputAdornment>
                    )}
                />
            </FormControl>
            {(filteredSuggestions?.length || filteredSecondLevelSuggestions?.length) ?
            (
                <div className={stmtEditorHelperClasses.lsSuggestionList}>
                    <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                        {!!filteredSuggestions?.length && (
                            <SuggestionsList
                                lsSuggestions={filteredSuggestions}
                                selectedSuggestion={selectedSuggestion}
                                currentGroup={0}
                                onClickLSSuggestion={onClickLSSuggestion}
                            />
                        )}
                        {!!filteredSecondLevelSuggestions?.length && (
                            <SuggestionsList
                                lsSuggestions={filteredSecondLevelSuggestions}
                                selectedSuggestion={selectedSuggestion}
                                currentGroup={1}
                                onClickLSSuggestion={onClickLSSuggestion}
                                selection={selectionForSecondLevel}
                            />
                        )}
                    </div>
                </div>
            )
            :
            (
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <p>Suggestions not available</p>
                </div>
            )}
        </>
    );
}
