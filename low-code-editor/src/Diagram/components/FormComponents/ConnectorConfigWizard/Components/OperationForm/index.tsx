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
import { ConnectorConfig, FormField, FunctionDefinitionInfo, PrimaryButton, STModification, STSymbolInfo  } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import classNames from 'classnames';

import {TooltipIcon} from "../../../../../../components/Tooltip";
import { Context } from '../../../../../../Contexts/Diagram';
import { getAllVariables } from "../../../../../utils/mixins";
import { checkVariableName, genVariableName, getActionReturnType } from "../../../../Portals/utils";
import { VariableTypeInput } from '../../../ConfigForms/Components/VariableTypeInput';
import { Form } from "../../../DynamicConnectorForm";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { ExpressionInjectablesProps } from '../../../FormGenerator';
import {generateDocUrl} from "../../../Utils";
import { wizardStyles } from "../../style";
import { ConnectorOperation } from '../ConnectorForm';
import { OperationDropdown } from '../OperationDropdown';


export interface OperationFormProps {
    operations: ConnectorOperation[];
    selectedOperation: string;
    showConnectionName: boolean;
    onSave: () => void;
    connectionDetails: ConnectorConfig;
    mutationInProgress: boolean;
    onConnectionChange: () => void;
    isNewConnectorInitWizard?: boolean;
    functionDefInfo: Map<string, FunctionDefinitionInfo>;
    expressionInjectables: ExpressionInjectablesProps;
    targetPosition?: NodePosition;
}

