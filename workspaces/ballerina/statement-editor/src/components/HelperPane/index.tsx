/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { KeyboardNavigationManager } from "@wso2-enterprise/ballerina-core";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";

import {
    ALL_LIBS_IDENTIFIER,
    DEFAULT_WHERE_INTERMEDIATE_CLAUSE,
    FUNCTION_CALL,
    LANG_LIBS_IDENTIFIER,
    STD_LIBS_IDENTIFIER
} from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { ToolbarContext } from "../../store/toolbar-context";
import {
    isConfigurableEditor,
    isFunctionOrMethodCall,
    isImplicitOrExplicitNewExpr,
    isInsideConnectorParams,
    isRecordFieldName
} from "../../utils";
import { LibraryBrowser } from "../LibraryBrowser";
import { ParameterSuggestions } from "../Parameters/ParameterSuggestions";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles  } from "../styles";
import { ExpressionSuggestions } from "../Suggestions/ExpressionSuggestions";
import { LSSuggestions } from "../Suggestions/LangServerSuggestions";
import TabPanel from "../Tab";
// import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from "@vscode/webview-ui-toolkit/react";

enum TabElements {
    suggestions = 'Suggestions',
    expressions = 'Expressions',
    libraries = 'Libraries',
    parameters = 'Parameters'
}

export function HelperPane() {
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

    const toolbarCtx = useContext(ToolbarContext);

    const onTabElementSelection = async (value: TabElements) => {
        setSelectedTab(value);
    };

    const onLibTypeSelection = (value: string) => {
        setLibraryType(value);
    };

    useEffect(() => {
        if (toolbarCtx.toolbarMoreExp === true) {
            setSelectedTab(TabElements.expressions);
            toolbarCtx.onClickMoreExp(false)
        }
    }, [toolbarCtx.toolbarMoreExp]);

    React.useEffect(() => {

        const client = KeyboardNavigationManager.getClient();

        client.bindNewKey(['ctrl+shift+m', 'command+shift+m'], setSelectedTab, TabElements.suggestions);
        client.bindNewKey(['ctrl+shift+,', 'command+shift+,'], setSelectedTab, TabElements.expressions);
        client.bindNewKey(['ctrl+shift+.', 'command+shift+.'], setSelectedTab, TabElements.libraries);
        client.bindNewKey(['ctrl+shift+/', 'command+shift+/'], setSelectedTab, TabElements.parameters);

    }, []);

    useEffect(() => {
        if (
            currentModel.model &&
            (isFunctionOrMethodCall(currentModel.model) || isInsideConnectorParams(currentModel.model, config.type) ||
                isImplicitOrExplicitNewExpr(currentModel.model)) &&
            !isConfigurableEditor(editors, activeEditorId)
        ) {
            (currentModel.model?.source?.trim() === FUNCTION_CALL) ?
                setSelectedTab(TabElements.libraries) : setSelectedTab(TabElements.parameters);
        } else if (currentModel.model && (currentModel.model?.source?.trim() === DEFAULT_WHERE_INTERMEDIATE_CLAUSE ||
            isRecordFieldName(currentModel.model))) {
            setSelectedTab(TabElements.expressions);
        } else if (isConfigurableEditor(editors, activeEditorId)) {
            setSelectedTab(TabElements.suggestions);
        }
    }, [currentModel.model]);

    // return (
    //     <PanelWrapper>
    //         <VSCodePanels activeid="suggestions">
    //             <VSCodePanelTab id="suggestions">{TabElements.suggestions}</VSCodePanelTab>
    //             <VSCodePanelTab id="expressions">{TabElements.expressions}</VSCodePanelTab>
    //             <VSCodePanelTab id="libraries">{TabElements.libraries}</VSCodePanelTab>
    //             <VSCodePanelTab id="parameters">{TabElements.parameters}</VSCodePanelTab>
    //             <PanelContent>
    //                 <LSSuggestions />
    //             </PanelContent>
    //             <PanelContent>
    //                 <ExpressionSuggestions />
    //             </PanelContent>
    //             <PanelContent>
    //                 <>
    //                     <Dropdown
    //                         onChange={onLibTypeSelection}
    //                         id="lib-filter-dropdown"
    //                         value={libraryType}
    //                         items={[
    //                             { id: "allLibs", value: ALL_LIBS_IDENTIFIER },
    //                             { id: "langLibs", value: LANG_LIBS_IDENTIFIER },
    //                             { id: "stdLibs", value: STD_LIBS_IDENTIFIER }
    //                         ]}
    //                         data-testid="library-selector-dropdown"
    //                         sx={{position: 'absolute', zIndex: 1, top: '-27px', right: '25px'}}
    //                     />
    //                     <LibraryBrowser libraryType={libraryType} />
    //                 </>
    //             </PanelContent>
    //             <PanelContent>
    //                 <ParameterSuggestions />
    //             </PanelContent>
    //         </VSCodePanels>
    //     </PanelWrapper>
    // );

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
                    <div className={stmtEditorHelperClasses.libraryTypeSelector} data-testid="library-type-selector">
                        {selectedTab === TabElements.libraries && (
                            <Dropdown
                                onChange={onLibTypeSelection}
                                id="lib-filter-dropdown"
                                value={libraryType}
                                items={[
                                    { id: "allLibs", value: ALL_LIBS_IDENTIFIER },
                                    { id: "langLibs", value: LANG_LIBS_IDENTIFIER },
                                    { id: "stdLibs", value: STD_LIBS_IDENTIFIER }
                                ]}
                                data-testid="library-selector-dropdown"
                                sx={{position: 'absolute', zIndex: 1, transform: 'translateY(-50%)'}}
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
