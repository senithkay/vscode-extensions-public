/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { NodePosition, ServiceDeclaration } from '@ballerina/syntax-tree';
import { Box, FormControl, FormHelperText, Typography } from '@material-ui/core';

import { VariableIcon } from '../../../../../../assets/icons';
import { PrimaryButton } from '../../Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../Elements/Button/SecondaryButton';
import CheckBoxGroup from '../../Elements/CheckBox';
import { SelectDropdownWithButton } from '../../Elements/DropDown/SelectDropdownWithButton';
import ExpressionEditor from '../../Elements/ExpressionEditor';
import { RadioControl } from '../../Elements/RadioControl/FormRadioControl';
import { FormTextInput } from '../../Elements/TextField/FormTextInput';
import { useStyles as useFormStyles } from "../style";

interface ModuleVariableFormProps {
    model?: ServiceDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

enum VariableQualifiers {
    NONE = 'None',
    FINAL = 'final',
    CONFIGURABLE = 'configurable',
}

export function ModuleVariableForm(props: ModuleVariableFormProps) {
    const formClasses = useFormStyles();
    const { onSave, onCancel } = props;
    const variableTypes: string[] = ["var", "int", "float", "boolean", "string", "json", "xml"];

    const handleOnSave = () => {
        onSave();
    }

    return (
        <FormControl data-testid="module-variable-config-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <VariableIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Variable</Box>
                    </Typography>
                </div>
            </div>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ModuleVarDecl.configureNewListener"
                        defaultMessage="Access Modifier :"
                    />
                </FormHelperText>
            </div>
            <CheckBoxGroup
                values={["public"]}
                defaultValues={['']}
                onChange={() => { }}
            />
            <SelectDropdownWithButton
                defaultValue={''}
                customProps={{
                    disableCreateNew: true,
                    values: variableTypes,
                    onOpenSelect: () => { },
                    onCloseSelect: () => { },
                }}
                label={"Select type"}
                onChange={() => { }}
            />
            <FormTextInput
                customProps={{
                    // validate: validateNameValue
                }}
                defaultValue={''}
                onChange={() => { }}
                label={"Variable Name"}
                errorMessage={"Invalid Variable Name"}
                placeholder={"Enter Variable Name"}
            />
            <ExpressionEditor
                model={{ name: "Value expression", type: 'int' }}
                customProps={{ validate: () => { } }}
                onChange={() => { }}
            />
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.configForms.ModuleVarDecl.variableQualifier"
                        defaultMessage="Variable Qualifiers :"
                    />
                </FormHelperText>
            </div>
            <RadioControl
                onChange={() => { }}
                defaultValue={''}
                customProps={{
                    collection: Object.values(VariableQualifiers),
                    disabled: false
                }}
            />
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={false}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}