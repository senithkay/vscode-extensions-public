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
import React, { useContext, useEffect, useState } from "react";

import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import {
    ALL_LIBS_IDENTIFIER,
    DEFAULT_WHERE_INTERMEDIATE_CLAUSE,
    LANG_LIBS_IDENTIFIER,
    STD_LIBS_IDENTIFIER
} from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { isConfigurableEditor, isFunctionOrMethodCall, isInsideConnectorParams } from "../../utils";
import SelectDropdown from "../Dropdown";
import { LibraryBrowser } from "../LibraryBrowser";
import { ParameterSuggestions } from "../Parameters/ParameterSuggestions";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles  } from "../styles";
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
    paramTabHandler : (isEnabled : boolean) => void
}

export function HelperPane(props: HelperPaneProps) {
    const { docExpandClicked, paramTabHandler } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const [selectedTab, setSelectedTab] = useState(TabElements.suggestions);
    const [libraryType, setLibraryType] = useState('');

    const {
        modelCtx: {
            currentModel
        },
        editorCtx: {
            editors,
            activeEditorId
        },
        config
    } = useContext(StatementEditorContext);

    const onTabElementSelection = async (value: TabElements) => {
        setSelectedTab(value);
    };

    const onLibTypeSelection = (value: string) => {
        setLibraryType(value);
    };

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['ctrl+shift+s', 'command+shift+s'], setSelectedTab, TabElements.suggestions);
        client.bindNewKey(['ctrl+shift+e', 'command+shift+e'], setSelectedTab, TabElements.expressions);
        client.bindNewKey(['ctrl+shift+l', 'command+shift+l'], setSelectedTab, TabElements.libraries);
        client.bindNewKey(['ctrl+shift+d', 'command+shift+d'], setSelectedTab, TabElements.parameters);

        return () => {
            client.resetMouseTrapInstance();
        }
    }, []);

    useEffect(() => {
        if (
            currentModel.model &&
            (isFunctionOrMethodCall(currentModel.model) || isInsideConnectorParams(currentModel.model, config.type)) &&
            !isConfigurableEditor(editors, activeEditorId)
        ) {
            setSelectedTab(TabElements.parameters);
        } else if (currentModel.model?.source?.trim() === DEFAULT_WHERE_INTERMEDIATE_CLAUSE) {
            setSelectedTab(TabElements.expressions);
        }
    }, [docExpandClicked, currentModel.model]);

    useEffect(() => {
        selectedTab === TabElements.parameters ? paramTabHandler(true) : paramTabHandler(false);
    }, [selectedTab])

    return (
        <>
            <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                <div className={stmtEditorHelperClasses.tabPanelWrapper} data-testid="tab-panel-wrapper">
                    <TabPanel
                        values={[TabElements.suggestions, TabElements.expressions, TabElements.libraries, TabElements.parameters]}
                        defaultValue={TabElements.suggestions}
                        onSelection={onTabElementSelection}
                        selectedTab={selectedTab}
                    />
                    <div className={stmtEditorHelperClasses.libraryTypeSelector}>
                        {selectedTab === TabElements.libraries && (
                            <SelectDropdown
                                values={[ALL_LIBS_IDENTIFIER, LANG_LIBS_IDENTIFIER, STD_LIBS_IDENTIFIER]}
                                defaultValue={ALL_LIBS_IDENTIFIER}
                                onSelection={onLibTypeSelection}
                            />
                        )}
                    </div>
                </div>
                <div className={statementEditorClasses.separatorLine} />
            </div>
            <div className={stmtEditorHelperClasses.suggestionsInner} data-testid="suggestions-inner">
                {selectedTab === TabElements.suggestions && <LSSuggestions />}
                {selectedTab === TabElements.expressions && <ExpressionSuggestions />}
                {selectedTab === TabElements.libraries && <LibraryBrowser libraryType={libraryType} />}
                {selectedTab === TabElements.parameters && <ParameterSuggestions />}
            </div>
        </>
    );
}
