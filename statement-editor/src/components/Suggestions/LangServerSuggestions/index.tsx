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

import { NodePosition } from "@wso2-enterprise/syntax-tree";

import {
    FUNCTION_COMPLETION_KIND,
    METHOD_COMPLETION_KIND,
    PROPERTY_COMPLETION_KIND
} from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { InputEditorContext } from "../../../store/input-editor-context";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getExprWithArgs } from "../../../utils";
import { KeyboardNavigationManager } from "../../../utils/keyboard-navigation-manager";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles} from "../../styles";

import { SuggestionsList } from "./SuggestionsList";

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
            lsSuggestions,
            lsSecondLevelSuggestions
        },
        targetPosition
    } = useContext(StatementEditorContext);
    const selectionForSecondLevel = lsSecondLevelSuggestions?.selection;
    const secondLevelSuggestions = lsSecondLevelSuggestions?.secondLevelSuggestions;
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
        const completionKind = suggestion.completionKind;
        let value = completionKind === PROPERTY_COMPLETION_KIND ? suggestion.insertText : suggestion.value;
        const prefix = (inputEditorCtx.userInput.includes('.') && resourceAccessRegex.exec(inputEditorCtx.userInput)[0])
            || suggestion.prefix ;
        if (completionKind === METHOD_COMPLETION_KIND || completionKind === FUNCTION_COMPLETION_KIND) {
            value = getExprWithArgs(value, prefix);
        } else if (prefix) {
            value = prefix + value;
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

    return (
        <>
            {!!lsSuggestions?.length && (
                <>
                    <div className={stmtEditorHelperClasses.lsSuggestionList}>
                        <div className={statementEditorClasses.stmtEditorExpressionWrapper}>
                            <SuggestionsList
                                lsSuggestions={lsSuggestions}
                                selectedListItem={selectedListItem}
                                onClickLSSuggestion={onClickLSSuggestion}
                            />
                            {!!secondLevelSuggestions?.length && (
                                <SuggestionsList
                                    lsSuggestions={secondLevelSuggestions}
                                    selectedListItem={selectedListItem}
                                    onClickLSSuggestion={onClickLSSuggestion}
                                    selection={selectionForSecondLevel}
                                />
                            )}
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
