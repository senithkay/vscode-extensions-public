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
import { useIntl } from "react-intl";

import { FormControl } from "@material-ui/core";
import classNames from "classnames";

import { Section } from "../../../../../components/ConfigPanel";
import { ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../Contexts/Diagram"
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName } from "../../../Portals/utils";

interface CreateConnectorFormProps {
    initFields: FormField[];
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave: () => void;
    onSaveNext?: () => void;
    onConfigNameChange: (name: string) => void;
    isNewConnectorInitWizard?: boolean;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const { props: { stSymbolInfo: symbolInfo } } = useContext(Context);
    const { onSave, onSaveNext, onBackClick, initFields, connectorConfig, onConfigNameChange,
            isNewConnectorInitWizard } = props;
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const intl = useIntl();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: '',
        isValidName: true,
        isNameProvided: true
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [isValidForm, setIsValidForm] = useState(false);
    const [connectorInitFields, setConnectorInitFields] = useState(initFields);
    const [defaultConnectorName, setDefaultConnectorName] = useState<string>(undefined);
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

    // generate variable name and set to default text
    const defaultText: string = connectorConfig.name;
    if (defaultConnectorName === undefined) {
        setDefaultConnectorName(connectorConfig.name);
    }

    if ((connectorConfig.name === "" || connectorConfig.name === undefined) && nameState.isValidName) {
        connectorConfig.name = defaultText;
        setNameState({
            value: defaultText,
            isNameProvided: defaultText !== '',
            isValidName: nameRegex.test(defaultText)
        });
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("connector name", value, defaultConnectorName, symbolInfo);
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
        onConfigNameChange(text);
    };

    const validateForm = (isRequiredFilled: boolean) => {
        setIsValidForm(isRequiredFilled);
    };

    const handleOnSave = () => {
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = connectorInitFields;
        onSave();
    };

    const handleOnSaveNext = () => {
        // update config connector name, when user click next button
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = connectorInitFields;
        onSaveNext();
    };

    const filteredFormFields = () => {
        return connectorInitFields.find(config => config.name === "gmailConfig").fields
        .find(field => field.name === "oauthClientConfig").fields
        .filter(field => field.name === "refreshUrl" || field.name === "refreshToken" || field.name === "clientSecret" || field.name === "clientId");
    };

    const createConnectionNameLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.name.label",
        defaultMessage: "Connection Name"
    });

    const createConnectionPlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.placeholder",
        defaultMessage: "Enter connection name"
    });

    const backButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.backButton.text",
        defaultMessage: "Back"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.saveButton.label",
        defaultMessage: "Save & Next"
    });

    const pathInstructionsBullet1 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.tooltip.instructions.bulletPoint1",
        defaultMessage: "Include spaces and special characters"
      });

    const pathInstructionsBullet2 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.tooltip.instructions.bulletPoint2",
        defaultMessage: "Start with a numerical character"
      });

    const pathInstructionsBullet3 = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.tooltip.instructions.bulletPoint3",
        defaultMessage: "Include keywords such as Return, Foreach, Resource, Object, etc."
      });

    const pathInstructions = intl.formatMessage({
        id: "lowcode.develop.connectorForms.Gmail.createConnection.tooltip.instructions.tooltip",
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
                <div className={classNames(wizardClasses.configWizardAPIContainer, wizardClasses.bottomRadius)}>
                    <div className={classes.fullWidth}>
                        <div>
                        <Section
                                title={createConnectionNameLabel}
                                tooltip={{title}}
                        >
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                disabled: hasReference,
                            }}
                            defaultValue={defaultText}
                            onChange={onNameChange}
                            errorMessage={connectorNameError}
                            placeholder={createConnectionPlaceholder}
                        />
                        </Section>
                        </div>
                        <Form fields={filteredFormFields()} onValidate={validateForm} />
                    </div>
                </div>
                <div className={isNewConnectorInitWizard ? classes.wizardCreateBtnHolder : classes.wizardBtnHolder}>
                    {isNewConnectorInitWizard && (
                        <SecondaryButton text={backButtonText} fullWidth={false} onClick={onBackClick} />
                    )}
                    <PrimaryButton
                        dataTestId={"gmail-save-next-btn"}
                        text={saveConnectionButtonText}
                        disabled={!(nameState.isNameProvided && nameState.isValidName && isValidForm)}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
        </div>
    );
}
