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
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Box, Typography } from "@material-ui/core";
import classNames from 'classnames';

import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
import { Context } from '../../../../../Contexts/Diagram';
import { STSymbolInfo } from "../../../../../Definitions";
import { STModification } from "../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../utils/mixins";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName, getActionReturnType } from "../../../Portals/utils";
import { wizardStyles } from "../../style";
import { ConnectorOperation } from '../ConnectorForm';

export interface SingleFormProps {
    operations: ConnectorOperation[];
    showConnectionName: boolean;
    connectionDetails: ConnectorConfig;
    mutationInProgress: boolean;
    isNewConnectorInitWizard?: boolean;
    functionDefInfo: Map<string, FunctionDefinitionInfo>;
    selectedOperation?: string;
    onSave: (sourceModifications?: STModification[]) => void;
}

export function SingleForm(props: SingleFormProps) {
    const { state } = useContext(Context);
    const { stSymbolInfo } = state;
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const { operations, selectedOperation, showConnectionName, onSave, connectionDetails,
            mutationInProgress, isNewConnectorInitWizard, functionDefInfo } = props;
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();

    const [ activeOperation, setActiveOperation ] = useState(selectedOperation);
    const [ formFields, setFormFields ] = useState<FormField[]>(connectionDetails.action?.fields);
    const [ validForm, setValidForm ] = useState(false);
    const [ validName, setValidName ] = useState(true);
    const [ defaultResponseVarName, setDefaultResponseVarName ] = useState<string>(connectionDetails.action?.returnVariableName);
    const [ responseVarError, setResponseVarError ] = useState("");

    const operationReturnType = getActionReturnType(activeOperation, functionDefInfo);

    if (!activeOperation) {
        functionDefInfo.forEach((field, operation) => {
            if (operation !== "init" && !activeOperation) {
                // set first operation as active operation
                // single forms will only show one operation
                setActiveOperation(operation);
                if (!formFields || formFields?.length === 0) {
                    // set new action
                    const actionInfo = new ActionConfig();
                    actionInfo.name = operation;
                    actionInfo.fields = field.parameters;
                    connectionDetails.action = actionInfo;
                    // update form field list
                    setFormFields(field.parameters);
                    if (!defaultResponseVarName) {
                        // setup response variable
                        const varName = genVariableName(connectionDetails.action.name + "Response", getAllVariables(symbolInfo));
                        setDefaultResponseVarName(varName);
                    }
                }
                return;
            }
        });
    }

    useEffect(() => {
        if (connectionDetails.action) {
            connectionDetails.action.returnVariableName = defaultResponseVarName;
        }
    }, [ defaultResponseVarName ]);

    const handleOnSave = () => {
        // const config = connectionDetails;
        onSave();
    };

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const onNameChange = (text: string) => {
        setValidName((text !== '') && nameRegex.test(text));
        setDefaultResponseVarName(text);
    };

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value, defaultResponseVarName, state);
            if (varValidationResponse?.error) {
                setResponseVarError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    let responseVariableHasReferences: boolean = false;

    if (!isNewConnectorInitWizard) {
        const symbolRefArray = symbolInfo.variableNameReferences.get(connectionDetails.action.returnVariableName);
        responseVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    const validateForm = (isRequiredFilled: boolean) => {
        setValidForm(isRequiredFilled);
    };

    let isSaveButtonDisabled = showConnectionName ? (!validForm || mutationInProgress || !validName) :
        !validForm || mutationInProgress;
    if (formFields && (formFields.length === 0) && validName && !mutationInProgress) {
        isSaveButtonDisabled = false;
    }

    const addResponseVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.addResponseVariable.placeholder",
        defaultMessage: "Enter response variable name"
    });

    const addResponseVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.addResponseVariable.label",
        defaultMessage: "Response Variable Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    const connectorOperationsTooltipMessages = {
        responseVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.connectorOperations.tooltip.title",
                defaultMessage: "Add a valid name for the response variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, Object."
            }),
        }
    };

    return (
        <div>
            { (activeOperation && (
                <div>
                    <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                        <div className={classes.fullWidth}>
                            <>
                                <p className={wizardClasses.subTitle}>Operation</p>
                                <Box border={1} borderRadius={5} className={wizardClasses.box}>
                                    <Typography variant="subtitle2">
                                        {operations.find(operation => operation.name === activeOperation)?.label || activeOperation}
                                    </Typography>
                                </Box>
                            </>
                            <div className={wizardClasses.formWrapper}>
                                { formFields && formFields.length > 0 ? (
                                    <Form fields={formFields} onValidate={validateForm} />
                                ) : null
                                }
                            </div>
                            { operationReturnType?.hasReturn && (
                                <FormTextInput
                                    customProps={ {
                                        validate: validateNameValue,
                                        tooltipTitle: connectorOperationsTooltipMessages.responseVariableName.title,
                                        disabled: responseVariableHasReferences
                                    } }
                                    defaultValue={defaultResponseVarName}
                                    placeholder={addResponseVariablePlaceholder}
                                    onChange={onNameChange}
                                    label={addResponseVariableLabel}
                                    errorMessage={responseVarError}
                                />
                            ) }
                        </div>
                    </div>
                    <div className={classes.wizardBtnHolder}>
                        <PrimaryButton
                            className={wizardClasses.buttonSm}
                            text={saveConnectionButtonText}
                            fullWidth={false}
                            disabled={isSaveButtonDisabled}
                            onClick={handleOnSave}
                        />
                    </div>
                </div>
            )) }
        </div>
    );
}