export function OperationForm(props: OperationFormProps) {
    const { props: { stSymbolInfo }, api: { webView: { showDocumentationView } } } = useContext(Context);
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const { operations, selectedOperation, showConnectionName, onSave, connectionDetails, onConnectionChange,
            mutationInProgress, isNewConnectorInitWizard, functionDefInfo, expressionInjectables, targetPosition } = props;
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();
    const operationLabelMaxLength = 32;

    const [selectedOperationState, setSelectedOperationState] = useState(selectedOperation);
    const [responseVarName, setResponseVarName] = useState<string>(connectionDetails?.action?.returnVariableName);
    const [returnType, setReturnType] = useState<string>(connectionDetails?.action?.returnType);
    const [validOutputValue, setValidOutputValue] = useState(false);

    const frmFields: FormField[] = connectionDetails?.action?.fields;
    const [formFields, setFormFields] = useState(frmFields);
    const [docUrl, setDocUrl] = useState("");
    const [tooltipInfo, setToolTipInfo] = useState("");

    const operationReturnType = getActionReturnType(selectedOperationState, functionDefInfo);

    const handleOnSave = () => {
        const config = connectionDetails;
        onSave();
    };

    const handleOperationChange = (operation: string) => {
        setSelectedOperationState(operation);
        if (operation) {
            const selectedFunction = functionDefInfo.get(operation);
            const derivedFormFields = selectedFunction.parameters;
            connectionDetails.action.isRemote = selectedFunction.isRemote;
            connectionDetails.action.name = operation;
            connectionDetails.action.fields = derivedFormFields;
            setFormFields(derivedFormFields);
            if (functionDefInfo.get(operation)?.documentation &&
                Array.isArray(functionDefInfo.get("init")?.parameters)) {
                const connector = (functionDefInfo.get("init")?.parameters[0]?.typeInfo);
                if (connector) {
                    const {orgName, moduleName} = connector;
                    if (orgName && moduleName) {
                        setDocUrl(generateDocUrl(orgName, moduleName, operation));
                        setToolTipInfo(functionDefInfo.get(operation).documentation);
                    }
                }

            }

            if (!defaultResponseVarName) {
                connectionDetails.action.returnVariableName = genVariableName(operation + "Response",
                    getAllVariables(symbolInfo));
                setResponseVarName(connectionDetails.action.returnVariableName);

            }
            setReturnType(connectionDetails.action.returnType);
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
                defaultResponseVarName, symbolInfo);
            setResponseVarError(varValidationResponse.message);
            if (varValidationResponse?.error) {
                return false;
            }
        }
        return true;
    };

    const onTypeChange = (text: string) => {
        connectionDetails.action.returnType = text;
        setReturnType(text);
    };

    let responseVariableHasReferences: boolean = false;

    if (!isNewConnectorInitWizard) {
        const symbolRefArray = symbolInfo.variableNameReferences.get(responseVarName);
        responseVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    connectionDetails.action.returnVariableName = responseVarName;
    connectionDetails.action.returnType = returnType;


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

    const addOutputTypeLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.addOutputType.label",
        defaultMessage: "Output Type Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    const outputTypeReplaceHint = intl.formatMessage({
        id: "lowcode.develop.configForms.outputTypeReplaceHint.text",
        defaultMessage: "Replace the default record{} type with an already defined custom record type"
    });

    const connectorOperationsTooltipMessages = {
        responseVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.connectorOperations.tooltip.title",
                defaultMessage: "Add a valid name for the response variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, and Object."
            }),
    }
    };

    const operationLabel = operations.find(operation => operation.name === selectedOperationState)?.label;

    const onValidateOutputType = (fieldName: string, isInvalid: boolean) => {
        setValidOutputValue(!isInvalid);
    };

    const hasTypeDesc = () => {
        let typeDescStatus = false;
        formFields.forEach((field) => {
            if (field.typeName.includes("typedesc")) {
                typeDescStatus = true;
            }
        })
        return typeDescStatus;
    }

    const onToolTipURL = () => {
        if (docUrl){
            showDocumentationView(docUrl);
        }
    }

    const docLinkComponent = (
        <>
            <p>{tooltipInfo}</p>
            <a className={classes.buttonLink} onClick={onToolTipURL}>more info</a>
        </>
    );

    const docToolTip = (
        <div className={classes.tooltipContainer}>
            <TooltipIcon title={docLinkComponent} />
        </div>
    );


    return (
        <div>
            {(!selectedOperationState || selectedOperationState === "") && <OperationDropdown operations={operations} onOperationSelect={handleOperationChange} connectionDetails={connectionDetails} showConnectionName={showConnectionName} />}
            {(selectedOperationState && (
                <div>
                    <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                        <div className={classes.fullWidth}>
                            <>
                                <div className={classes.operationTitle}>
                                    <p className={wizardClasses.subTitle}>Operation<span className={wizardClasses.titleLabelRequired}>*</span></p>
                                    {docUrl && docToolTip}
                                </div>
                                <Box border={1} borderRadius={5} className={wizardClasses.box}>
                                    <Typography variant="subtitle2">
                                        {(operationLabel?.length > operationLabelMaxLength ? operationLabel?.slice(0, operationLabelMaxLength) + "..." : operationLabel)
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
                                {formFields && formFields.length > 0 && (
                                    <Form
                                        fields={formFields}
                                        onValidate={validateForm}
                                        expressionInjectables={expressionInjectables}
                                        editPosition={targetPosition}
                                    />
                                )}
                            </div>

                            { operationReturnType?.hasReturn && (
                                <FormTextInput
                                    customProps={{
                                        validate: validateNameValue,
                                        tooltipTitle: connectorOperationsTooltipMessages.responseVariableName.title,
                                        disabled: responseVariableHasReferences
                                    }}
                                    defaultValue={responseVarName}
                                    placeholder={addResponseVariablePlaceholder}
                                    onChange={onNameChange}
                                    label={addResponseVariableLabel}
                                    errorMessage={responseVarError}
                                />
                            ) }
                            {operationReturnType?.hasReturn && hasTypeDesc() && (
                                <Box className="exp-wrapper">
                                    <VariableTypeInput
                                        displayName={addOutputTypeLabel}
                                        value={returnType ? returnType : operationReturnType.returnType}
                                        hideTextLabel={false}
                                        onValueChange={onTypeChange}
                                        position={targetPosition}
                                        validateExpression={onValidateOutputType}
                                        tooltipTitle={outputTypeReplaceHint}
                                    />
                                </Box>
                            )}
                        </div>
                    </div>
                    <div className={classes.saveConnectorBtnHolder}>
                        <PrimaryButton
                            className={wizardClasses.buttonSm}
                            text={saveConnectionButtonText}
                            fullWidth={false}
                            disabled={isSaveButtonDisabled}
                            onClick={handleOnSave}
                            dataTestId="save-operation-btn"
                        />
                    </div>
                </div>
            )
            )
            }
        </div>
    );
}

