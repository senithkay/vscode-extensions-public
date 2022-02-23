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
import React, { useContext, useState } from "react";

import { SuggestionItem } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { LibraryBrowser } from "../LibraryBrowser";
import { useStatementEditorStyles } from "../styles";
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { TypeSuggestions } from "../Suggestions/TypeSuggestions";
import { VariableSuggestions } from "../Suggestions/VariableSuggestions";
import TabPanel from "../Tab";

interface HelperPaneProps {
    variableList: SuggestionItem[];
    typeDescriptorList: SuggestionItem[];
    suggestionList: SuggestionItem[];
    isOperator: boolean;
    isTypeDescSuggestion: boolean;
}

enum TabElements {
    suggestions = 'Suggestions',
    expressions = 'Expressions',
    libraries = 'Libraries',
}

export function HelperPane(props: HelperPaneProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { variableList, typeDescriptorList, suggestionList, isOperator, isTypeDescSuggestion } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel
        }
    } = stmtCtx;

    const [selectedTab, setSelectedTab] = useState(TabElements.suggestions);
    const [, setIsSuggestionClicked] = useState(false);

    const suggestionHandler = () => {
        setIsSuggestionClicked(prevState => {
            return !prevState;
        });
    }

    const onTabElementSelection = async (value: TabElements) => {
        setSelectedTab(value);
    };

    return (
        <>
            <div className={statementEditorClasses.tabPanelWrapper}>
                <div className={statementEditorClasses.tabPanel}>
                    <TabPanel
                        values={[TabElements.suggestions, TabElements.expressions, TabElements.libraries]}
                        defaultValue={TabElements.suggestions}
                        onSelection={onTabElementSelection}
                    />
                </div>
                <div className={statementEditorClasses.libraryTypeSelector}>
                    <></>
                </div>
            </div>
            { selectedTab === TabElements.suggestions && (!isTypeDescSuggestion && variableList.length > 0) && (
                <div className={statementEditorClasses.suggestionsInner}>
                    <VariableSuggestions
                        model={currentModel.model}
                        variableSuggestions={variableList}
                        suggestionHandler={suggestionHandler}
                    />
                </div>
            )}
            { selectedTab === TabElements.expressions && (!isTypeDescSuggestion && suggestionList.length > 0) && (
                <div className={statementEditorClasses.suggestionsInner}>
                    <ExpressionSuggestions
                        model={currentModel.model}
                        suggestions={suggestionList}
                        operator={isOperator}
                        suggestionHandler={suggestionHandler}
                    />
                </div>
            )}
            { selectedTab === TabElements.suggestions && isTypeDescSuggestion && (
                <div className={statementEditorClasses.suggestionsInner}>
                    <TypeSuggestions
                        model={currentModel.model}
                        typeSuggestions={typeDescriptorList}
                        suggestionHandler={suggestionHandler}
                    />
                </div>
            )}
            { selectedTab === TabElements.libraries && (
                <div className={statementEditorClasses.suggestionsInner}>
                    <LibraryBrowser />
                </div>
            )}
        </>
    );
}
