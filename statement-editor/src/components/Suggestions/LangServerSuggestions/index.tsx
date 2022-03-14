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
import React, { useContext } from "react";

import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { TYPE_DESC_KINDS } from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getSuggestionIconStyle } from "../../../utils";
import { useStatementEditorStyles } from "../../styles";

export interface LSSuggestionsProps {
    model: STNode;
    isSuggestion: boolean;
}

export function LSSuggestions(props: LSSuggestionsProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { model, isSuggestion } = props;
    const inputEditorCtx = useContext(InputEditorContext);

    const {
        modelCtx: {
            updateModel,
        },
        suggestionsCtx: {
            lsSuggestions
        },
        formCtx: {
            formModelPosition
        }
    } = useContext(StatementEditorContext);
    const resourceAccessRegex = /.+\./gm;

    const onClickLSSuggestion = (suggestion: SuggestionItem) => {
        let variable = suggestion.value;
        if (inputEditorCtx.userInput.includes('.')) {
            variable = resourceAccessRegex.exec(inputEditorCtx.userInput) + suggestion.value;
        }
        const regExp = /\(([^)]+)\)/;
        if (regExp.exec(variable)) {
            const paramArray = regExp.exec(variable)[1].split(',')
            for (let i = 0; i < paramArray.length; i++) {
                paramArray[i] = paramArray[i].split(' ').pop()
            }
            variable = variable.split('(')[0] + "(" + paramArray.toString() + ")";
        }
        updateModel(variable, model ? model.position : formModelPosition);
        inputEditorCtx.onInputChange('');
    }

    return (
        <>
            { isSuggestion && lsSuggestions && !!lsSuggestions.length && (
                <>
                    <div className={statementEditorClasses.lsSuggestionList}>
                        <List className={statementEditorClasses.suggestionList}>
                            {
                                lsSuggestions.map((suggestion: SuggestionItem, index: number) => (
                                    <ListItem
                                        button={true}
                                        key={index}
                                        onClick={() => onClickLSSuggestion(suggestion)}
                                        className={statementEditorClasses.suggestionListItem}
                                        disableRipple={true}
                                    >
                                        <ListItemIcon
                                            className={getSuggestionIconStyle(suggestion.suggestionType)}
                                            style={{ minWidth: '8%', textAlign: 'left' }}
                                        />
                                        <ListItemText
                                            style={{ flex: 'none', maxWidth: '80%' }}
                                            primary={(
                                                <Typography className={statementEditorClasses.suggestionValue}>
                                                    {suggestion.value}
                                                </Typography>
                                            )}
                                        />
                                        { !TYPE_DESC_KINDS.includes(suggestion.kind) && (
                                            <ListItemText
                                                style={{ minWidth: '10%', marginLeft: '8px' }}
                                                primary={(
                                                    <Typography className={statementEditorClasses.suggestionDataType}>
                                                        {suggestion.kind}
                                                    </Typography>
                                                )}
                                            />
                                        )}
                                    </ListItem>
                                ))
                            }
                        </List>
                    </div>
                </>
            )}
            { isSuggestion && lsSuggestions && !lsSuggestions.length && (
                <p className={statementEditorClasses.noSuggestionText}>Suggestions not available</p>
            )}
        </>
    );
}
