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

import { ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { acceptedCompletionKindForTypes } from "../../../../constants";
import { Suggestion, SuggestionItem } from "../../../../models/definitions";
import { getSuggestionIconStyle } from "../../../../utils";
import { useStmtEditorHelperPanelStyles } from "../../../styles";

export interface SuggestionListItemProps {
    key: number;
    suggestion: SuggestionItem;
    isSelected: boolean
    onClickLSSuggestion: (suggestion: SuggestionItem) => void;
}

export function SuggestionListItem(props: SuggestionListItemProps) {
    const { key, suggestion, onClickLSSuggestion, isSelected } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { SuggestIcon, color } = getSuggestionIconStyle(suggestion.completionKind);

    const onClickOnListItem = () => {
        onClickLSSuggestion(suggestion);
    };

    return (
        <StatementEditorHint
            content={suggestion.value}
            contentType={!acceptedCompletionKindForTypes.includes(suggestion.completionKind) ? suggestion.kind : null}
        >
            <ListItem
                button={true}
                key={key}
                selected={isSelected}
                onMouseDown={onClickOnListItem}
                className={stmtEditorHelperClasses.suggestionListItem}
                disableRipple={true}
            >
                <SuggestIcon
                    style={{ minWidth: '22px', textAlign: 'left', color }}
                />
                <ListItemText
                    data-testid="suggestion-value"
                    style={{ flex: 'none', maxWidth: '80%' }}
                    primary={(
                        <Typography className={stmtEditorHelperClasses.suggestionValue}>
                            {suggestion.value}
                        </Typography>
                    )}
                />
                {!acceptedCompletionKindForTypes.includes(suggestion.completionKind) && (
                    <ListItemText
                        style={{ marginLeft: '8px' }}
                        primary={(
                            <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                {suggestion.kind}
                            </Typography>
                        )}
                    />
                )}
            </ListItem>
        </StatementEditorHint>
    );
}
