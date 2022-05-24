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

import { List, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getSuggestionIconStyle, isPositionsEquals } from "../../../utils";
import { KeyboardNavigationManager } from "../../../utils/keyboard-navigation-manager";
import { acceptedCompletionKindForTypes } from "../../InputEditor/constants";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles} from "../../styles";

export function LSSuggestions() {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const inputEditorCtx = useContext(InputEditorContext);
    const [selectedListItem, setSelectedItem] = React.useState(0);

    const {
        modelCtx: {
            currentModel,
            updateModel,
        },
        suggestionsCtx: {
            lsSuggestions
        },
        targetPosition
    } = useContext(StatementEditorContext);
    const resourceAccessRegex = /.+\./gm;
    const [lenghtOfSuggestions, setLength] = useState<number>(lsSuggestions.length)
    const [Suggestions, setSuggestions] = useState<SuggestionItem[]>(lsSuggestions);

    useEffect(() => {
        setLength(lsSuggestions.length);
        setSuggestions(lsSuggestions)
    }, [lsSuggestions]);

    const changeSelected = (key: number) => {
        const newSelected = selectedListItem + key;
        if (newSelected >= 0 && newSelected < lenghtOfSuggestions){
            setSelectedItem(newSelected)
        }
    }

    const keyboardNavigationManager = new KeyboardNavigationManager()

    React.useEffect(() => {

        const client = keyboardNavigationManager.getClient()

        keyboardNavigationManager.bindNewKey(client, ['right'], changeSelected, 1);
        keyboardNavigationManager.bindNewKey(client, ['left'], changeSelected, -1);
        keyboardNavigationManager.bindNewKey(client, ['up'], changeSelected, -2);
        keyboardNavigationManager.bindNewKey(client, ['down'], changeSelected, 2);
        keyboardNavigationManager.bindNewKey(client, ['enter'], onClickLSSuggestion, Suggestions[selectedListItem]);

        return () => {
            keyboardNavigationManager.resetMouseTrapInstance(client)
        }
    }, [selectedListItem]);

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

        const nodePosition: NodePosition = currentModel ? (currentModel.stmtPosition ? currentModel.stmtPosition : currentModel.model.position) : targetPosition

        updateModel(variable, nodePosition);
        inputEditorCtx.onInputChange('');
    }

    return (
        <>
            {!!lsSuggestions?.length && (
                <>
                    <div className={stmtEditorHelperClasses.lsSuggestionList}>
                        <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                            <List className={stmtEditorHelperClasses.suggestionList}>
                                {
                                    lsSuggestions.map((suggestion: SuggestionItem, index: number) => (
                                        <ListItem
                                            button={true}
                                            key={index}
                                            selected={index === selectedListItem}
                                            onClick={() => onClickLSSuggestion(suggestion)}
                                            className={stmtEditorHelperClasses.suggestionListItem}
                                            disableRipple={true}
                                        >
                                            <ListItemIcon
                                                className={getSuggestionIconStyle(suggestion.suggestionType)}
                                                style={{ minWidth: '22px', textAlign: 'left' }}
                                            />
                                            <ListItemText
                                                title={suggestion.value}
                                                style={{ flex: 'none', maxWidth: '80%' }}
                                                primary={(
                                                    <Typography className={stmtEditorHelperClasses.suggestionValue}>
                                                        {suggestion.value}
                                                    </Typography>
                                                )}
                                            />
                                            {!acceptedCompletionKindForTypes.includes(suggestion.suggestionType) && (
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
                                    ))
                                }
                            </List>
                        </div>
                    </div>
                </>
            )}
            {!lsSuggestions?.length && (
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <p>Suggestions not available</p>
                </div>
            )}
        </>
    );
}
