/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useRef, useState } from "react";

import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { TypeField } from "@wso2-enterprise/ballerina-core";
import { Dropdown, Typography } from "@wso2-enterprise/ui-toolkit";

import { TypeProps } from "../../ParameterBranch";
import { useHelperPaneStyles } from "../../styles";
import { ParameterBranch } from "../../ParameterBranch";
import { getSelectedUnionMember, isRequiredParam } from "../../utils";

export default function UnionType(props: TypeProps) {
    const { param, depth, onChange } = props;
    const helperStyleClass = useHelperPaneStyles();

    const requiredParam = isRequiredParam(param) && depth > 1; // Only apply required param logic after depth 1
    if (requiredParam) {
        param.selected = true;
    }
    const memberTypes = param.members?.map((field, index) => ({ id: index.toString(), value: getUnionParamName(field) }));
    const initSelectedMember = getSelectedUnionMember(param);

    const [paramSelected, setParamSelected] = useState(param.selected || requiredParam);
    const [selectedMemberType, setSelectedMemberType] = useState(getUnionParamName(initSelectedMember));
    const [parameter, setParameter] = useState<TypeField>(initSelectedMember);
    const initialRendering = useRef(false);

    if (!(param.members && param.members.length > 0)) {
        return <></>;
    }

    const updateFormFieldMemberSelection = (unionField: TypeField) => {
        const unionFieldName = getUnionParamName(unionField);
        param.members.forEach((field) => {
            field.selected = getUnionParamName(field) === unionFieldName;
        });
    };

    const handleMemberType = (type: string) => {
        const selectedMember = param.members.find((field) => getUnionParamName(field) === type);
        updateFormFieldMemberSelection(selectedMember);
        setSelectedMemberType(type);
        setParameter(selectedMember);
        if (initialRendering.current) {
            // INFO: avoid onChange call in initial rendering to prevent multiple rendering.
            onChange();
        }
        initialRendering.current = true;
    };

    const toggleParamCheck = () => {
        param.selected = !paramSelected;
        setParamSelected(!paramSelected);
        onChange();
    };

    return (
        <div className={helperStyleClass.docListDefault}>
            <div className={helperStyleClass.listItemMultiLine} data-testid="union-arg">
                <div className={helperStyleClass.listItemHeader}>
                    <VSCodeCheckbox
                        checked={paramSelected}
                        {...(requiredParam && { disabled: true })}
                        onClick={toggleParamCheck}
                        className={helperStyleClass.parameterCheckbox}
                        data-testid="arg-check"
                    />
                    <Typography
                        variant="body3"
                        sx={{ margin: '0px 5px' }}
                    >
                        {param.name}
                    </Typography>
                    {(param.optional || param.defaultable) && (
                        <Typography
                            className={helperStyleClass.suggestionDataType}
                            variant="body3"
                            data-testid="arg-type"
                        >
                            {"(Optional)"}
                        </Typography>
                    )}
                    <div className={helperStyleClass.listDropdownWrapper} data-testid="arg-dropdown">
                        <Dropdown
                            onValueChange={handleMemberType}
                            id="arg-dropdown"
                            value={selectedMemberType}
                            items={memberTypes}
                            data-testid="arg-dropdown-component"
                            sx={{ marginLeft: '5px', width: 'fit-content' }}
                        />
                    </div>
                </div>
                {param.documentation && (
                    <div className={helperStyleClass.documentationWrapper}>
                        <Typography
                            className={helperStyleClass.docParamDescriptionText}
                            variant="body3"
                            data-testid="arg-documentation"
                        >
                            {param.documentation}
                        </Typography>
                    </div>
                )}
                {paramSelected && parameter && (
                    <div className={helperStyleClass.listItemBody}>
                        <ParameterBranch parameters={[parameter]} depth={depth + 1} onChange={onChange} />
                    </div>
                )}
            </div>
        </div>
    );
}

export function getUnionParamName(param: TypeField) {
    return param ? param.name || param.typeName : "";
}
