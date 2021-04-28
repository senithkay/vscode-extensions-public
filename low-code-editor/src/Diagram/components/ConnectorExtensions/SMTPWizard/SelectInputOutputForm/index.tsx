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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";
import { AddCircleOutline } from "@material-ui/icons";
import classNames from "classnames";

import { ActionConfig, ConnectorConfig, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { IconBtnWithText } from "../../../Portals/ConfigForm/Elements/Button/IconBtnWithText";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { FormattedMessage, useIntl } from "react-intl";

interface SelectInputOutputFormProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard: boolean;
}

interface ReturnNameState {
    isNameProvided: boolean;
    isValidName: boolean;
}

export function SelectInputOutputForm(props: SelectInputOutputFormProps) {
    const { onBackClick, onSave, functionDefinitions, connectorConfig, isNewConnectorInitWizard } = props;
    const { state: diagramState } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, isMutationProgress } = diagramState;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();
    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [state] = useState(defaultActionName);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(undefined);
    const [responseVarError, setResponseVarError] = useState("");
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.fields && connectorConfig.action.fields.length > 0;

    const initialReturnNameState: ReturnNameState = {
        isNameProvided: true,
        isValidName: true
    };

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    // generate variable name and set to default text
    const defaultResponseVariableName: string = (action.returnVariableName === "" || action.returnVariableName === undefined) ?
        genVariableName(action.name + "Response", getAllVariables(symbolInfo)) : action.returnVariableName;

    if (defaultResponseVarName === undefined) {
        setDefaultResponseVarName(defaultResponseVariableName);
    }

    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isFieldsAvailable);

    if ((action.returnVariableName === "" || action.returnVariableName === undefined) && returnNameState.isValidName) {
        action.returnVariableName = defaultResponseVariableName;
    }

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const handleOnSave = () => {
        onSave();
    };

    const operations: string[] = [];
    if (functionDefinitions) {
        functionDefinitions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    const [expandCc, setExpandCc] = useState(false);
    const onCcClicked = () => {
        setExpandCc(true);
    }
    const [expandBcc, setExpandBcc] = useState(false);
    const onBccClicked = () => {
        setExpandBcc(true);
    }

    const [emptyFieldChecker] = useState(new Map<string, boolean>());
    const validateField = (field: string, isInvalid: boolean): void => {
        emptyFieldChecker.set(field, isInvalid);
        const BccChecker = expandBcc ? emptyFieldChecker.get("bcc") || false : false;
        const CcChecker = expandCc ? emptyFieldChecker.get("cc") || false : false;
        if (!emptyFieldChecker.get("subject") && !emptyFieldChecker.get("'from") && !emptyFieldChecker.get("to")
            && !emptyFieldChecker.get("body") && !BccChecker && !CcChecker) {
            onValidate(true);
        } else {
            onValidate(false);
        }
    }

    const getFormFieldComponent = (component: string): any => {
        const field = connectorConfig.action.fields[0].fields.find(inputField => inputField.name === component);
        if (!field || field?.hide) {
            return null;
        }
        // generate component
        const elementProps: FormElementProps = {
            model: field,
            index: 1,
            customProps: {
                validate: validateField,
                statementType: field.type
            }
        };
        if (field.name === "'from") {
            elementProps.customProps = { ...elementProps.customProps, isEmail: true }
            return (
                <ExpressionEditor {...elementProps} />
            );
        } else if (field.name === "to") {
            return (
                <ExpressionEditor {...elementProps} />
            );
        } else if (field.name === "cc") {
            return (expandCc || (field.value)) ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                    <IconBtnWithText
                        text={"Add " + field.name}
                        onClick={onCcClicked}
                        icon={<AddCircleOutline />}
                    />
                );
        } else if (field.name === "bcc") {
                return (expandBcc || (field.value)) ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                    <IconBtnWithText
                        text={"Add " + field.name}
                        onClick={onBccClicked}
                        icon={<AddCircleOutline />}
                    />
                );
        } else if (field.name === "subject") {
            return (
                <div className={classes.emailFormSubject}>
                    <ExpressionEditor {...elementProps} />
                </div>
            );
        } else if (field.name === "body") {
            elementProps.model = field;
            elementProps.customProps = { ...elementProps.customProps, expandDefault: true }
            const onBodyChange = (body: string) => {
                elementProps.model.value = body
            }
            return (
                <ExpressionEditor {...elementProps} onChange={onBodyChange} />
            );
        }
    }

    const selectedOperationParams = state && isFieldsAvailable && (
        <div className={classes.inputWrapper}>
            <div className={classes.groupedForm}>
                {getFormFieldComponent("'from")}
                {getFormFieldComponent('to')}
                {getFormFieldComponent('cc')}
                {getFormFieldComponent('bcc')}
                {getFormFieldComponent('subject')}
                {getFormFieldComponent('body')}
            </div>
        </div>
    );

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value, defaultResponseVarName, diagramState);
            if (varValidationResponse?.error) {
                setResponseVarError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    const onNameChange = (value: any) => {
        action.returnVariableName = value;
        setReturnNameState({
            ...returnNameState,
            isNameProvided: value && value !== '',
            isValidName: nameRegex.test(value)
        });
    };

    const isSaveDisabled: boolean = isMutationProgress
        || !(isGenFieldsFilled && returnNameState.isNameProvided && returnNameState.isValidName);

    let returnVariableName = false;
    if (!isNewConnectorInitWizard) {
        const symbolRefArray = symbolInfo.variableNameReferences.get(action.returnVariableName);
        returnVariableName = symbolRefArray ? symbolRefArray.length > 0 : false;
    }

    const SMTPInputOutputTooltipMessages = {
        responseVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.SMTP.SelectInputOutput.tooltip.title",
                defaultMessage: "Enter a valid name for the response variable"
            }),
    }
    };
    const addResponseVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.SMTP.selectInputOutputForm.addResponseVariable.placeholder",
        defaultMessage: "Enter Response Variable Name"
    });

    const addResponseVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.SMTP.selectInputOutputForm.addResponseVariable.label",
        defaultMessage: "Response Variable Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.SMTP.selectInputOutputForm.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    const backButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.SMTP.selectInputOutputForm.backButton.text",
        defaultMessage: "Back"
    });

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={wizardClasses.configWizardAPIContainer}>
                    <div className={classes.fullWidth}>
                        <Typography variant="h4" className={classes.titleWrapper}>
                            <Box className={classes.formTitle}>
                                <div className={classes.formTitleTag} >
                                    <FormattedMessage
                                        id="lowcode.develop.connector.SMTP.createEmail.title"
                                        defaultMessage="Create an Email"
                                    />
                                </div>
                            </Box>
                        </Typography>
                        {selectedOperationParams}
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                tooltipTitle: SMTPInputOutputTooltipMessages.responseVariableName.title,
                                disabled: returnVariableName
                            }}
                            defaultValue={defaultResponseVariableName}
                            placeholder={addResponseVariablePlaceholder}
                            onChange={onNameChange}
                            label={addResponseVariableLabel}
                            errorMessage={responseVarError}
                        />
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text={backButtonText} fullWidth={false} onClick={onBackClick} />
                    <PrimaryButton
                        text={saveConnectionButtonText}
                        fullWidth={false}
                        disabled={isSaveDisabled}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
        </div>
    );
}
