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
import React, { useState } from "react";

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";

import { isRequiredParam, TypeProps } from "../..";
import { useStmtEditorHelperPanelStyles } from "../../../../styles";

export default function CustomType(props: TypeProps) {
    const { param } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const requiredParam = isRequiredParam(param);

    const [paramSelected, setParamSelected] = useState(requiredParam);

    const handleParamCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!requiredParam) {
            setParamSelected(event.target.checked);
        }
    };

    return (
        <ListItem className={stmtEditorHelperClasses.docListDefault}>
            <div className={stmtEditorHelperClasses.listItemMultiLine}>
                <div className={stmtEditorHelperClasses.listItemHeader}>
                    <Checkbox
                        classes={{
                            root: stmtEditorHelperClasses.parameterCheckbox,
                            checked: stmtEditorHelperClasses.checked,
                        }}
                        checked={paramSelected}
                        disabled={requiredParam}
                        onChange={handleParamCheck}
                    />
                    <ListItemText className={stmtEditorHelperClasses.docListItemText} primary={param.name} />
                    <ListItemText
                        className={stmtEditorHelperClasses.paramDataType}
                        primary={(
                            <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                {param.optional || param.defaultable ? param.typeName + " (Optional)" : param.typeName}
                            </Typography>
                        )}
                    />
                    {param.description !== undefined && (
                        <ListItemText
                            className={stmtEditorHelperClasses.docParamDescriptionText}
                            primary={" : " + param.description}
                        />
                    )}
                </div>
            </div>
        </ListItem>
    );
}
