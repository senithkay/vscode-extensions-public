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
import React, { useRef, useState } from "react";

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { TypeProps } from "../..";
import SelectDropdown from "../../../../Dropdown";
import { useStmtEditorHelperPanelStyles } from "../../../../styles";
import { ParameterBranch } from "../../ParameterBranch";
import { getSelectedUnionMember, isRequiredParam } from "../../utils";

export default function UnionType(props: TypeProps) {
    const { param, depth, onChange } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();

    const requiredParam = isRequiredParam(param);
    const memberTypes = param.members?.map((field) => getUnionParamName(field));
    const initSelectedMember = getSelectedUnionMember(param);

    const [paramSelected, setParamSelected] = useState(param.selected || requiredParam);
    const [selectedMemberType, setSelectedMemberType] = useState(getUnionParamName(initSelectedMember));
    const [parameter, setParameter] = useState<FormField>(initSelectedMember);
    const initialRendering = useRef(false);

    const updateFormFieldMemberSelection = (unionField: FormField) => {
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
        <ListItem className={stmtEditorHelperClasses.docListDefault}>
            <div className={stmtEditorHelperClasses.listItemMultiLine} data-testid="union-arg">
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
                    {(param.optional || param.defaultable) && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramDataType}
                            data-testid="arg-type"
                            primary={(
                                <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                    {"(Optional)"}
                                </Typography>
                            )}
                        />
                    )}
                    <div className={stmtEditorHelperClasses.listDropdownWrapper} data-testid="arg-dropdown">
                        <SelectDropdown
                            className={stmtEditorHelperClasses.listSelectDropDown}
                            values={memberTypes}
                            defaultValue={selectedMemberType}
                            onSelection={handleMemberType}
                        />
                    </div>
                    {param.documentation && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramTreeDescriptionText}
                            primary={" : " + param.documentation}
                            data-testid="arg-documentation"
                        />
                    )}
                </div>
                {paramSelected && parameter && (
                    <div className={stmtEditorHelperClasses.listItemBody}>
                        <ParameterBranch parameters={[parameter]} depth={depth + 1} onChange={onChange} />
                    </div>
                )}
            </div>
        </ListItem>
    );
}

export function getUnionParamName(param: FormField) {
    return param.name || param.typeName;
}
