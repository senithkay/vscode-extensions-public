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

import { TypeProps } from "../..";
import { useStmtEditorHelperPanelStyles } from "../../../../styles";
import { ParameterBranch } from "../../ParameterBranch";
import { isAllDefaultableFields, isRequiredParam } from "../../utils";

export default function InclusionType(props: TypeProps) {
    const { param, depth, onChange } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const requiredParam = isRequiredParam(param);
    const isAllIncludedParamDefaultable = isAllDefaultableFields(param.inclusionType?.fields);

    const [paramSelected, setParamSelected] = useState(
        param.selected || (requiredParam && !isAllIncludedParamDefaultable)
    );


    const toggleParamCheck = () => {
        param.selected = !paramSelected;
        param.inclusionType.selected = !paramSelected;
        setParamSelected(!paramSelected);
        onChange();
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
                        disabled={requiredParam && !isAllIncludedParamDefaultable}
                        onClick={toggleParamCheck}
                    />
                    <ListItemText className={stmtEditorHelperClasses.docListItemText} primary={param.name} />
                    {param.inclusionType?.typeInfo && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramDataType}
                            primary={(
                                <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                    {(param.optional || param.defaultable) && " (Optional)"} *
                                    {param.inclusionType.typeInfo.name}
                                </Typography>
                            )}
                        />
                    )}
                    {param.documentation && (
                        <ListItemText
                            className={stmtEditorHelperClasses.docParamDescriptionText}
                            primary={" : " + param.documentation}
                        />
                    )}
                </div>
                {paramSelected && param.inclusionType?.fields?.length > 0 && (
                    <div className={stmtEditorHelperClasses.listItemBody}>
                        <ParameterBranch
                            parameters={param.inclusionType.fields}
                            depth={depth + 1}
                            onChange={onChange}
                        />
                    </div>
                )}
            </div>
        </ListItem>
    );
}
