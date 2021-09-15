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
import { FormattedMessage, useIntl } from "react-intl";

import { LocalVarDecl, STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, IconButton, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {
    ActionConfig,
    Connector,
    ConnectorConfig,
    FormField,
    FunctionDefinitionInfo, PrimaryButton, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classNames from "classnames";

import { Context } from "../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../utils/mixins";
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { Form } from "../../../DynamicConnectorForm";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { SwitchToggle } from "../../../FormFieldComponents/SwitchToggle";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { OperationDropdown } from "../OperationDropdown";
import '../style.scss'

interface SelectInputOutputFormProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    onConnectionChange?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard: boolean;
    model?: STNode,
}

interface ReturnNameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

interface PayloadState {
    isPayloadSelected: boolean;
    selectedPayload: string;
    validPayloadName: boolean;
    isNameProvided: boolean;
    variableName: string;
}

export function SelectInputOutputForm(props: SelectInputOutputFormProps) {
    const { onConnectionChange, onSave, functionDefinitions, connectorConfig, isNewConnectorInitWizard, model } = props;
    const actions = functionDefinitions;
    const {
        props: { isMutationProgress, stSymbolInfo },
        api: {
            helpPanel: {
                openConnectorHelp
            }
        }
    } = useContext(Context);
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();

    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [state, setDefaultActionName] = useState(defaultActionName);
    const [responseVarError, setResponseVarError] = useState("");
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.name && connectorConfig.action.fields.length > 0;
    const payloadType = connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.selectedPayloadType ? connectorConfig.responsePayloadMap.selectedPayloadType : "";
    const payloadSelected = !(connectorConfig.responsePayloadMap &&
        (connectorConfig.responsePayloadMap.selectedPayloadType === "" ||
            connectorConfig.responsePayloadMap.selectedPayloadType === undefined));
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isNewConnectorInitWizard || connectorConfig?.action?.name === "get");
    const [selectedOperation, setSelectedOperation] = useState<string>(connectorConfig?.action?.name);
    let selectedTargetType = "";
    const httpVar = model as LocalVarDecl;
    const initialReturnNameState: ReturnNameState = {
        value: connectorConfig.action.returnVariableName, // connectorConfig?.action?.returnVariableName || genVariableName(connectorConfig.action.name + "Response", getAllVariables(symbolInfo)),
        isNameProvided: false,
        isValidName: true
    };

    if (selectedOperation) {
        connectorConfig.action.fields = functionDefinitions.get(selectedOperation).parameters;
    }

    if (selectedOperation !== connectorConfig?.action?.name) {
        connectorConfig.action.returnVariableName = undefined;
    }

    const initialPayloadState: PayloadState = {
        isPayloadSelected: payloadSelected,
        selectedPayload: payloadType,
        isNameProvided: !!connectorConfig?.responsePayloadMap?.payloadVariableName,
        validPayloadName: true,
        variableName: connectorConfig.responsePayloadMap ? connectorConfig.responsePayloadMap.payloadVariableName : ""
    };

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);
    const [payloadState, setPayloadState] = useState<PayloadState>(initialPayloadState);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(returnNameState.value);
    const frmFields: FormField[] = connectorConfig?.action?.fields;
    const [formFields, setFormFields] = useState(frmFields);
    const [onOperationChange, setOnOperationChange] = useState(false);
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
        const selectedType = httpVar.typeData.typeSymbol.signature;
        const defaultReturnType = httpVar.typedBindingPattern.typeDescriptor.source;
        selectedTargetType = (selectedType || defaultReturnType);
    }

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const onPayloadTypeSelect = (value: string) => {
        if (connectorConfig.responsePayloadMap) {
            connectorConfig.responsePayloadMap.isPayloadSelected = true;
            connectorConfig.responsePayloadMap.selectedPayloadType = value;
            connectorConfig.responsePayloadMap.payloadVariableName =
                isNewConnectorInitWizard || !connectorConfig.responsePayloadMap.payloadVariableName ?
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

    const handleOnSave = () => {
        // TODO: tour step should update without redux store
        // dispatchGoToNextTourStep("CONFIG_SAVE_AND_DONE");
        action.returnVariableName = returnNameState.value;
        action.fields.find(subField => subField.name === "targetType").selectedDataType = selectedTargetType;
        onSave();
    };

    const validateResponseNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value,
                defaultResponseVarName, stSymbolInfo);
            setResponseVarError(varValidationResponse.message);
            if (varValidationResponse?.error) {
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
        connectorConfig.action.returnVariableName = text;
    };

    const operations: string[] = [];
    if (actions) {
        actions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    const selectedOperationParams = state && isFieldsAvailable && action.name &&
        (<Form fields={formFields} onValidate={onValidate} />);

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
                defaultMessage: "Add a valid name for the payload variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, Object, etc."
            })
        },
        responseVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.HTTP.responseVariableNametooltip.title",
                defaultMessage: "Add a valid name for the response variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, Object, etc."
            }),
    }
    };

    let payloadComponent: React.ReactNode = null;
    if (connectorConfig.responsePayloadMap) {
        const payloadTypes: string[] = [];
        connectorConfig.responsePayloadMap.payloadTypes.forEach((value, key) => {
            payloadTypes.push(key);
        });

        payloadComponent = payloadState.isPayloadSelected && (
            <>
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}><FormattedMessage id="lowcode.develop.connectorForms.HTTP.seletPayloadType" defaultMessage="Select payload type :"/></FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
                <div
                    className="product-tour-payload-click"
                >
                    <SelectDropdownWithButton
                        defaultValue={connectorConfig.responsePayloadMap.selectedPayloadType}
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
    }

    // when switched to payload component and selected a payload or
    // when not switched to payload component
    // the payload is valid
    const isPayloadValid = (connectorConfig.responsePayloadMap.isPayloadSelected &&
        connectorConfig.responsePayloadMap.selectedPayloadType ||
        !connectorConfig.responsePayloadMap.isPayloadSelected);
    const isSaveDisabled: boolean = isMutationProgress || !(responseVarError === "" || responseVarError === undefined)
        || !(isGenFieldsFilled && returnNameState.isNameProvided && returnNameState.isValidName);

    const handleSwitchToggleChange = () => {
        if (connectorConfig.responsePayloadMap) {
            if (!connectorConfig.responsePayloadMap.isPayloadSelected) {
                setPayloadState({
                    ...payloadState,
                    isPayloadSelected: true,
                    selectedPayload: "",
                });
            } else {
                setPayloadState({
                    isPayloadSelected: false,
                    selectedPayload: connectorConfig.responsePayloadMap.selectedPayloadType,
                    isNameProvided: false,
                    validPayloadName: true,
                    variableName: ""
                });
            }
            connectorConfig.responsePayloadMap.selectedPayloadType = "";
            connectorConfig.responsePayloadMap.isPayloadSelected = !connectorConfig.responsePayloadMap.isPayloadSelected;
        }
    };

    React.useEffect(() => {
        if (!isNewConnectorInitWizard) {
            setReturnNameState({
                isNameProvided: true,
                value: connectorConfig.action.returnVariableName,
                isValidName: true
            });
            setDefaultResponseVarName(connectorConfig.action.returnVariableName);
        }
    }, [isNewConnectorInitWizard]);

    React.useEffect(() => {
        if (!isNewConnectorInitWizard) {
            setPayloadState({
                isPayloadSelected: (connectorConfig.responsePayloadMap.selectedPayloadType !==
                    undefined || (connectorConfig.responsePayloadMap.selectedPayloadType !== "")),
                selectedPayload: connectorConfig.responsePayloadMap.selectedPayloadType,
                isNameProvided: true,
                validPayloadName: true,
                variableName: connectorConfig.responsePayloadMap.payloadVariableName
            });
        }
    }, [connectorConfig.responsePayloadMap.isPayloadSelected]);

    const handleOnOperationSelect = (operation: string) => {
        connectorConfig.action.name = operation;
        setSelectedOperation(operation);
        const connector = (symbolInfo.localEndpoints.get(connectorConfig.name)?.typeData?.typeSymbol?.moduleID) as Connector;
        const name = symbolInfo.localEndpoints.get(connectorConfig.name)?.typeData?.typeSymbol?.name;
        if (connector){
            const {moduleName, package: {version, organization}} = connector;
            openConnectorHelp({moduleName, package: {name, version, organization}, name}, operation);
        }
        if (isNewConnectorInitWizard) {
            setReturnNameState({
                value: genVariableName(operation + "Response", getAllVariables(symbolInfo)),
                isValidName: true,
                isNameProvided: true
            });
        }
        if (operation) {
            const derivedFormFields = functionDefinitions.get(operation).parameters;
            connectorConfig.action.name = operation;
            connectorConfig.action.fields = derivedFormFields;
            setDefaultActionName(connectorConfig.action.name);
            setFormFields(derivedFormFields);
            setOnOperationChange(false);
        }
        setPayloadState({
            isPayloadSelected: true,
            selectedPayload: "",
            isNameProvided: false,
            validPayloadName: true,
            variableName: undefined
        });
        connectorConfig.responsePayloadMap.selectedPayloadType = "";
        connectorConfig.responsePayloadMap.isPayloadSelected = true;
    };

    const handleOperationChange = () => {
        setOnOperationChange(true);
    }

    const handleTypeChange = (value: string) => {
        selectedTargetType = value;
    }

    const tragetTypes = ["string", "json", "xml"]
    return (
        <div>
            {((!selectedOperation || onOperationChange) && (
                <OperationDropdown
                    operations={["get", "post", "put", "delete", "patch", "forward"]}
                    onOperationSelect={handleOnOperationSelect}
                    selectedValue={selectedOperation}
                />
            )
            )}
            {(selectedOperation && !onOperationChange &&
                (
                    <FormControl className={wizardClasses.mainWrapper}>
                        <div className={wizardClasses.configWizardAPIContainer}>
                            <div className={classes.fullWidth}>
                                <>
                                    <p className={wizardClasses.subTitle}>Operation</p>
                                    <Box border={1} borderRadius={5} className={wizardClasses.box}>
                                        <Typography variant="subtitle2">
                                            {connectorConfig.action.name}
                                        </Typography>
                                        <IconButton
                                            color="primary"
                                            classes={{
                                                root: wizardClasses.changeConnectionBtn
                                            }}
                                            onClick={handleOperationChange}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                </>
                                <FormHelperText className={classes.subtitle}>Operation Inputs</FormHelperText>

                                <div className={classNames(classes.groupedForm, classes.marginTB)}>
                                    {selectedOperationParams}
                                </div>
                                <SelectDropdownWithButton
                                    onChange={handleTypeChange}
                                    customProps={{
                                        values: tragetTypes,
                                        disableCreateNew: true,
                                        optional: true
                                    }}
                                    defaultValue={selectedTargetType}
                                    placeholder="Select Target Type"
                                    label="Target Type"
                                />
                                <div className={classes.marginTB}>
                                    <FormTextInput
                                        dataTestId={"response-variable-name"}
                                        customProps={{
                                            validate: validateResponseNameValue,
                                            disabled: responseVariableHasReferences
                                        }}
                                        defaultValue={returnNameState.value}
                                        placeholder={"Enter Response Variable Name"}
                                        onChange={onNameChange}
                                        label={"Response Variable Name"}
                                        errorMessage={responseVarError}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={classes.wizardBtnHolder}>
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
                )
            )}
        </div>
    );
}

// TODO: goToNextTourStep - tour step should update without redux store
// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep,
// };
