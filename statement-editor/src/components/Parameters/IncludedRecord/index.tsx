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
import React, { useContext } from "react";

import { Checkbox, ListItem, ListItemText } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStmtEditorHelperPanelStyles } from "../../styles";

interface IncludedRecordProps {
    param: ParameterInfo,
    handleCheckboxClick: (param: ParameterInfo) => () => void
    key?: number,
}

// tslint:disable: jsx-no-multiline-js
export function IncludedRecord(props: IncludedRecordProps){
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { param, handleCheckboxClick, key } = props;
    const {
        modelCtx: {
            currentModel : {
                model
            }
        }
    } = useContext(StatementEditorContext);

    return (
        <>
            {param.modelPosition && (
                <ListItem
                    key={key}
                    className={stmtEditorHelperClasses.docListDefault}
                    style={model && param ?
                        { backgroundColor: JSON.stringify(model.position) === JSON.stringify(param.modelPosition) ?
                                "rgba(204,209,242,0.61)" : 'inherit'} : undefined }
                >
                    <Checkbox
                        classes={{
                            root: stmtEditorHelperClasses.parameterCheckbox,
                            checked: stmtEditorHelperClasses.checked
                        }}
                        style={{ flex: 'inherit' }}
                        checked={true}
                        onClick={handleCheckboxClick(param)}
                    />
                    <ListItemText
                        className={stmtEditorHelperClasses.docListItemText}
                        primary={param.name}
                    />
                </ListItem>
            )}
        </>
    );
}
