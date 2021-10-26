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

import { FormControl } from "@material-ui/core";
import classNames from "classnames";

import { Section } from "../../../../../../components/ConfigPanel";
import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { Connector } from "../../../../../../Definitions";
import { getAllVariables } from "../../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { LinePrimaryButton } from "../../../FormFieldComponents/Button/LinePrimaryButton";
import { PrimaryButton } from "../../../FormFieldComponents/Button/PrimaryButton";
import { SecondaryButton } from "../../../FormFieldComponents/Button/SecondaryButton";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { Form } from "../../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import '../style.scss';

interface CreateConnectorFormProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSaveNext?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard?: boolean;
    homePageEnabled: boolean;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const { onBackClick, onSaveNext, functionDefinitions, connectorConfig, connector, isNewConnectorInitWizard, homePageEnabled, onSave } = props;
    const { props: { stSymbolInfo: symbolInfo } } = useContext(Context);

    const connectorConfigFormFields: FormField[] = connectorConfig && connectorConfig.connectorInit && connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const [connectorInitFormFields] = useState(connectorConfigFormFields);
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: connectorConfig.name || genVariableName(connector.moduleName + "Endpoint", getAllVariables(symbolInfo)),
        isValidName: true,
        isNameProvided: true
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [hasReference, setHasReference] = useState<boolean>(undefined);

    const symbolRefArray = symbolInfo.variableNameReferences.get(connectorConfig.name);
    if (hasReference === undefined) {
        if (!symbolRefArray) {
            setHasReference(false);
        } else if (isNewConnectorInitWizard) {
            setHasReference(symbolRefArray.length > 0);
        } else {
            setHasReference(symbolRefArray.length > 1);
        }
    }

    const onValidateWithTour = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);

        // TODO: goToNextTourStep - tour step should update without redux store
        // if (urlField && urlField.value === `"${TOUR_API_URL}"`) {
        //     dispatchGoToNextTourStep("DIAGRAM_CONFIG_HTTP_URL");
        // }
    };


    // Set init function of the connector.
    connectorConfig.connectorInit = connectorInitFormFields;


    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("connector name", value, nameState.value, symbolInfo);
            if (varValidationResponse?.error) {
                setConnectorNameError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    const onNameChange = (text: string) => {
        setNameState({
            value: text,
            isNameProvided: text !== '',
            isValidName: validateNameValue(text)
        });
    };

    const handleOnSaveNext = () => {
        // update config connector name, when user click next button
        // if connector name available skip setting new value
        connectorConfig.name = nameState.value;
        onSaveNext();
        // TODO: tour step should update without redux store
        // dispatchGoToNextTourStep("DIAGRAM_CONFIG_HTTP_NEXT");
    };

    const handleOnSave = () => {
        // update config connector name, when user click next button
        // if connector name available skip setting new value
        connectorConfig.name = nameState.value;
        onSave();
    };

    const createConnectionNameLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.name.label",
        defaultMessage: "Connection Name"
    });

    const connectionNamePlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.name.placeholder",
        defaultMessage: "Enter connection name"
    });

    const backButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.backButton.text",
        defaultMessage: "Back"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.saveButton.text",
        defaultMessage: "Save & Next"
    });

    const GETOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.GET.label",
        defaultMessage: "GET"
    });

    const POSTOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.POST.label",
        defaultMessage: "POST"
    });

    const PUTOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.PUT.label",
        defaultMessage: "PUT"
    });

    const PATCHOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.PATCH.label",
        defaultMessage: "PATCH"
    });

    const FORWARDOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.FORWARD.label",
        defaultMessage: "FORWARD"
    });

    const DELETEOperationLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.operations.DELETE.label",
        defaultMessage: "DELETE"
    });

    const pathInstructionsBullet1 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.tooltip.instructions.bulletPoint1",
        defaultMessage: "Include spaces and special characters"
    });

    const pathInstructionsBullet2 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.tooltip.instructions.bulletPoint2",
        defaultMessage: "Start with a numerical character"
    });

    const pathInstructionsBullet3 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.tooltip.instructions.bulletPoint3",
        defaultMessage: "Include keywords such as Return, Foreach, Resource, Object, etc."
    });

    const pathInstructions = intl.formatMessage({
        id: "lowcode.develop.connectorForms.HTTP.createConnection.tooltip.instructions.tooltip",
        defaultMessage: "A valid connection name should not:"
    });
    const title = (
        <div>
            <p>{pathInstructions}</p>
            <ul>
                <li>{pathInstructionsBullet1}</li>
                <li>{pathInstructionsBullet2}</li>
                <li>{pathInstructionsBullet3}</li>
            </ul>
        </div>
    );

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={wizardClasses.configWizardAPIContainer}>
                    <div className={classes.fullWidth}>
                        <Section
                            title={createConnectionNameLabel}
                            tooltip={{ title }}
                        >
                            <FormTextInput
                                customProps={{
                                    validate: validateNameValue,
                                    disabled: hasReference
                                }}
                                defaultValue={nameState.value}
                                onChange={onNameChange}
                                errorMessage={connectorNameError}
                                placeholder={connectionNamePlaceholder}
                            />
                        </Section>
                        <div className={classNames("product-tour-url")}>
                            <Form fields={connectorInitFormFields} onValidate={onValidateWithTour} />
                        </div>
                    </div>
                </div>
                {/* <div className={wizardClasses.APIbtnWrapper}> */}
                <div className={classes.wizardBtnHolder}>
                    <div className={classes.saveConnectorBtnHolder}>
                        {!isNewConnectorInitWizard && (
                            <PrimaryButton
                                text={intl.formatMessage({
                                    id: "lowcode.develop.connectorForms.saveHttpConnectionBtn.text",
                                    defaultMessage: "Save Connection"
                                })}
                                fullWidth={false}
                                disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                                onClick={handleOnSave}
                            />
                        )}
                        {isNewConnectorInitWizard && (
                            <>
                                <LinePrimaryButton
                                    dataTestId={"http-save"}
                                    text={intl.formatMessage({
                                        id: "lowcode.develop.connectorForms.saveHttpConnectionBtn.text",
                                        defaultMessage: "Save Connection"
                                    })}
                                    className="product-tour-next"
                                    disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                                    fullWidth={false}
                                    onClick={handleOnSave}
                                />
                                <PrimaryButton
                                    dataTestId={"http-save-next"}
                                    text={intl.formatMessage({
                                        id: "lowcode.develop.connectorForms.saveHttpInvokeConnectionBtn.text",
                                        defaultMessage: "Continue to Invoke API"
                                    })}
                                    className="product-tour-next"
                                    disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                                    fullWidth={false}
                                    onClick={handleOnSaveNext}
                                />
                            </>
                        )}
                    </div>
                </div>
            </FormControl >
        </div >
    );
}

// TODO: goToNextTourStep - tour step should update without redux store
// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep,
// };
