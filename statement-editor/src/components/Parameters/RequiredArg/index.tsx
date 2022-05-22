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

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";
// tslint:disable: jsx-no-multiline-js
interface RequiredArgProps {
    param : ParameterInfo
    value : number
    checkedList : any[]
}
export function RequiredArg(props : RequiredArgProps){
    const { param, value, checkedList } = props;
    const statementEditorHelperClasses = useStmtEditorHelperPanelStyles();


    return(
        <ListItem key={value} className={statementEditorHelperClasses.requiredArgList}>
            <Checkbox
                classes={{
                    root : statementEditorHelperClasses.disabledCheckbox,
                    checked : statementEditorHelperClasses.checked
                }}
                checked={checkedList.indexOf(value) !== -1}
                disabled={true}
            />
            <ListItemText
                className={statementEditorHelperClasses.docListItemText}
                primary={param.name}
            />
            <ListItemText
                className={statementEditorHelperClasses.paramDataType}
                primary={(
                    <Typography className={statementEditorHelperClasses.suggestionDataType}>
                        {param.type}
                    </Typography>
                )}
            />
            {param.description !== undefined && (
                <ListItemText
                    className={statementEditorHelperClasses.docListItemText}
                    primary={" : " + param.description}
                />
            )}
        </ListItem>
    );
}
