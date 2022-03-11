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
import React, { useContext, useState } from "react";

import { ALL_LIBS_IDENTIFIER, LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER } from "../../constants";
import { SuggestionsList } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import SelectDropdown from "../Dropdown";
import { LibraryBrowser } from "../LibraryBrowser";
import { useStatementEditorStyles } from "../styles";
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { LSSuggestions } from "../Suggestions/LangServerSuggestions";
import TabPanel from "../Tab";

enum TabElements {
    suggestions = 'Suggestions',
    expressions = 'Expressions',
    libraries = 'Libraries',
}

export function HelperPane(props: SuggestionsList) {
    const statementEditorClasses = useStatementEditorStyles();
    const { lsSuggestions, expressionSuggestions } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel
        }
    } = stmtCtx;

    const [selectedTab, setSelectedTab] = useState(TabElements.suggestions);
    const [, setIsSuggestionClicked] = useState(false);
    const [libraryType, setLibraryType] = useState('');

    const suggestionHandler = () => {
        setIsSuggestionClicked(prevState => {
            return !prevState;
        });
    }

    const onTabElementSelection = async (value: TabElements) => {
        setSelectedTab(value);
    };

    const onLibTypeSelection = (value: string) => {
        setLibraryType(value);
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
                    { selectedTab === TabElements.libraries && (
                        <SelectDropdown
                            values={[ALL_LIBS_IDENTIFIER, LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER]}
                            defaultValue={ALL_LIBS_IDENTIFIER}
                            onSelection={onLibTypeSelection}
                        />
                    )}
                </div>
            </div>
            <div className={statementEditorClasses.suggestionsInner}>
                {(
                    <LSSuggestions
                        model={currentModel.model}
                        lsSuggestions={lsSuggestions}
                        suggestionHandler={suggestionHandler}
                        isSuggestion={selectedTab === TabElements.suggestions}
                    />
                )}
                {(
                    <ExpressionSuggestions
                        model={currentModel.model}
                        suggestions={expressionSuggestions}
                        suggestionHandler={suggestionHandler}
                        isExpression={selectedTab === TabElements.expressions}
                    />
                )}
                <LibraryBrowser
                    libraryType={libraryType}
                    isLibrary={selectedTab === TabElements.libraries}
                />
            </div>
        </>
    );
}
