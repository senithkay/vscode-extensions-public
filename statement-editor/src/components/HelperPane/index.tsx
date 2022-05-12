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
import React, { useEffect, useState } from "react";

import { ALL_LIBS_IDENTIFIER, LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER } from "../../constants";
import { KeyboardNavigationManager } from "../../utils/keyboard-navigation-manager";
import SelectDropdown from "../Dropdown";
import { LibraryBrowser } from "../LibraryBrowser";
import { ParameterSuggestions } from "../Parameters/ParameterSuggestions";
import { useStatementEditorStyles } from "../styles";
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { LSSuggestions } from "../Suggestions/LangServerSuggestions";
import TabPanel from "../Tab";

enum TabElements {
    suggestions = 'Suggestions',
    expressions = 'Expressions',
    libraries = 'Libraries',
    parameters = 'Parameters'
}

export interface HelperPaneProps{
    docExpandClicked : boolean
}

export function HelperPane(props: HelperPaneProps) {
    const { docExpandClicked } = props;
    const statementEditorClasses = useStatementEditorStyles();
    const [selectedTab, setSelectedTab] = useState(TabElements.suggestions);
    const [libraryType, setLibraryType] = useState('');

    const onTabElementSelection = async (value: TabElements) => {
        setSelectedTab(value);
    };

    const onLibTypeSelection = (value: string) => {
        setLibraryType(value);
    };

    const keyboardNavigationManager = new KeyboardNavigationManager();

    React.useEffect(() => {

        const client = keyboardNavigationManager.getClient()

        keyboardNavigationManager.bindNewKey(client, ['ctrl+shift+s', 'command+shift+s'], setSelectedTab, TabElements.suggestions)
        keyboardNavigationManager.bindNewKey(client, ['ctrl+shift+e', 'command+shift+e'], setSelectedTab, TabElements.expressions)
        keyboardNavigationManager.bindNewKey(client, ['ctrl+shift+l', 'command+shift+l'], setSelectedTab, TabElements.libraries)

        return () => {
            keyboardNavigationManager.resetMouseTrapInstance(client);
        }
    }, []);

    useEffect(() => {
        if (docExpandClicked){
            setSelectedTab(TabElements.parameters);
        }
    }, [docExpandClicked])

    return (
        <>
            <div className={statementEditorClasses.tabPanelWrapper}>
                <div className={statementEditorClasses.tabPanel}>
                    <TabPanel
                        values={[TabElements.suggestions, TabElements.expressions, TabElements.libraries, TabElements.parameters]}
                        defaultValue={TabElements.suggestions}
                        onSelection={onTabElementSelection}
                        selectedTab={selectedTab}
                    />
                </div>
                <div className={statementEditorClasses.libraryTypeSelector}>
                    {selectedTab === TabElements.libraries && (
                        <SelectDropdown
                            values={[ALL_LIBS_IDENTIFIER, LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER]}
                            defaultValue={ALL_LIBS_IDENTIFIER}
                            onSelection={onLibTypeSelection}
                        />
                    )}
                </div>
            </div>
            <div className={statementEditorClasses.suggestionsInner}>
                {selectedTab === TabElements.suggestions && <LSSuggestions />}
                {selectedTab === TabElements.expressions && <ExpressionSuggestions />}
                {selectedTab === TabElements.libraries && <LibraryBrowser libraryType={libraryType} />}
                {selectedTab === TabElements.parameters && <ParameterSuggestions />}
            </div>
        </>
    );
}
