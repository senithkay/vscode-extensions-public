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

import { ListenerDeclaration, NodePosition, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { ListenerFormIcon } from "../../../../assets/icons";
import { PrimaryButton } from "../../../../components/Buttons/PrimaryButton";
import { useDiagramContext } from "../../../../Contexts/Diagram";
import { createImportStatement, createListenerDeclartion } from "../../../utils/modification-util";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../Portals/ConfigForm/Elements/ExpressionEditor";
import { VariableNameInput } from "../../Portals/ConfigForm/forms/Components/VariableNameInput";
import { FormElementProps } from "../../Portals/ConfigForm/types";

import { useStyles } from "./style";
import { isListenerConfigValid } from "./util";
import { ListenerConfig } from "./util/types";

interface ListenerConfigFormProps {
    model?: ListenerDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useStyles();
    const { model, targetPosition, onCancel, onSave } = props;
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
    const saveBtnEnabled = !isListenerConfigValid(config);

    const onListenerNameChange = (listenerName: string) => {
        setCofig({
            ...config,
            listenerName
        });
    }

    const onListenerPortChange = (listenerPort: string) => {
        setCofig({
            ...config,
            listenerPort
        });
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
                createListenerDeclartion(config, targetPosition, isNewListener)
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

    const portNumberExpressionEditorProps: FormElementProps = {
        model: {
            name: "listenerPort",
            displayName: "Listener Port",
            typeName: "int"
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
            }
        },
        onChange: onListenerPortChange,
        defaultValue: config.listenerPort,
    };

    const listenerPortInputComponent = (
        <ExpressionEditor
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
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ListenerFormIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Listener</Box>
                    </Typography>
                </div>
            </div>

            <div className={formClasses.formWrapper}>
                <>
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerType"
                                defaultMessage="Listener Type :"
                            />
                        </FormHelperText>
                    </div>
                    <SelectDropdownWithButton
                        customProps={{ values: ['HTTP'], disableCreateNew: true }}
                        defaultValue={config.listenerType}
                        placeholder="Select Type"
                    />
                    <VariableNameInput
                        displayName={'Listener Name'}
                        value={defaultState.listenerName}
                        onValueChange={onListenerNameChange}
                        validateExpression={updateExpressionValidity}
                        position={namePosition}
                        isEdit={!!model}
                    />
                    {listenerPortInputComponent}
                </>
            </div>
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={saveBtnEnabled}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}
