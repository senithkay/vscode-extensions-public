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
import React, { useEffect, useState } from "react";

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { isRequiredParam, TypeProps } from "../..";
import SelectDropdown from "../../../../Dropdown";
import { useStmtEditorHelperPanelStyles } from "../../../../styles";
import { ParameterBranch } from "../../ParameterBranch";

export default function UnionType(props: TypeProps) {
    const { param, depth } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();

    const requiredParam = isRequiredParam(param);
    const memberTypes = param.members?.map((field) => getUnionParamName(field));

    const [paramSelected, setParamSelected] = useState(requiredParam);
    const [selectedMemberType, setSelectedMemberType] = useState(memberTypes[0]);
    const [parameter, setParameter] = useState<FormField>();

    useEffect(() => {
        const selectedMember = param.members.find((field) => getUnionParamName(field) === selectedMemberType);
        setParameter(selectedMember);
    }, [selectedMemberType]);

    const handleMemberType = (type: string) => {
        setSelectedMemberType(type);
    };

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
                    {(param.optional || param.defaultable) && (
                        <ListItemText
                            className={stmtEditorHelperClasses.paramDataType}
                            primary={(
                                <Typography className={stmtEditorHelperClasses.suggestionDataType}>
                                    {"(Optional)"}
                                </Typography>
                            )}
                        />
                    )}
                    <div className={stmtEditorHelperClasses.listDropdownWrapper}>
                        <SelectDropdown
                            values={memberTypes}
                            defaultValue={memberTypes[0]}
                            onSelection={handleMemberType}
                        />
                    </div>
                    {param.description !== undefined && (
                        <ListItemText
                            className={stmtEditorHelperClasses.docParamDescriptionText}
                            primary={" : " + param.description}
                        />
                    )}
                </div>
                {paramSelected && parameter && (
                    <div className={stmtEditorHelperClasses.listItemBody}>
                        <ParameterBranch parameters={[parameter]} depth={depth + 1} />
                    </div>
                )}
            </div>
        </ListItem>
    );
}

export function getUnionParamName(param: FormField) {
    return param.name || param.typeName;
}
