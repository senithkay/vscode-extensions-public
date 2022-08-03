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
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { FormControl, Input, InputAdornment } from "@material-ui/core";
import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import LibrarySearchIcon from "../../../assets/icons/LibrarySearchIcon";
import {
    ACTION,
    FUNCTION_COMPLETION_KIND,
    MAPPING_TYPE_DESCRIPTER,
    METHOD_COMPLETION_KIND,
    PROPERTY_COMPLETION_KIND
} from "../../../constants";
import { Suggestion, SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getExprWithArgs } from "../../../utils";
import { getActionExprWithArgs } from "../../Parameters/ParameterTree/utils";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles} from "../../styles";

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
    const [selectedSuggestion, setSelectedSuggestion] = React.useState<Suggestion>({selectedGroup: 0, selectedListItem: 0});


    useEffect(() => {
        setFilteredSuggestions(lsSuggestions);
        setFilteredSecondLevelSuggestions(secondLevelSuggestions);
    }, [lsSuggestions, secondLevelSuggestions]);


    const changeSelectionOnRightLeft = (key: number) => {
        setSelectedSuggestion((prevState) => {
            const newSelected = prevState.selectedListItem + key;
            const newGroup = prevState.selectedGroup;
            const suggestionList = newGroup === 0 ? filteredSuggestions : filteredSecondLevelSuggestions;

            if (newSelected >= 0 && newSelected < suggestionList.length) {
                return {selectedListItem: newSelected, selectedGroup: newGroup};
            }
        });
    }

    const changeSelectionOnUpDown = (key: number) => {
        setSelectedSuggestion((prevState) => {
            let newSelected = prevState.selectedListItem + key;
            let newGroup = prevState.selectedGroup;
            const suggestionList = newGroup === 0 ? filteredSuggestions : filteredSecondLevelSuggestions;

            if (suggestionList?.length > 0){
                if (newSelected >= 0) {
                    if (suggestionList.length > 3 && newSelected < suggestionList.length) {
                        return {selectedListItem: newSelected, selectedGroup: newGroup};
                    } else if ((selectedSuggestion.selectedListItem === suggestionList.length - 1 ||
                            newSelected >= suggestionList.length) &&
                        selectedSuggestion.selectedGroup < 1 &&
                        filteredSecondLevelSuggestions?.length > 0){
                        newGroup = selectedSuggestion.selectedGroup + 1;
                        newSelected = 0;
                        return {selectedListItem: newSelected, selectedGroup: newGroup};
                    }
                } else if (newSelected < 0 && newGroup > 0) {
                    newGroup = selectedSuggestion.selectedGroup - 1;
                    newSelected = filteredSuggestions.length - 1;
                    return {selectedListItem: newSelected, selectedGroup: newGroup};
                }
            }
        });
    }

    const enterOnSuggestion = () => {
        if (selectedSuggestion){
            const enteredSuggestion : SuggestionItem = selectedSuggestion.selectedGroup === 0 ?
                filteredSuggestions[selectedSuggestion.selectedListItem] :
                filteredSecondLevelSuggestions[selectedSuggestion.selectedListItem];
            onClickLSSuggestion(enteredSuggestion);
        }
    }

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['right'], changeSelectionOnRightLeft, 1);
        client.bindNewKey(['left'], changeSelectionOnRightLeft, -1);
        client.bindNewKey(['up'], changeSelectionOnUpDown, -3);
        client.bindNewKey(['down'], changeSelectionOnUpDown, 3);
        client.bindNewKey(['enter'], enterOnSuggestion);

        return () => {
            client.resetMouseTrapInstance();
        }
    }, [selectedSuggestion, currentModel.model, lsSuggestions, secondLevelSuggestions]);

    const onClickLSSuggestion = (suggestion: SuggestionItem) => {
        setKeyword('');
        const completionKind = suggestion.completionKind;
        let value = completionKind === PROPERTY_COMPLETION_KIND ? suggestion.insertText : suggestion.value;
        const prefix = (inputEditorCtx.userInput.includes('.') && resourceAccessRegex.exec(inputEditorCtx.userInput)[0])
            || suggestion.prefix ;
        if (config.type === ACTION && completionKind === FUNCTION_COMPLETION_KIND) {
            value = getActionExprWithArgs(value, connector);
        } else if (completionKind === METHOD_COMPLETION_KIND || completionKind === FUNCTION_COMPLETION_KIND) {
            value = getExprWithArgs(value, prefix);
        } else if (prefix) {
            value = prefix + value;
        }

        if (value === "map") {
            value = MAPPING_TYPE_DESCRIPTER;
        }

        const nodePosition : NodePosition = currentModel
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
        setFilteredSuggestions(lsSuggestions.filter(suggestion =>  suggestion.value.toLowerCase().includes(searchValue.toLowerCase())));
        setFilteredSecondLevelSuggestions(secondLevelSuggestions.filter(suggestion =>  suggestion.value.toLowerCase().includes(searchValue.toLowerCase())))
        setSelectedSuggestion({selectedGroup: 0, selectedListItem: 0});
    }

    return (
        <>
            <FormControl style={{ width: '100%', padding: '0 25px' }}>
                <Input
                    data-testid="ls-suggestions-searchbar"
                    className={stmtEditorHelperClasses.librarySearchBox}
                    placeholder={`Search Suggestions`}
                    onChange={searchSuggestions}
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
