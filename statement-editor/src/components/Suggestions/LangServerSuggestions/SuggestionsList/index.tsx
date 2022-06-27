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
import React from "react";

import { List } from "@material-ui/core";

import { SuggestionItem } from "../../../../models/definitions";
import { useStmtEditorHelperPanelStyles } from "../../../styles";
import { SuggestionListItem } from "../SuggestionListItem";

export interface SuggestionsListProps {
    lsSuggestions: SuggestionItem[];
    selectedListItem: number;
    onClickLSSuggestion: (suggestion: SuggestionItem) => void;
    selection?: string;
}

export function SuggestionsList(props: SuggestionsListProps) {
    const { lsSuggestions, selectedListItem, onClickLSSuggestion, selection } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();

    return (
        <>
            {(selection) && (
                <>
                    <br/>
                    <div className={stmtEditorHelperClasses.helperPaneSubHeader}>{selection}</div>
                </>
            )}
            <List className={stmtEditorHelperClasses.suggestionList} data-testid="suggestion-list">
                {
                    lsSuggestions.map((suggestion: SuggestionItem, index: number) => (
                        <SuggestionListItem
                            key={index}
                            suggestion={suggestion}
                            selectedListItem={selectedListItem}
                            onClickLSSuggestion={onClickLSSuggestion}
                        />
                    ))
                }
            </List>
        </>
    );
}
