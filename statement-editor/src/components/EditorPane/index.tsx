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

import IconButton from "@material-ui/core/IconButton";
import RedoIcon from "@material-ui/icons/Redo";
import UndoIcon from "@material-ui/icons/Undo";
import { getDiagnosticMessage } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import * as c from "../../constants";
import { SuggestionsList } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { SuggestionsContext } from "../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../utils";
import { Diagnostics } from "../Diagnostics";
import { HelperPane } from "../HelperPane";
import { StatementRenderer } from "../StatementRenderer";
import { useStatementEditorStyles } from "../styles";

interface ModelProps {
    label: string,
    currentModel: { model: STNode },
    currentModelHandler: (model: STNode) => void
}

export function EditorPane(props: ModelProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { label, currentModelHandler } = props;

    const stmtCtx = useContext(StatementEditorContext);

    const {
        modelCtx: {
            undo,
            redo,
            hasRedo,
            hasUndo,
            statementModel
        },
        statementCtx: {
            diagnostics
        },
        formCtx: {
            formModelPosition: targetPosition
        }
    } = stmtCtx;

    const [, setIsSuggestionClicked] = useState(false);
    const [lsSuggestionsList, setLSSuggestionsList] = useState([]);
    const [exprSuggestionList, setExprSuggestionsList] = useState(statementModel ?
        getSuggestionsBasedOnExpressionKind(c.DEFAULT_EXPRESSIONS) : []);

    const expressionHandler = (cModel: STNode, suggestions: SuggestionsList) => {
        currentModelHandler(cModel);
        if (suggestions.expressionSuggestions) {
            setExprSuggestionsList(suggestions.expressionSuggestions);
        }
        if (suggestions.lsSuggestions) {
            setLSSuggestionsList(suggestions.lsSuggestions);
        }

        setIsSuggestionClicked(false);
    }

    const undoRedoButtons = (
        <span className={statementEditorClasses.undoRedoButtons}>
            <IconButton onClick={undo} disabled={!hasUndo}>
                <UndoIcon />
            </IconButton>
            <IconButton onClick={redo} disabled={!hasRedo}>
                <RedoIcon />
            </IconButton>
        </span>
    );


    return (
        <div>
            <div className={statementEditorClasses.stmtEditorContentWrapper}>
                <SuggestionsContext.Provider
                    value={{
                        expressionHandler
                    }}
                >
                    <div className={statementEditorClasses.statementExpressionTitle}>{label}{undoRedoButtons}</div>
                    <div className={statementEditorClasses.statementExpressionContent}>
                        <StatementRenderer
                            model={statementModel}
                            isElseIfMember={false}
                        />
                    </div>

                </SuggestionsContext.Provider>
                <div className={statementEditorClasses.diagnosticsPane}>
                    <Diagnostics
                        message={
                            getDiagnosticMessage(
                                diagnostics,
                                { ...targetPosition, startColumn: 0 },
                                0,
                                statementModel?.source.length,
                                0,
                                0
                            )
                        }
                    />
                </div>
            </div>
            <div className={statementEditorClasses.suggestionsSection}>
                <HelperPane
                    lsSuggestions={lsSuggestionsList}
                    expressionSuggestions={exprSuggestionList}
                />
            </div>
        </div>
    );
}
