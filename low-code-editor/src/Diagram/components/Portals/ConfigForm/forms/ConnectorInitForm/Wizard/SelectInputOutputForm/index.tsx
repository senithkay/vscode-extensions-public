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
import React, { useContext, useState } from "react";

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { ActionConfig, ConnectorConfig, FormField } from "../../../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../../../../utils/mixins";
import { genVariableName } from "../../../../../utils";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { RadioControl } from "../../../../Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { Form } from "../../../Components/Form";
import { useStyles } from "../../../style";
import "../style.scss"

interface SelectInputOutputFormProps {
    actions: Map<string, FormField[]>;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: (sourceModifications?: STModification[]) => void;
    isNewConnectorInitWizard: boolean;
}

interface ReturnNameState {
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
    const { state } = useContext(DiagramContext);
    const { isMutationProgress: isMutationInProgress, syntaxTree, stSymbolInfo } = state;
    const { onBackClick, onSave, actions, connectorConfig, isNewConnectorInitWizard } = props;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [actionName, setActionName] = useState(defaultActionName);
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.fields.length > 0;
    const payloadType = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType ? connectorConfig.responsePayloadMap.selectedPayloadType : "";
    const mapPayload = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType === "" ? NO_PAYLOAD : SELECT_PAYLOAD;

    const initialReturnNameState: ReturnNameState = {
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

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);
    const [payloadState, setPayloadState] = useState<PayloadState>(initialPayloadState);

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    // generate variable name and set to default text
    const defaultResponseVariableName: string = (action.returnVariableName === "" || action.returnVariableName === undefined) ?
        genVariableName(action.name + "Response", getAllVariables(stSymbolInfo)) : action.returnVariableName;

    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isFieldsAvailable);

    if ((action.returnVariableName === "" || action.returnVariableName === undefined) && returnNameState.isValidName) {
        action.returnVariableName = defaultResponseVariableName;
    }

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const onPayloadTypeSelect = (value: string) => {
        if (connectorConfig.responsePayloadMap) {
            connectorConfig.responsePayloadMap.isPayloadSelected = true;
            connectorConfig.responsePayloadMap.selectedPayloadType = value;
            connectorConfig.responsePayloadMap.payloadVariableName = genVariableName(value.toLowerCase() +
                "Payload", getAllVariables(stSymbolInfo));
        }
        setPayloadState({
            ...payloadState,
            selectedPayload: value,
            variableName: genVariableName(value.toLowerCase() + "Payload", getAllVariables(stSymbolInfo))
        });
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

    const handleOnChangeOperation = (value: any) => {
        const changedVal = value as string;
        connectorConfig.action = {
            name: changedVal,
            fields: actions.get(changedVal)
        };
        setActionName(changedVal);
    };

    const handleOnSave = () => {
        onSave();
    };

    const operations: string[] = [];
    if (actions) {
        actions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    const selectedOperationParams = actionName && isFieldsAvailable && (
        <>
            <FormHelperText className={classes.inputLabelWrapper}>Operation Inputs:</FormHelperText>
            <div className={classes.groupedForm}>
                <Form fields={connectorConfig.action.fields} onValidate={onValidate} />
            </div>
        </>
    );

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

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
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
                    validate: validateNameValue
                }}
                defaultValue={payloadState.variableName}
                placeholder={"Enter Payload Variable Name"}
                onChange={onPayloadNameChange}
                label={"Payload Variable Name"}
                errorMessage={"Invalid Payload Variable Name"}
            />
        );

        const payloadConfig = payloadState.mapPayload === SELECT_PAYLOAD && (
            <div>
                <FormHelperText className={classes.inputLabelWrapper}> Selet Payload Type </FormHelperText>
                <SelectDropdownWithButton
                    defaultValue={payloadState.selectedPayload}
                    onChange={onPayloadTypeSelect}
                    placeholder="Select Type"
                    customProps={{
                        values: payloadTypes,
                        disableCreateNew: true
                    }}
                />
            </div>
        );
        payloadComponent = (
            <div className={classes.groupedForm}>
                <FormHelperText className={classes.inputLabelWrapper}> Output Payload </FormHelperText>
                <RadioControl
                    onChange={onPayloadMapSelect}
                    defaultValue={payloadState.mapPayload}
                    customProps={{ collection: [SELECT_PAYLOAD, NO_PAYLOAD] }}
                />
                {payloadConfig}
                {payloadVariable}
            </div>
        );
    }

    const isPayloadMapped = connectorConfig.responsePayloadMap
        ? ((payloadState.mapPayload === SELECT_PAYLOAD && payloadState.selectedPayload !== "" && payloadState.isNameProvided && payloadState.validPayloadName)
            || payloadState.mapPayload === NO_PAYLOAD)
        : true;
    const isSaveDisabled: boolean = !isNewConnectorInitWizard
        || isMutationInProgress
        || !(isGenFieldsFilled && returnNameState.isNameProvided && returnNameState.isValidName
            && isPayloadMapped);

    return (
        <div className={classes.configPanel}>
            <FormControl className={classes.wizardFormControl}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>Map Input and Output</Box>
                </Typography>
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}>Select an Operation</FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
                <SelectDropdownWithButton
                    defaultValue={action.name}
                    onChange={handleOnChangeOperation}
                    customProps={{
                        values: operations,
                        disableCreateNew: true
                    }}
                />
                {selectedOperationParams}
                <FormTextInput
                    customProps={{
                        validate: validateNameValue
                    }}
                    defaultValue={defaultResponseVariableName}
                    placeholder={"Enter Response Variable Name"}
                    onChange={onNameChange}
                    label={"Response Variable Name"}
                    errorMessage={"Invalid Response Variable Name"}
                />
                {payloadComponent}
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
