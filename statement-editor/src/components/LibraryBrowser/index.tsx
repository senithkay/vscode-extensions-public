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

import { LibraryKind } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { LibrariesList } from "../Libraries/LibrariesList";
import { useStatementEditorStyles } from "../styles";

export function LibraryBrowser() {
    const statementEditorClasses = useStatementEditorStyles();
    const stmtCtx = useContext(StatementEditorContext);

    const [libraries, setLibraries] = useState([]);

    const langLibExpandButton = async () => {
        const response = await stmtCtx.getLibrariesList("slbeta5", LibraryKind.langLib);

        if (response) {
            setLibraries(response.librariesList);
        }
    };

    const standardLibExpandButton = async () => {
        const response = await stmtCtx.getLibrariesList("slbeta5", LibraryKind.stdLib);

        if (response) {
            setLibraries(response.librariesList);
        }
    };

    return (
        <div className={statementEditorClasses.LibraryBrowser}>
            <div className={statementEditorClasses.LibraryDropdown}>
                <span className={statementEditorClasses.subHeader}>Libraries</span>
                <button
                    onClick={langLibExpandButton}
                >
                    All
                </button>
                <button
                    onClick={langLibExpandButton}
                >
                    Language
                </button>
                <button
                    onClick={standardLibExpandButton}
                >
                    Standard
                </button>
            </div>
            {<LibrariesList libraries={libraries} />}
        </div>
    );
}
