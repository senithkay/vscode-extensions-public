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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import {
    FormActionButtons,
    FormElementProps,
    FormHeaderSection
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ListenerDeclaration, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { ListenerFormIcon } from "../../../../../assets/icons";
import { PrimaryButton } from "../../../../../components/Buttons/PrimaryButton";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { createImportStatement, createListenerDeclartion } from "../../../../utils/modification-util";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { LowCodeExpressionEditor } from "../../FormFieldComponents/LowCodeExpressionEditor";
import { TextLabel } from "../../FormFieldComponents/TextField/TextLabel";
import { VariableNameInput } from "../Components/VariableNameInput";

import { isListenerConfigValid } from "./util";
import { ListenerConfig } from "./util/types";

interface ListenerConfigFormProps {
    model?: ListenerDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType?: string;
    isLastMember?: boolean
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave, formType, isLastMember } = props;
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    let defaultState: ListenerConfig;

    if (model && STKindChecker.isListenerDeclaration(model)) {
        defaultState = {
            listenerName: model.variableName.value,
            listenerPort: model.initializer.parenthesizedArgList.arguments[0].source,
            listenerType: model.typeDescriptor.modulePrefix.value.toUpperCase(),
            isExpressionValid: true
        };
    } else {
        defaultState = {
            listenerName: '',
            listenerPort: '',
            listenerType: 'HTTP',
            isExpressionValid: false
        }
    }

    const [config, setCofig] = useState<ListenerConfig>(defaultState);
    const saveBtnEnabled = isListenerConfigValid(config);

    const onListenerNameChange = (listenerName: string) => {
        setCofig(prev => ({
            ...prev,
            listenerName
        }));
    }

    const onListenerPortChange = (listenerPort: string) => {
        setCofig(prev => ({
            ...prev,
            listenerPort
        }));
    }

    const handleOnSave = () => {
        let isNewListener: boolean;
        if (model) {
            isNewListener = false;
            const modelPosition = model.position as NodePosition;
            const updatePosition = {
                startLine: modelPosition.startLine,
                startColumn: 0,
                endLine: modelPosition.endLine,
                endColumn: modelPosition.endColumn
            };

            modifyDiagram([
                createListenerDeclartion(
                    config,
                    updatePosition,
                    isNewListener
                )
            ]);
        } else {
            isNewListener = true;
            modifyDiagram([
                createImportStatement('ballerina', 'http', { startColumn: 0, startLine: 0 }),
                createListenerDeclartion(config, targetPosition, isNewListener, isLastMember)
            ]);
        }
        onSave();
    }

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
        setCofig({
            ...config,
            isExpressionValid: !isInValid
        });
    }

    const portNumberExpressionEditorProps: FormElementProps<ExpressionEditorProps>  = {
        model: {
            name: "listenerPort",
            displayName: "Listener Port",
            typeName: "int",
            value: config?.listenerPort
        },
        customProps: {
            validate: updateExpressionValidity,
            interactive: true,
            statementType: 'int',
            editPosition: {
                startLine: model ? model.position.startLine : targetPosition.startLine,
                endLine: model ? model.position.startLine : targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            },
            initialDiagnostics: model?.initializer?.typeData?.diagnostics
        },
        onChange: onListenerPortChange,
        defaultValue: config.listenerPort
    };

    const listenerPortInputComponent = (
        <LowCodeExpressionEditor
            {...portNumberExpressionEditorProps}
        />
    )

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = model.variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    return (
        <FormControl data-testid="listener-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.connectorForms.HTTP.title"}
                defaultMessage={"Listener"}
                formType={formType}
            />
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.connectorForms.HTTP.listenerType"
                        defaultMessage="Listener Type :"
                    />
                    <SelectDropdownWithButton
                        customProps={{ values: ['HTTP'], disableCreateNew: true }}
                        defaultValue={config.listenerType}
                        placeholder="Select Type"
                    />
                    <VariableNameInput
                        displayName={'Listener Name'}
                        value={config.listenerName}
                        onValueChange={onListenerNameChange}
                        validateExpression={updateExpressionValidity}
                        position={namePosition}
                        isEdit={!!model}
                        initialDiagnostics={model?.variableName?.typeData?.diagnostics}
                    />
                    {listenerPortInputComponent}
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText="Save"
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={saveBtnEnabled}
            />
        </FormControl>
    )
}
