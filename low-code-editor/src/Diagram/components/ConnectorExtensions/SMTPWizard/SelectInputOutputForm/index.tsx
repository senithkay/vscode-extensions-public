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
import { TooltipIcon } from "../../../Portals/ConfigForm/Elements/Tooltip";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { tooltipMessages } from "../../../Portals/utils/constants";



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
    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [state] = useState(defaultActionName);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(undefined);
    const [responseVarError, setResponseVarError] = useState("");
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.fields && connectorConfig.action.fields.length > 0;
    const [expandBcc, setExpandBcc] = useState(false);
    const [expandCc, setExpandCc] = useState(false);
    const [isFromFieldValid, setValidationFromField] = useState(false);
    const [isToFieldValid, setValidationToField] = useState(false);
    const [isSubjectFieldValid, setValidationSubjectField] = useState(false);
    const [isBodyFieldValid, setValidationBodyField] = useState(false);
    const [isCCFieldValid, setValidationCCField] = useState(false);
    const [isBCCFieldValid, setValidationBCCField] = useState(false);


    const emptyFieldChecker: Map<string, boolean> = new Map<string, boolean>();

    const validateField = (field: string, isInvalid: boolean): void => {
        emptyFieldChecker.set(field, isInvalid);
        let allFieldsValid = true;
        for (const formValue of connectorConfig.action.fields) {
            for (const recordField of formValue.fields) {
                const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
                // breaks the loop if one field is empty
                if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                    allFieldsValid = !isFieldValueInValid;
                    break;

                }
            }
        }
        if (expandBcc === true || expandCc === true) {
            validateAllFields()
        }
        // else {
        onValidate(allFieldsValid);
        // }
    }
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
    const validateAllFields = () => {
        if (!isFromFieldValid && !isToFieldValid && !isSubjectFieldValid && !isBodyFieldValid && !isCCFieldValid && !isBCCFieldValid) {
            onValidate(false)
        } else {
            onValidate(true)
        }
    }
    const validateFromField = (field: string, isInvalid: boolean) => {
        setValidationFromField(isInvalid)
        validateAllFields()
    }
    const validateToField = (field: string, isInvalid: boolean) => {
        setValidationToField(isInvalid)
        validateAllFields()
        // setTemp({to: isInvalid, ...temp})
    }
    const validateSubjectField = (field: string, isInvalid: boolean) => {
        setValidationSubjectField(isInvalid)
        validateAllFields()
    }
    const validateBodyField = (field: string, isInvalid: boolean) => {
        setValidationBodyField(isInvalid)
        validateAllFields()
    }
    const validateCCField = (field: string, isInvalid: boolean) => {
        setValidationCCField(isInvalid)
        validateAllFields()
    }
    const validateBCCField = (field: string, isInvalid: boolean) => {
        setValidationBCCField(isInvalid)
        validateAllFields()
    }
    // const onCcClicked = () => {
    //     // validateField("to",true)
    //     onValidate(false)
    //     setExpandCc(true);
    // }
    // const onBccClicked = () => {
    //     onValidate(false)
    //     // validateField("to",true)
    //     setExpandBcc(true);
    // }

    // const emptyFieldChecker: Map<string, boolean> = new Map<string, boolean>();
    // const BccChecker = expandBcc ? emptyFieldChecker.get("bcc") : false;
    // const CcChecker = expandCc ? emptyFieldChecker.get("cc") : false;
    // const validateField = (field: string, isInvalid: boolean): void => {
    //     emptyFieldChecker.set(field, isInvalid);
    // let allFieldsValid = true;
    // for (const formValue of connectorConfig.action.fields) {
    //     for (const recordField of formValue.fields) {
    //         const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
    //         // breaks the loop if one field is empty
    //         if (isFieldValueInValid !== undefined && isFieldValueInValid) {
    //             allFieldsValid = !isFieldValueInValid;
    //             break;
    //         }
    //     }
    // }

    // if (!emptyFieldChecker.get("subject") && !emptyFieldChecker.get("'from") && !emptyFieldChecker.get("to")
    //     && !emptyFieldChecker.get("body") && !BccChecker && !CcChecker) {
    //     onValidate(true);
    // } else {
    //     onValidate(false);
    // }
    // onValidate(allFieldsValid);
    // }

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
            elementProps.customProps = { ...elementProps.customProps }
            return (
                <ExpressionEditor {...elementProps} />
            );
        } else if (field.name === "to") {
            elementProps.customProps = { ...elementProps.customProps }
            return (
                <ExpressionEditor {...elementProps} />
            );
        } else if (field.name === "cc") {
            elementProps.customProps = { ...elementProps.customProps }
            const onCcClicked = () => {
                setExpandCc(true);
            };
            return expandCc ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                <IconBtnWithText
                    text={"Add " + field.name}
                    onClick={onCcClicked}
                    icon={<AddCircleOutline />}
                />
            );
        } else if (field.name === "bcc") {
            elementProps.customProps = { ...elementProps.customProps }
            const onBccClicked = () => {
                setExpandBcc(true);
            };
            return expandBcc ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                <IconBtnWithText
                    text={"Add " + field.name}
                    onClick={onBccClicked}
                    icon={<AddCircleOutline />}
                />
            );
        } else if (field.name === "subject") {
            elementProps.customProps = { ...elementProps.customProps }
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

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={wizardClasses.configWizardAPIContainer}>
                    <div className={classes.fullWidth}>
                        <Typography variant="h4" className={classes.titleWrapper}>
                            <Box className={classes.formTitle}>
                                <div className={classes.formTitleTag} >Create an Email</div>
                            </Box>
                        </Typography>
                        {selectedOperationParams}
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                tooltipTitle: tooltipMessages.responseVariableName,
                                disabled: returnVariableName
                            }}
                            defaultValue={defaultResponseVariableName}
                            placeholder={"Enter Response Variable Name"}
                            onChange={onNameChange}
                            label={"Response Variable Name"}
                            errorMessage={responseVarError}
                        />
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick} />
                    <PrimaryButton
                        text="Save &amp; Done"
                        fullWidth={false}
                        disabled={isSaveDisabled}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
        </div>
    );
}
