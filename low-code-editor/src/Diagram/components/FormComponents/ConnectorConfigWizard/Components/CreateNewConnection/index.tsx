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
import React, {useContext, useEffect, useState} from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { FormControl } from "@material-ui/core";
import { Connector, ConnectorConfig, FormField, LinePrimaryButton, PrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classNames from "classnames";

import { Section } from "../../../../../../components/ConfigPanel";
import { Context } from "../../../../../../Contexts/Diagram";
import { checkVariableName, getManualConnectionDetailsFromFormFields } from "../../../../Portals/utils";
import { Form } from "../../../DynamicConnectorForm";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { ExpressionInjectablesProps } from "../../../FormGenerator";
import { wizardStyles } from "../../style";

interface CreateConnectorFormProps {
    initFields: FormField[];
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave: () => void;
    onSaveNext?: () => void;
    onConfigNameChange: (name: string) => void;
    isNewConnectorInitWizard?: boolean;
    isOauthConnector: boolean;
    responseStatus: number;
    expressionInjectables?: ExpressionInjectablesProps;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const {
        props: { stSymbolInfo },
        api: {
            helpPanel: { openConnectorHelp }
        }
    } = useContext(Context);

    const { onSave, onSaveNext, onBackClick, initFields, connectorConfig, isOauthConnector,
            onConfigNameChange, isNewConnectorInitWizard, connector, responseStatus, expressionInjectables } = props;
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: connectorConfig.name,
        isValidName: !!connectorConfig.name,
        isNameProvided: nameRegex.test(connectorConfig.name)
    };

    const initialConnectionNameState: NameState = {
        value: connectorConfig.connectionName,
        isValidName:  !!connectorConfig.connectionName,
        isNameProvided: !!connectorConfig.connectionName
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [connectionNameState, setConnectionNameState] = useState<NameState>(initialConnectionNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [defaultConnectorName] = useState<string>(connectorConfig.name);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [connectionNameError, setConnectionNameError] = useState('');
    const [configForm, setConfigForm] = useState(initFields);
    const [hasReference, setHasReference] = useState<boolean>(undefined);
    const [isEndpointNameUpdated, setIsEndpointNameUpdated] = useState(false);
    const [isTokenFieldsUpdated, setIsTokenFieldsUpdated] = useState(false)

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        const manualConnectionFormFields = getManualConnectionDetailsFromFormFields(connectorConfig.connectorInit);
        const formattedFields: { name: string; value: string; }[] = [];
        manualConnectionFormFields.selectedFields.forEach((item: any) => {
            if (item.value.slice(0, 1) === '\"' && item.value.slice(-1) === '\"') {
                formattedFields.push({
                    name: item.name,
                    value: item.value.substring(1, (item.value.length - 1))
                });
            }
        });
        formattedFields.length > 0 ? setIsTokenFieldsUpdated(true) : setIsTokenFieldsUpdated(false);
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const symbolRefArray = stSymbolInfo.variableNameReferences.get(connectorConfig.name);
    if (hasReference === undefined) {
        if (!symbolRefArray) {
            setHasReference(false);
        } else if (isNewConnectorInitWizard) {
            setHasReference(symbolRefArray.length > 0);
        } else {
            setHasReference(symbolRefArray.length > 1);
        }
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("connector name", value, defaultConnectorName, stSymbolInfo);
            if (varValidationResponse?.error) {
                setConnectorNameError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    const connectionNameHelpText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.connectionName.help.text",
        defaultMessage: "Name to identify the manual connection"
    });

    const connectionNameCharValidation = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.connectionName.char.validation.error.message",
        defaultMessage: "Connection Name must be at least 2 characters"
    });

    const validateConnectionNameValue = (value: string) => {
        if (value?.length === 1) {
            setConnectionNameError(connectionNameCharValidation);
            return false;
        }
        return true;
    };

    const onConnectionNameChange = (text: string) => {
        setConnectionNameState({
            value: text,
            isNameProvided: text !== '',
            isValidName: validateConnectionNameValue(text)
        });
        connectorConfig.connectionName !== text ? connectorConfig.isConnectionNameUpdated = true : connectorConfig.isConnectionNameUpdated = false;
    };

    const onNameChange = (text: string) => {
        setNameState({
            value: text,
            isNameProvided: text !== '',
            isValidName: validateNameValue(text)
        });
        onConfigNameChange(text);
        connectorConfig.name !== text ? setIsEndpointNameUpdated(true) : setIsEndpointNameUpdated(false);
    };

    const handleOnSave = () => {
        // update config connector name, when user click next button
        connectorConfig.connectionName = connectionNameState.value;
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = configForm;
        openConnectorHelp(connector);
        onSave();
    };

    const createConnectionNameLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.name.label",
        defaultMessage: "Connection Name"
    });

    const createConnectionPlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.placeholder",
        defaultMessage: "Enter connection name"
    });

    const createEndpointNameLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createEndpoint.name.label",
        defaultMessage: "Endpoint Name"
    });

    const createEndpointPlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createEndpoint.placeholder",
        defaultMessage: "Enter endpoint name"
    });

    const backButtonLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.backButton.text",
        defaultMessage: "Back"
    });

    const saveConnectionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.saveButton.label",
        defaultMessage: "Save & Next"
    });

    const title = (
        <div>
      <p>
        <FormattedMessage id="lowcode.develop.connectorForms.createConnection.endPointName.tooltip" defaultMessage="A valid endpoint name should <b>NOT</b> include the following :"values={{b: (chunks: string) => <b>{chunks}</b>}}/>
      </p>
      <ul>
        <li>
          <FormattedMessage id="lowcode.develop.connectorForms.createConnection.endPointName.tooltip.bulletPoint1" defaultMessage="Spaces outside the square brackets"/>
        </li>
        <li>
          <FormattedMessage id="lowcode.develop.connectorForms.createConnection.endPointName.tooltip.bulletPoint2" defaultMessage="A numerical character at the beginning"/>
        </li>
        <li>
          <FormattedMessage id="lowcode.develop.connectorForms.createConnection.endPointName.tooltip.bulletPoint3" defaultMessage="Keywords such as <code>Return</code>, <code>Foreach</code>, <code>Resource</code>, <code>Object</code>, etc." values={{ code: (chunks: string) => <code>{chunks}</code>}} />
        </li>
      </ul>
    </div>
    );


    const handleOnSaveNext = () => {
        // update config connector name, when user click next button
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = configForm;
        connectorConfig.connectionName = connectionNameState.value;
        openConnectorHelp(connector);
        onSaveNext();
    };

    const connectionNameSection = (
        <div className={wizardClasses.section}>
            <Section
                title={createConnectionNameLabel}
                tooltip={connectionNameHelpText}
            >
                <FormTextInput
                    customProps={{
                        validate: validateConnectionNameValue,
                    }}
                    defaultValue={connectionNameState.value}
                    onChange={onConnectionNameChange}
                    errorMessage={connectionNameError}
                    placeholder={createConnectionPlaceholder}
                />
            </Section>
        </div>
    );

    const connectorModuleName = initFields ? initFields[0]?.typeInfo?.moduleName : "";
    const showConnectionNameField = connectorModuleName === "googleapis.gmail" || connectorModuleName === "googleapis.sheets" || connectorModuleName === "googleapis.calendar";
    const isFieldsValid = isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName;
    const isFieldsWithConnectionNameValid =  isFieldsValid && connectionNameState.isNameProvided && connectionNameState.isValidName;
    const isEnabled = showConnectionNameField ? isFieldsWithConnectionNameValid : isFieldsValid;
    let isSaveDisabled;

    if (isNewConnectorInitWizard) {
        isSaveDisabled = isEnabled;
    } else {
        if (connectionNameState.isNameProvided) {
            isSaveDisabled = (isEndpointNameUpdated || isTokenFieldsUpdated || connectorConfig.isConnectionNameUpdated) && isFieldsValid;
        } else {
            isSaveDisabled = nameState.isValidName && nameState.isNameProvided;
        }
    }

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={classNames(wizardClasses.configWizardAPIContainer, wizardClasses.bottomRadius)}>
                    <div className={classes.fullWidth}>
                        {showConnectionNameField && connectionNameSection}
                        <div className={wizardClasses.section}>
                            <Section
                                title={createEndpointNameLabel}
                                tooltipWithListView={{title}}
                            >
                                <FormTextInput
                                    customProps={{
                                        validate: validateNameValue,
                                        disabled: hasReference
                                    }}
                                    defaultValue={nameState.value}
                                    onChange={onNameChange}
                                    errorMessage={connectorNameError}
                                    placeholder={createEndpointPlaceholder}
                                />
                            </Section>
                        </div>
                        <div className={wizardClasses.formWrapper}>
                            <Form fields={configForm} onValidate={onValidate} expressionInjectables={expressionInjectables}/>
                        </div>
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    {/* todo Add the back button if needed */}
                    {/* {(isNewConnectorInitWizard && (connectorConfig.existingConnections || isOauthConnector)) && (
                        <SecondaryButton text={backButtonLabel} fullWidth={false} onClick={onBackClick}/>
                    )} */}
                    <div className={classes.saveConnectorBtnHolder}>
                        {!isNewConnectorInitWizard && (
                            <PrimaryButton
                                text={intl.formatMessage({
                                    id: "lowcode.develop.connectorForms.saveAllConnectionBtn.text",
                                    defaultMessage: "Save Connection"
                                })}
                                fullWidth={false}
                                disabled={!(isSaveDisabled) || !isGenFieldsFilled}
                                onClick={handleOnSave}
                            />
                        )}
                        {isNewConnectorInitWizard && (
                            <>
                                <LinePrimaryButton
                                    text={intl.formatMessage({
                                        id: "lowcode.develop.connectorForms.saveAllConnectionButton.text",
                                        defaultMessage: "Save Connection"
                                    })}
                                    fullWidth={false}
                                    disabled={!(isEnabled)}
                                    onClick={handleOnSave}
                                    dataTestId="save-connection-btn"
                                />
                                <PrimaryButton
                                    text={intl.formatMessage({
                                        id: "lowcode.develop.connectorForms.saveAllInvokeConnectionButton.text",
                                        defaultMessage: "Continue to Invoke API"
                                    })}
                                    fullWidth={false}
                                    disabled={!(isEnabled)}
                                    onClick={handleOnSaveNext}
                                    dataTestId="save-and-continue-connection-btn"
                                />
                            </>
                        )}
                    </div>
                </div>
            </FormControl>
        </div>
    );
}
