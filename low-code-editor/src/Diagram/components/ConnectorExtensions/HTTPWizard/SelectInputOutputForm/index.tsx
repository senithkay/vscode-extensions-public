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
import React, { ReactNode, useContext, useState } from "react";

import { FormControl, FormHelperText } from "@material-ui/core";
import classNames from "classnames";

import { ActionConfig, ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext} from "../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { RadioControl } from "../../../Portals/ConfigForm/Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { tooltipMessages } from "../../../Portals/utils/constants";
import { HeaderObjectConfig, HTTPHeaders } from "../HTTPHeaders";
import '../style.scss'

interface SelectInputOutputFormProps {
    actions: Map<string, FormField[]>;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard: boolean;
    headerObject?: HeaderObjectConfig[];
}

interface ReturnNameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

interface PayloadState {
    mapPayload: string;
    selectedPayload: string;
    validPayloadName: boolean;
    isNameProvided: boolean;
    variableName: string;
}

const SELECT_PAYLOAD = "Select Payload";
const NO_PAYLOAD = "No Payload";

export function SelectInputOutputForm(props: SelectInputOutputFormProps) {
    const { onBackClick, onSave, actions, connectorConfig, isNewConnectorInitWizard, headerObject } = props;
    const { state: diagramState } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, isMutationProgress } = diagramState;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const wizardClasses = wizardStyles();

    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [state] = useState(defaultActionName);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(undefined);
    const [responseVarError, setResponseVarError] = useState("");
    const [defaultPayloadVarName] = useState<string>(connectorConfig?.responsePayloadMap?.payloadVariableName);
    const [payloadVarError, setPayloadVarError] = useState("");
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.name && connectorConfig.action.name !== "get" && connectorConfig.action.fields.length > 0;
    const payloadType = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType ? connectorConfig.responsePayloadMap.selectedPayloadType : "";
    const mapPayload = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType === "" ? NO_PAYLOAD : SELECT_PAYLOAD;
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isNewConnectorInitWizard || connectorConfig?.action?.name === "get");

    const initialReturnNameState: ReturnNameState = {
        value: connectorConfig.action.returnVariableName,
        isNameProvided: true,
        isValidName: true
    };
    const initialPayloadState: PayloadState = {
        mapPayload,
        selectedPayload: payloadType,
        isNameProvided: false,
        validPayloadName: true,
        variableName: connectorConfig.responsePayloadMap ? connectorConfig.responsePayloadMap.payloadVariableName : ""
    };

    let responseVariableHasReferences: boolean = false;
    let payloadVariableHasReferences: boolean = false;

    if (!isNewConnectorInitWizard) {
        let symbolRefArray = symbolInfo.variableNameReferences.get(connectorConfig.action.returnVariableName);
        responseVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;

        if (connectorConfig.responsePayloadMap.isPayloadSelected) {
            symbolRefArray = symbolInfo.variableNameReferences.get(connectorConfig.responsePayloadMap.payloadVariableName);
            payloadVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
        }
    }

    let newField: FormField;
    if (connectorConfig.action.name === "forward") {
        actions.forEach((fields, name) => {
            if (name === "forward") {
                fields.forEach((field) => {
                    if (field.name === "forwardReq") {
                        newField = field;
                    }
                });
            }
        });
    }
    const [forwardReqField] = useState(newField);

    const onForwardReqChange = (value: string) => {
        if (forwardReqField) {
            forwardReqField.value = value;
        }
    };

    const validateReqField = (fieldName: string, isInvalidFromField: boolean) => {
        setIsGenFieldsFilled(!isInvalidFromField)
    }

    const reqField: FormField = {
        name: "request",
        displayName: "Request",
        type: "http:Request",
        value: forwardReqField?.value

    }

    const expElementProps: FormElementProps = {
        model: reqField,
        customProps: {
            validate: validateReqField,
        },
        onChange: onForwardReqChange,
    };

    const forwardReq: ReactNode = (connectorConfig.action.name === "forward") ?
        (<ExpressionEditor {...expElementProps} />) : null;

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);
    const [payloadState, setPayloadState] = useState<PayloadState>(initialPayloadState);

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    // generate variable name and set to default text
    const defaultResponseVariableName: string = (action.returnVariableName === "" ||
        action.returnVariableName === undefined) ? genVariableName(action.name + "Response",
            getAllVariables(symbolInfo)) : action.returnVariableName;

    if (defaultResponseVarName === undefined) {
        setDefaultResponseVarName(defaultResponseVariableName);
    }

    if ((action.returnVariableName === "" || action.returnVariableName === undefined) && returnNameState.isValidName) {
        action.returnVariableName = defaultResponseVariableName;
        setReturnNameState({
            value: defaultResponseVariableName,
            isNameProvided: defaultResponseVariableName !== '',
            isValidName: nameRegex.test(defaultResponseVariableName)
        });
    }

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const onPayloadTypeSelect = (value: string) => {
        if (connectorConfig.responsePayloadMap) {
            connectorConfig.responsePayloadMap.isPayloadSelected = true;
            connectorConfig.responsePayloadMap.selectedPayloadType = value;
            connectorConfig.responsePayloadMap.payloadVariableName =
                isNewConnectorInitWizard ?
                    genVariableName(value.toLowerCase() + "Payload", getAllVariables(symbolInfo))
                    :
                    connectorConfig.responsePayloadMap.payloadVariableName;
        }
        setPayloadState({
            ...payloadState,
            selectedPayload: value,
            variableName: isNewConnectorInitWizard ?
                genVariableName(value.toLowerCase() + "Payload", getAllVariables(symbolInfo))
                :
                connectorConfig.responsePayloadMap.payloadVariableName
        });
        // TODO: tour step should update without redux store
        // dispatchGoToNextTourStep("CONFIG_JSON_PAYLOAD");
    };

    const onPayloadMapSelect = (value: string) => {
        if (value === SELECT_PAYLOAD) {
            setPayloadState({
                ...payloadState,
                mapPayload: SELECT_PAYLOAD
            });
        } else {
            if (connectorConfig.responsePayloadMap) {
                connectorConfig.responsePayloadMap.isPayloadSelected = false;
                connectorConfig.responsePayloadMap.selectedPayloadType = "";
                connectorConfig.responsePayloadMap.payloadVariableName = "";
            }
            setPayloadState({
                mapPayload: NO_PAYLOAD,
                selectedPayload: "",
                isNameProvided: false,
                validPayloadName: true,
                variableName: ""
            });
        }
    };

    const handleOnSave = () => {
        // TODO: tour step should update without redux store
        // dispatchGoToNextTourStep("CONFIG_SAVE_AND_DONE");
        action.returnVariableName = returnNameState.value;
        onSave();
    };

    const validatePayloadNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("payload name", value, defaultPayloadVarName, diagramState);
            if (varValidationResponse?.error) {
                setPayloadVarError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };
    const validateResponseNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value, defaultResponseVarName, diagramState);
            if (varValidationResponse?.error) {
                setResponseVarError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    const onNameChange = (text: string) => {
        setReturnNameState({
            ...returnNameState,
            value: text,
            isNameProvided: text && text !== '',
            isValidName: nameRegex.test(text)
        });
    };

    const operations: string[] = [];
    if (actions) {
        actions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    const selectedOperationParams = state && isFieldsAvailable && action.name && action.name !== "get" &&
        action.name !== "forward" && (<Form fields={connectorConfig.action.fields} onValidate={onValidate} />);

    // check for name when navigating back.
    if (!returnNameState.isNameProvided && action.returnVariableName !== undefined && action.returnVariableName !== '') {
        setReturnNameState({
            ...returnNameState,
            isNameProvided: action.returnVariableName !== undefined && action.returnVariableName !== '',
            isValidName: nameRegex.test(action.returnVariableName)
        });
    }

    // check for respond name when navigating back.
    if (connectorConfig.responsePayloadMap && !payloadState.isNameProvided && connectorConfig.responsePayloadMap.payloadVariableName !== undefined
        && connectorConfig.responsePayloadMap.payloadVariableName !== "") {
        setPayloadState({
            ...payloadState,
            selectedPayload: payloadType,
            isNameProvided: true,
            validPayloadName: nameRegex.test(connectorConfig.responsePayloadMap.payloadVariableName)
        });
    }

    const onPayloadNameChange = (value: string) => {
        if (connectorConfig.responsePayloadMap) {
            connectorConfig.responsePayloadMap.payloadVariableName = value;
        }
        setPayloadState({
            ...payloadState,
            isNameProvided: value && value !== "",
            validPayloadName: nameRegex.test(value),
            variableName: value
        });
    };

    let payloadComponent: React.ReactNode = null;
    if (connectorConfig.responsePayloadMap) {
        const payloadTypes: string[] = [];
        connectorConfig.responsePayloadMap.payloadTypes.forEach((value, key) => {
            payloadTypes.push(key);
        });

        const payloadVariable = payloadState.selectedPayload && (
            <FormTextInput
                customProps={{
                    validate: validatePayloadNameValue,
                    tooltipTitle: tooltipMessages.payloadVariableName,
                    disabled: payloadVariableHasReferences
                }}
                defaultValue={payloadState.variableName}
                placeholder={"Enter Payload Variable Name"}
                onChange={onPayloadNameChange}
                label={"Payload Variable Name"}
                errorMessage={payloadVarError}
            />
        );

        const payloadConfig = payloadState.mapPayload === SELECT_PAYLOAD && (
            <>
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}>Select Payload Type</FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
                <div
                    className="product-tour-payload-click"
                >
                    <SelectDropdownWithButton
                        defaultValue={payloadState.selectedPayload}
                        onChange={onPayloadTypeSelect}
                        placeholder="Select Type"
                        customProps={{
                            values: payloadTypes,
                            disableCreateNew: true,
                            // TODO: tour step should update without redux store
                            // onOpenSelect: () => {
                            //     dispatchGoToNextTourStep("CONFIG_PAYLOAD_CLICK")
                            // },
                        }}
                    />
                </div>
            </>
        );
        payloadComponent = (
            <>
                {
                    !isNewConnectorInitWizard && responseVariableHasReferences ?
                        null :
                        (
                            <RadioControl
                                onChange={onPayloadMapSelect}
                                defaultValue={payloadState.mapPayload}
                                customProps={{ collection: [SELECT_PAYLOAD, NO_PAYLOAD] }}
                            />
                        )
                }
                {payloadConfig}
                {payloadVariable}
            </>
        );
    }

    const isPayloadMapped = connectorConfig.responsePayloadMap
        ? ((payloadState.mapPayload === SELECT_PAYLOAD && payloadState.selectedPayload !== "" && payloadState.isNameProvided && payloadState.validPayloadName)
            || payloadState.mapPayload === NO_PAYLOAD)
        : true;
    const isSaveDisabled: boolean = isMutationProgress
        || !(isGenFieldsFilled && returnNameState.isNameProvided && returnNameState.isValidName
            && isPayloadMapped);

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={wizardClasses.configWizardAPIContainer}>
                    <div className={classes.fullWidth}>
                        <FormHelperText className={classes.subtitle}>Operation Inputs</FormHelperText>
                        <div className={classNames(classes.groupedForm, classes.marginTB)}>
                            {selectedOperationParams}
                            {forwardReq}
                            <FormTextInput
                                dataTestId={"response-variable-name"}
                                customProps={{
                                    validate: validateResponseNameValue,
                                    disabled: responseVariableHasReferences
                                }}
                                defaultValue={defaultResponseVariableName}
                                placeholder={"Enter Response Variable Name"}
                                onChange={onNameChange}
                                label={"Response Variable Name"}
                                errorMessage={responseVarError}
                            />
                        </div>
                        <FormHelperText className={classes.subtitle}>Output Payload</FormHelperText>
                        <div className={classNames(classes.groupedForm, classes.marginTB, "product-tour-grouped-form")}>
                            {payloadComponent}
                        </div>
                        <HTTPHeaders headerObject={headerObject} />
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick} />
                    <PrimaryButton
                        dataTestId={"http-save-done"}
                        className="product-tour-save-done"
                        text="Save &amp; Done"
                        fullWidth={false}
                        disabled={isSaveDisabled}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
            {/* <ProductTourStep
                startCondition={true}

                waitBeforeShow={500}
                step='CONFIG_PAYLOAD_CLICK'
            />
            <ProductTourStep
                startCondition={true}

                waitBeforeShow={500}
                step='CONFIG_JSON_PAYLOAD'
            />
            <ProductTourStep
                startCondition={true}

                waitBeforeShow={500}
                step='CONFIG_SAVE_AND_DONE'
            /> */}
        </div>
    );
}

// TODO: goToNextTourStep - tour step should update without redux store
// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep,
// };
