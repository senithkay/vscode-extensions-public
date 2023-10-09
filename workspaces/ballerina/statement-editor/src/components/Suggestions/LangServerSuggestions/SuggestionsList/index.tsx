/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { List } from "@material-ui/core";

import { Suggestion, SuggestionItem } from "../../../../models/definitions";
import { useStmtEditorHelperPanelStyles } from "../../../styles";
import { SuggestionListItem } from "../SuggestionListItem";

export interface SuggestionsListProps {
    lsSuggestions: SuggestionItem[];
    selectedSuggestion: Suggestion;
    currentGroup: number;
    onClickLSSuggestion: (suggestion: SuggestionItem) => void;
    selection?: string;
    header?: string;
    isReference?: boolean
}

export function SuggestionsList(props: SuggestionsListProps) {
    const {
        lsSuggestions,
        selectedSuggestion,
        onClickLSSuggestion,
        selection,
        currentGroup,
        header,
        isReference = false
    } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();

    return (
        <>
            {(header) && (
                <div className={stmtEditorHelperClasses.groupHeaderWrapper}>
                    <div className={stmtEditorHelperClasses.groupHeader}>{header}</div>
                    <div className={stmtEditorHelperClasses.selectionSeparator} />
                </div>
            )}
            {(selection) && (
                <>
                    <br/>
                    <div className={stmtEditorHelperClasses.selectionWrapper}>
                        <div className={stmtEditorHelperClasses.selectionSubHeader}>{selection}</div>
                        <div className={stmtEditorHelperClasses.selectionSeparator} />
                    </div>
                </>
            )}
            <List className={stmtEditorHelperClasses.suggestionList} data-testid="suggestion-list">
                {
                    lsSuggestions.map((suggestion: SuggestionItem, index: number) => (
                        <SuggestionListItem
                            key={index}
                            isSelected={ selectedSuggestion && (
                                index === selectedSuggestion.selectedListItem &&
                                currentGroup === selectedSuggestion.selectedGroup
                            )
                            }
                            suggestion={suggestion}
                            onClickLSSuggestion={onClickLSSuggestion}
                            isReference={isReference}
                        />
                    ))
                }
            </List>
            {isReference && (
                <div className={stmtEditorHelperClasses.selectionWrapper}>
                    <div className={stmtEditorHelperClasses.selectionSeparator} />
                    <br />
                </div>
            )}
        </>
    );
}
