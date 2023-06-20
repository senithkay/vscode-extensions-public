/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";

import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import HelpIcon from "../../assets/icons/HelpIcon";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorStyles } from "../styles";

export function Help() {
    const statementEditorClasses = useStatementEditorStyles();
    const {
        openExternalUrl
    } = useContext(StatementEditorContext);

    const openStatementEditorHelp = () => {
        openExternalUrl("https://wso2.com/choreo/docs/tutorials/construct-statements/");
    }

    return (
        <div className={statementEditorClasses.help}>
            <HelpIcon/>
            <StatementEditorHint
                content={"Refer the Statement Editor user guide"}
            >
                <div
                    onClick={openStatementEditorHelp}
                    className={statementEditorClasses.helpLink}
                >
                    Help
                </div>
            </StatementEditorHint>
        </div>
    );
}
