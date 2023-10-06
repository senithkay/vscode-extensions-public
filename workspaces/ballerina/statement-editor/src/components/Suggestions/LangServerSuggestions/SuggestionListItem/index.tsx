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
    isReference: boolean
}

export function SuggestionListItem(props: SuggestionListItemProps) {
    const { key, suggestion, onClickLSSuggestion, isSelected, isReference } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { SuggestIcon, color } = getSuggestionIconStyle(suggestion.completionKind, isReference);

    const onClickOnListItem = () => {
        onClickLSSuggestion(suggestion);
    };

    const simplifyValue = (text: string) => {
        const splittedText = text.split(".");
        const prefix = splittedText[0].length > 3 ? splittedText[0].slice(0, 3) : splittedText[0];
        if (splittedText.length === 2) {
            return prefix + "." + splittedText[1];
        } else if (splittedText.length > 2) {
            return prefix + "..." + splittedText[splittedText.length - 1];
        } else {
            return text;
        }
    }

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
                            {isReference ? simplifyValue(suggestion.value) : suggestion.value}
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
