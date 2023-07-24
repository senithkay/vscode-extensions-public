/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useContext } from "react";

import { Checkbox, ListItem, ListItemText } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getParamHighlight } from "../../../utils";
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
                    style={getParamHighlight(model, param)}
                    data-testid="included-record-arg"
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
