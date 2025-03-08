/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";

import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { Typography } from "@wso2-enterprise/ui-toolkit";

import { TypeProps } from "../../ParameterBranch";
import { useHelperPaneStyles } from "../../styles";
import { MemoizedParameterBranch } from "../../ParameterBranch";
import { isRequiredParam } from "../../utils";

export default function RecordType(props: TypeProps) {
    const { param, depth, onChange } = props;
    const helperStyleClass = useHelperPaneStyles();
    const requiredParam = isRequiredParam(param) && depth > 1; // Only apply required param logic after depth 1
    if (requiredParam) {
        param.selected = true;
    }

    const [paramSelected, setParamSelected] = useState(param.selected || requiredParam);

    const toggleParamCheck = () => {
        if (!requiredParam) {
            param.selected = !paramSelected;
            setParamSelected(!paramSelected);
            onChange();
        }
    };

    return (
        <div className={param.documentation ? helperStyleClass.docListCustom : helperStyleClass.docListDefault}>
            <div className={helperStyleClass.listItemMultiLine}>
                <div className={helperStyleClass.listItemHeader}>
                    <VSCodeCheckbox
                        checked={paramSelected}
                        {...(requiredParam && { disabled: true })}
                        onClick={toggleParamCheck}
                        className={helperStyleClass.parameterCheckbox}
                    />
                    <Typography
                        variant="body3"
                        sx={{ margin: '0px 5px' }}
                    >
                        {param.name}
                    </Typography>
                    {param.typeInfo && (
                        <Typography
                            className={helperStyleClass.suggestionDataType}
                            variant="body3"
                        >
                            {(param.optional || param.defaultable) && " (Optional)"} {param.typeInfo.name}
                        </Typography>
                    )}
                </div>
                {param.documentation && (
                    <div className={helperStyleClass.documentationWrapper}>
                        <Typography
                            className={helperStyleClass.paramTreeDescriptionText}
                            variant="body3"
                        >
                            {param.documentation}
                        </Typography>
                    </div>
                )}
                {paramSelected && param.fields?.length > 0 && (
                    <div className={helperStyleClass.listItemBody}>
                        <MemoizedParameterBranch parameters={param.fields} depth={depth + 1} onChange={onChange} />
                    </div>
                )}
            </div>
        </div>
    );
}
