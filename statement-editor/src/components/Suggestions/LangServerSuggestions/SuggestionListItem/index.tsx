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

import { acceptedCompletionKindForTypes } from "../../../../constants";
import { SuggestionItem } from "../../../../models/definitions";
import { getSuggestionIconStyle } from "../../../../utils";
import { useStmtEditorHelperPanelStyles } from "../../../styles";

export interface SuggestionListItemProps {
    key: number;
    suggestion: SuggestionItem;
    selectedListItem: number;
    onClickLSSuggestion: (suggestion: SuggestionItem) => void;
}

export function SuggestionListItem(props: SuggestionListItemProps) {
    const { key, suggestion, selectedListItem, onClickLSSuggestion } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { className, color } = getSuggestionIconStyle(suggestion.completionKind);

    const onClickOnListItem = () => {
        onClickLSSuggestion(suggestion);
    };

    return (
        <>
            <ListItem
                button={true}
                key={key}
                selected={key === selectedListItem}
                onMouseDown={onClickOnListItem}
                className={stmtEditorHelperClasses.suggestionListItem}
                disableRipple={true}
            >
                <ListItemIcon
                    className={className}
                    style={{ minWidth: '22px', textAlign: 'left', color }}
                />
                <ListItemText
                    data-testid="suggestion-value"
                    title={suggestion.value}
                    style={{ flex: 'none', maxWidth: '80%' }}
                    primary={(
                        <Typography className={stmtEditorHelperClasses.suggestionValue}>
                            {suggestion.value}
                        </Typography>
                    )}
                />
                {!acceptedCompletionKindForTypes.includes(suggestion.completionKind) && (
                    <ListItemText
                        style={{ minWidth: '10%', marginLeft: '8px' }}
                        primary={(
                            <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                {suggestion.kind}
                            </Typography>
                        )}
                    />
                )}
            </ListItem>
        </>
    );
}
