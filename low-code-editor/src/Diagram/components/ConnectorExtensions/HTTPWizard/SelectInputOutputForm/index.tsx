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
import { FormattedMessage, useIntl } from "react-intl";

import { FormControl, FormHelperText } from "@material-ui/core";
import classNames from "classnames";

import { Section } from "../../../../../components/ConfigPanel";
import { TooltipIcon } from "../../../../../components/Tooltip";
import {
    ActionConfig,
    ConnectorConfig,
    FormField,
    FunctionDefinitionInfo,
    httpRequest,
    PrimitiveBalType
} from "../../../../../ConfigurationSpec/types";
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
import { HeaderObjectConfig, HTTPHeaders } from "../HTTPHeaders";
import '../style.scss'

interface SelectInputOutputFormProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
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
    const { onBackClick, onSave, functionDefinitions: actions, connectorConfig, isNewConnectorInitWizard, headerObject } = props;
    const { state: diagramState } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, isMutationProgress } = diagramState;
    // const { model } = props;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();

    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [state] = useState(defaultActionName);
    const [responseVarError, setResponseVarError] = useState("");
    const [defaultPayloadVarName] = useState<string>(connectorConfig?.responsePayloadMap?.payloadVariableName);
    const [payloadVarError, setPayloadVarError] = useState("");
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.name && connectorConfig.action.name !== "get" && connectorConfig.action.fields.length > 0;
    const payloadType = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType ? connectorConfig.responsePayloadMap.selectedPayloadType : "";
    const mapPayload = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType === "" ? NO_PAYLOAD : SELECT_PAYLOAD;
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isNewConnectorInitWizard || connectorConfig?.action?.name === "get");

    const initialReturnNameState: ReturnNameState = {
        value: connectorConfig.action.returnVariableName || genVariableName(connectorConfig.action.name + "Response", getAllVariables(symbolInfo)),
        isNameProvided: true,
        isValidName: true
    };
    const initialPayloadState: PayloadState = {
        mapPayload,
        selectedPayload: payloadType,
        isNameProvided: !!connectorConfig?.responsePayloadMap?.payloadVariableName,
        validPayloadName: true,
        variableName: connectorConfig.responsePayloadMap ? connectorConfig.responsePayloadMap.payloadVariableName : ""
    };

    let newField: FormField;
    if (connectorConfig.action.name === "forward") {
        actions.forEach((fields, name) => {
            if (name === "forward") {
                fields.parameters.forEach((field, key) => {
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
        type: PrimitiveBalType.Record,
        typeInfo: httpRequest,
        value: forwardReqField?.value

    }

    const expElementProps: FormElementProps = {
        model: reqField,
        customProps: {
            validate: validateReqField,
            statementType: reqField.type
        },
        onChange: onForwardReqChange,
    };

    const forwardReq: ReactNode = (connectorConfig.action.name === "forward") ?
        (<ExpressionEditor {...expElementProps} />) : null;

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);
    const [payloadState, setPayloadState] = useState<PayloadState>(initialPayloadState);
    const [defaultResponseVarName] = useState<string>(returnNameState.value);

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    let responseVariableHasReferences: boolean = false;
    let payloadVariableHasReferences: boolean = false;

    if (!isNewConnectorInitWizard) {
        let symbolRefArray = symbolInfo.variableNameReferences.get(returnNameState.value);
        responseVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;

        if (connectorConfig.responsePayloadMap.isPayloadSelected) {
            symbolRefArray = symbolInfo.variableNameReferences.get(connectorConfig.responsePayloadMap.payloadVariableName);
            payloadVariableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
        }
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
            isNameProvided: true,
            variableName: isNewConnectorInitWizard || (!isNewConnectorInitWizard &&
                !connectorConfig.responsePayloadMap.payloadVariableName) ?
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

    const payloadTypePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.seletPayloadType",
        defaultMessage: "Select Type"
    });

    const addResponseVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.addResponseVariable.placeholder",
        defaultMessage: "Enter response variable name"
    });

    const addResponseVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.addResponseVariable.label",
        defaultMessage: "Response Variable Name"
    });

    const addPayloadVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.addPayloadVariable.placeholder",
        defaultMessage: "Enter Payload Variable Name"
    });

    const addPayloadVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.addPayloadVariable.label",
        defaultMessage: "Payload Variable Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.HTTP.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    const HTTPtooltipMessages = {
        HTTPPayload: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.HTTP.HTTPPayload.tooltip.title",
                defaultMessage: "Add a valid payload variable"
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.HTTP.HTTPPayload.tooltip.content",
                defaultMessage: "jsonPayload \nxmlPayload \ntextPayload"
            }),
    },
        payloadVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.HTTP.HTTPPayloadName.tooltip.title",
                defaultMessage: "Add a valid name for the payload variable. Avoid using special characters ,having spaces in the middle ,starting with a numerical character and including keywords such as Return , Foreach , Resource, Object, etc."
            })
        },
    };

    const responseVariableInstructionsBullet1 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.responseVariableNametooltip.instructions.bulletPoint1",
        defaultMessage: "include spaces and special characters"
      });

    const responseVariableInstructionsBullet2 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.responseVariableNametooltip.instructions.bulletPoint2",
        defaultMessage: "start with a numerical character"
      });

    const responseVariableInstructionsBullet3 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.responseVariableNametooltip.instructions.bulletPoint3",
        defaultMessage: "include keywords such as Return , Foreach , Resource, Object, etc."
      });

    const responseVariableInstructions = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.responseVariableNametooltip.instructions.title",
        defaultMessage: "A valid response variable name should not :"
      });

    const title = (
        <div>
          <p>{responseVariableInstructions}</p>
          <ul>
            <li>{responseVariableInstructionsBullet1}</li>
            <li>{responseVariableInstructionsBullet2}</li>
            <li>{responseVariableInstructionsBullet3}</li>
          </ul>
        </div>
      );

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
                    tooltipTitle: HTTPtooltipMessages.payloadVariableName.title,
                    disabled: payloadVariableHasReferences
                }}
                defaultValue={payloadState.variableName}
                placeholder={addPayloadVariablePlaceholder}
                onChange={onPayloadNameChange}
                label={addPayloadVariableLabel}
                errorMessage={payloadVarError}
            />
        );

        const payloadConfig = payloadState.mapPayload === SELECT_PAYLOAD && (
            <>
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}><FormattedMessage id="lowcode.develop.connectorForms.HTTP.seletPayloadType" defaultMessage="Select payload type :"/></FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
                <div
                    className="product-tour-payload-click"
                >
                    <SelectDropdownWithButton
                        defaultValue={payloadState.selectedPayload}
                        onChange={onPayloadTypeSelect}
                        placeholder={payloadTypePlaceholder}
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
                        <FormHelperText className={classes.subtitle}><FormattedMessage id="lowcode.develop.connectorForms.HTTP.operationInputs.title" defaultMessage="Operation Inputs"/></FormHelperText>
                        <div className={classNames(classes.groupedForm, classes.marginTB)}>
                            {selectedOperationParams}
                            {forwardReq}
                            <Section
                                title={addResponseVariableLabel}
                                tooltip={{title}}
                            >
                            <FormTextInput
                                dataTestId={"response-variable-name"}
                                customProps={{
                                    validate: validateResponseNameValue,
                                    disabled: responseVariableHasReferences
                                }}
                                defaultValue={returnNameState.value}
                                placeholder={addResponseVariablePlaceholder}
                                onChange={onNameChange}
                                errorMessage={responseVarError}
                            />
                            </Section>
                        </div>
                        <TooltipIcon
                            title={HTTPtooltipMessages.HTTPPayload.title}
                            content={HTTPtooltipMessages.HTTPPayload.content}
                            placement="left"
                            arrow={true}
                            codeSnippet={true}
                            example={true}
                            interactive={true}
                        >
                            <FormHelperText className={classes.subtitle}><FormattedMessage id="lowcode.develop.connectorForms.HTTP.outputPayload.title" defaultMessage="Output Payload"/></FormHelperText>
                        </TooltipIcon>
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
                        text={saveConnectionButtonText}
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
