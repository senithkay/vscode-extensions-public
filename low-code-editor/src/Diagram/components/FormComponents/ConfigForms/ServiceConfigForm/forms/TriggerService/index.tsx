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
// tslint:disable: jsx-no-multiline-js
import React, { useReducer, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ListenerDeclaration, NodePosition, ServiceDeclaration, STKindChecker } from "@ballerina/syntax-tree";
import { FormHelperText } from "@material-ui/core";
import { SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classNames from "classnames";

import { PrimaryButton } from "../../../../../../../components/Buttons/PrimaryButton";
import { useDiagramContext } from "../../../../../../../Contexts/Diagram";
import { isServicePathValid } from "../../../../../../../utils/validator";
import { updateTriggerServiceDeclartion } from "../../../../../../utils/modification-util";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../FormFieldComponents/TextField/FormTextInput";
import { wizardStyles as useFormStyles } from "../../../style";

interface TriggerServiceFormProps {
    model?: ServiceDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

let TRIGGER_MODULE_QUALIFIER = '';
let TRIGGER_CHANNEL = '';

export function TriggerServiceForm(props: TriggerServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave } = props;
    const { props: { stSymbolInfo }, api: { code: { modifyDiagram } } } = useDiagramContext();
    const [listenerName, setListenerName] = useState<string>('');
    const [saveBtnDisabled, setSaveBtnDisabled] = useState<boolean>(true);

    if (model) {
        TRIGGER_MODULE_QUALIFIER = model.typeDescriptor.modulePrefix.value;
        TRIGGER_CHANNEL = model.typeDescriptor.modulePrefix.value + ":" + model.typeDescriptor.identifier.value;
    }

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) =>
            STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
            && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === TRIGGER_MODULE_QUALIFIER)
        .map(([key, value]) => key);

    const listenerSelectionCustomProps = {
        disableCreateNew: true, values: listenerList || [],
    }

    const onListenerSelect = (listener: string) => {
        setListenerName(listener);
        setSaveBtnDisabled(false);
    }

    const handleOnSave = () => {
        if (model) {
            const modelPosition = model.position as NodePosition;
            const openBracePosition = model.openBraceToken.position as NodePosition;
            const updatePosition = {
                startLine: modelPosition.startLine,
                startColumn: 0,
                endLine: openBracePosition.startLine,
                endColumn: openBracePosition.startColumn - 1
            };

            modifyDiagram([
                updateTriggerServiceDeclartion(
                    listenerName,
                    TRIGGER_CHANNEL,
                    updatePosition
                )
            ]);
        }
        onSave();
    }

    return (
        <>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.HTTP.configureNewListener"
                        defaultMessage="Configure Service :"
                    />
                </FormHelperText>
                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
            </div>
            <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.HTTP.selectlListener"
                        defaultMessage="Select Listener :"
                    />
                </FormHelperText>
                <SelectDropdownWithButton
                    customProps={listenerSelectionCustomProps}
                    onChange={onListenerSelect}
                    placeholder="Select Property"
                    defaultValue={listenerName}
                />
            </div>
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={saveBtnDisabled}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </>
    )
}
