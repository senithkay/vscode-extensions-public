/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";

import { TypeProps } from "../..";
import { useStmtEditorHelperPanelStyles } from "../../../../styles";
import { MemoizedParameterBranch } from "../../ParameterBranch";
import { isRequiredParam } from "../../utils";

export default function RecordType(props: TypeProps) {
    const { param, depth, onChange } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const requiredParam = isRequiredParam(param);

    const [paramSelected, setParamSelected] = useState(param.selected || requiredParam);

    const toggleParamCheck = () => {
        if (!requiredParam) {
            param.selected = !paramSelected;
            setParamSelected(!paramSelected);
            onChange();
        }
    };

    return (
        <ListItem className={stmtEditorHelperClasses.docListDefault}>
            <div className={stmtEditorHelperClasses.listItemMultiLine} data-testid="record-arg">
                <div className={stmtEditorHelperClasses.listItemHeader}>
                    <Checkbox
                        classes={{
                            root: requiredParam
                                ? stmtEditorHelperClasses.disabledCheckbox
                                : stmtEditorHelperClasses.parameterCheckbox,
                            checked: stmtEditorHelperClasses.checked,
                        }}
                        checked={paramSelected}
                        disabled={requiredParam}
                        onClick={toggleParamCheck}
                        data-testid="arg-check"
                    />
                    <ListItemText
                        className={stmtEditorHelperClasses.docListItemText}
                        primary={param.name}
                        data-testid="arg-name"
                    />
                    {param.typeInfo && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramDataType}
                            data-testid="arg-type"
                            primary={(
                                <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                    {(param.optional || param.defaultable) && " (Optional)"} {param.typeInfo.name}
                                </Typography>
                            )}
                        />
                    )}
                    {param.documentation && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramTreeDescriptionText}
                            primary={" : " + param.documentation}
                            data-testid="arg-documentation"
                        />
                    )}
                </div>
                {paramSelected && param.fields?.length > 0 && (
                    <div className={stmtEditorHelperClasses.listItemBody}>
                        <MemoizedParameterBranch parameters={param.fields} depth={depth + 1} onChange={onChange} />
                    </div>
                )}
            </div>
        </ListItem>
    );
}
