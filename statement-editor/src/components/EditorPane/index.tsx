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
import React, { useContext } from "react";

import { StatementEditorContext } from "../../store/statement-editor-context";
import Breadcrumb from "../Breadcrumb";
import { Diagnostics } from "../Diagnostics";
import { InlineDocumentation } from "../Documentation/InlineDocumentation";
import { HelperPane } from "../HelperPane";
import { StatementRenderer } from "../StatementRenderer";
import { useStatementEditorStyles } from "../styles";
import Toolbar from "../Toolbar";

export function EditorPane() {
    const statementEditorClasses = useStatementEditorStyles();
    const [docEnabled, setDocEnabled] = React.useState(false);
    const [docExpandClicked, setDocExpand] = React.useState(false);
    const [isParameterTabEnabled, setParameterTabEnabled] = React.useState(false);

    const stmtCtx = useContext(StatementEditorContext);

    const {
        modelCtx: {
            statementModel
        },
    } = stmtCtx;

    const documentationHandler = () => {
        // tslint:disable-next-line:no-shadowed-variable
        setDocExpand((docExpandClicked) => !docExpandClicked);
    }

    const inlineDocumentHandler = (docBtnEnabled: boolean) => {
        setDocEnabled(docBtnEnabled);
    }

    const paramTabHandler = (isEnabled: boolean) => {
        setParameterTabEnabled(isEnabled);
    }

    return (
        <>
            <div className={statementEditorClasses.stmtEditorContentWrapper} data-testid="statement-contentWrapper">
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <div className={statementEditorClasses.statementExpressionTitle} data-testid="editor-toolbar">
                        <Toolbar inlineDocumentHandler={inlineDocumentHandler}/>
                    </div>
                    <div className={statementEditorClasses.statementExpressionContent}  data-testid="statement-renderer">
                        <StatementRenderer
                            model={statementModel}
                        />
                    </div>
                    {docEnabled && !isParameterTabEnabled && (
                        <InlineDocumentation documentationHandler={documentationHandler}/>
                    )}
                    <Diagnostics/>
                </div>
            </div>
            <div className={statementEditorClasses.suggestionsSection} data-testid="suggestions-section">
                <HelperPane docExpandClicked={docExpandClicked} paramTabHandler={paramTabHandler}/>
            </div>
        </>
    );
}
