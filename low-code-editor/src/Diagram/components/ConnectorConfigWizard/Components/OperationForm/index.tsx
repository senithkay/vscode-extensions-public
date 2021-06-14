/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
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
import { OperationDropdown } from '../OperationDropdown';

export interface OperationFormProps {
    operations: ConnectorOperation[];
    selectedOperation: string;
    showConnectionName: boolean;
    onSave: (sourceModifications?: STModification[]) => void;
    connectionDetails: ConnectorConfig;
    mutationInProgress: boolean;
    onConnectionChange: () => void;
    isNewConnectorInitWizard?: boolean;
    functionDefInfo: Map<string, FunctionDefinitionInfo>;
}

export function OperationForm(props: OperationFormProps) {
    const { state } = useContext(Context);
    const { stSymbolInfo } = state;
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const { operations, selectedOperation, showConnectionName, onSave, connectionDetails, onConnectionChange,
            mutationInProgress, isNewConnectorInitWizard, functionDefInfo } = props;
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();
    const operationLabelMaxLength = 32;

    const [selectedOperationState, setSelectedOperationState] = useState(selectedOperation);
    const [responseVarName, setResponseVarName] = useState<string>(connectionDetails?.action?.returnVariableName);
    const frmFields: FormField[] = connectionDetails?.action?.fields;
    const [formFields, setFormFields] = useState(frmFields);

    const operationReturnType = getActionReturnType(selectedOperationState, functionDefInfo);

    const handleOnSave = () => {
        const config = connectionDetails;
        onSave();
    };

    const handleOperationChange = (operation: string) => {
        setSelectedOperationState(operation);
        if (operation) {
            const derivedFormFields = functionDefInfo.get(operation).parameters;
            connectionDetails.action.name = operation;
            connectionDetails.action.fields = derivedFormFields;
            setFormFields(derivedFormFields);
            if (!defaultResponseVarName) {
                connectionDetails.action.returnVariableName = genVariableName(operation + "Response",
                    getAllVariables(symbolInfo));
                setResponseVarName(connectionDetails.action.returnVariableName);
            }
        }
    }

    const onOperationChange = () => {
        setSelectedOperationState(undefined);
    };

    const [validForm, setValidForm] = useState(false);
    const [validName, setValidName] = useState(true);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(responseVarName ||
        connectionDetails.action.returnVariableName);
    const [responseVarError, setResponseVarError] = useState("");

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const onNameChange = (text: string) => {
        setValidName((text !== '') && nameRegex.test(text));
        connectionDetails.action.returnVariableName = text;
        setResponseVarName(text);
    };
    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value,
                defaultResponseVarName, state);
            setResponseVarError(varValidationResponse.message);
            if (varValidationResponse?.error) {
                return false;
            }
        }
        return true;
    };

    let responseVariableHasReferences: boolean = false;

    if (!isNewConnectorInitWizard) {
        const symbolRefArray = symbolInfo.variableNameReferences.get(responseVarName);
        responseVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    connectionDetails.action.returnVariableName = responseVarName;

    const validateForm = (isRequiredFilled: boolean) => {
        setValidForm(isRequiredFilled);
    };

    let isSaveButtonDisabled = showConnectionName ? (!validForm || mutationInProgress || !validName ||
        !(responseVarError === "" || responseVarError === undefined)) : !validForm || mutationInProgress;
    if (formFields && (formFields.length === 0) && validName &&
        (responseVarError === "" || responseVarError === undefined) && !mutationInProgress) {
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
                defaultMessage: "Add a valid name for the response variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, Object, etc."
            }),
    }
    };

    const operationLabel = operations.find(operation => operation.name === selectedOperationState)?.label;

    return (
        <div>
            {(!selectedOperationState || selectedOperationState === "") && <OperationDropdown operations={operations} onOperationSelect={handleOperationChange} connectionDetails={connectionDetails} showConnectionName={showConnectionName} />}
            {(selectedOperationState && (
                <div>
                    <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                        <div className={classes.fullWidth}>
                            <>
                                <p className={wizardClasses.subTitle}>Operation</p>
                                <Box border={1} borderRadius={5} className={wizardClasses.box}>
                                    <Typography variant="subtitle2">
                                        {(operationLabel.length > operationLabelMaxLength ? operationLabel.slice(0, operationLabelMaxLength) + "..." : operationLabel)
                                            || (selectedOperationState.length > operationLabelMaxLength ? selectedOperationState.slice(0, operationLabelMaxLength) + "..." : selectedOperationState)}
                                    </Typography>
                                    <IconButton
                                        color="primary"
                                        classes={{
                                            root: wizardClasses.changeConnectionBtn
                                        }}
                                        onClick={onOperationChange}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            </>
                            <div className={wizardClasses.formWrapper}>
                                {formFields && formFields.length > 0 ? (
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
                                    defaultValue={responseVarName}
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
            )
            )
            }
        </div>
    );
}

