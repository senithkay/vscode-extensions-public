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

import React from "react";

import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import HelpIcon from "../../assets/icons/HelpIcon";
import { useStatementEditorStyles } from "../styles";

export function Help() {
    const statementEditorClasses = useStatementEditorStyles();

    return (
        <div className={statementEditorClasses.help}>
            <HelpIcon/>
            <StatementEditorHint
                content={"If you are new to Statement Editor, please refer the user guide"}
            >
                <a
                    target="_blank"
                    href="https://wso2.com/choreo/docs/get-started/quick-start-guide/"
                    className={statementEditorClasses.helpLink}
                >
                    Help
                </a>
            </StatementEditorHint>
        </div>
    );
}
