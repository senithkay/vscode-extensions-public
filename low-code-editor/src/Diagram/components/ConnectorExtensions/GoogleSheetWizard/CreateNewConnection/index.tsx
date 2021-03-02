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

import { FormControl } from "@material-ui/core";
import classNames from "classnames";

import { ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { checkVariableName } from "../../../Portals/utils";

interface CreateConnectorFormProps {
    initFields: FormField[];
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave: () => void;
    onConfigNameChange: (name: string) => void;
    isNewConnectorInitWizard?: boolean;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const { onSave, onBackClick, initFields, connectorConfig, onConfigNameChange, isNewConnectorInitWizard } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo } = state;
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: '',
        isValidName: true,
        isNameProvided: true
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [isAccessTokenValid, setIsAccessTokenValid] = useState(false);
    const [isValidForm, setIsValidForm] = useState(false);
    const [connectorInitFields] = useState(initFields);
    const [defaultConnectorName, setDefaultConnectorName] = useState<string>(undefined);
    const [hasReference, setHasReference] = useState<boolean>(undefined);

    // generate variable name and set to default text
    const defaultText: string = connectorConfig.name;
    if (defaultConnectorName === undefined){
        setDefaultConnectorName(connectorConfig.name);
    }

    // Set init function of the connector.

    if ((connectorConfig.name === "" || connectorConfig.name === undefined) && nameState.isValidName) {
        connectorConfig.name = defaultText;
        setNameState({
            value: defaultText,
            isNameProvided: defaultText !== '',
            isValidName: nameRegex.test(defaultText)
        });
    }

    const symbolRefArray = symbolInfo.variableNameReferences.get(connectorConfig.name);
    if (hasReference === undefined){
        if (!symbolRefArray){
            setHasReference(false);
        } else if (isNewConnectorInitWizard) {
            setHasReference(symbolRefArray.length > 0);
        } else {
            setHasReference(symbolRefArray.length > 1);
        }
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("connector name", value, defaultConnectorName, state);
            if (varValidationResponse?.error){
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

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setIsAccessTokenValid(!isInvalid)
    };
    const onAccessTokenChange = (text: string) => {
        setFormFieldValue(text, "accessToken");
    };

    const setFormFieldValue = (text: string, key: string, title?: string) => {
        if (title) {
            connectorInitFields.find(config => config.name === "spreadsheetConfig")
                .fields.find(field => field.name === "oauth2Config")
                .fields.find(field => field.name === title)
                .fields.find(field => field.name === key).value = text;
        } else {
            connectorInitFields.find(config => config.name === "spreadsheetConfig")
                .fields.find(field => field.name === "oauth2Config")
                .fields.find(field => field.name === key).value = text;
        }
    }

    let accessTokenDefaultValue = '';
    if (!isNewConnectorInitWizard) {
        const spreadsheetConfig = connectorInitFields.find(config => config.name === "spreadsheetConfig");
        const oauth2Config = spreadsheetConfig ? spreadsheetConfig.fields.find(field => field.name === "oauth2Config") : undefined;
        const accessToken = oauth2Config ? oauth2Config.fields.find(field => field.name === 'accessToken') : undefined;
        accessTokenDefaultValue = accessToken ? accessToken.value : '';
    }

    const expElementProps: FormElementProps = {
        model: {
            type: "string",
            name: "Access Token"
        },
        customProps: {
            validate: validateExpression,
            statementType: 'string'
        },
        onChange: onAccessTokenChange,
        defaultValue: accessTokenDefaultValue
    };

    const validateForm = (isRequiredFilled: boolean) => {
        setIsValidForm(isRequiredFilled);
    };

    const handleOnSave = () => {
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = connectorInitFields;
        onSave();
    };

    const filteredFormFields = () => {
        return connectorInitFields.find(config => config.name === "spreadsheetConfig").fields
            .find(field => field.name === "oauth2Config").fields
            .filter(field => field.name === "accessToken" || field.name === "refreshConfig")
            .find(field => field.name === "refreshConfig").fields
            .filter(field => field.name === "refreshUrl" || field.name === "refreshToken" || field.name === "clientSecret" || field.name === "clientId")
    }

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={classNames(wizardClasses.configWizardAPIContainer, wizardClasses.bottomRadius)}>
                    <div className={classes.fullWidth}>
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                disabled: hasReference
                            }}
                            defaultValue={defaultText}
                            onChange={onNameChange}
                            label={"Connection Name"}
                            errorMessage={connectorNameError}
                            placeholder={"Enter Connection Name"}
                        />
                        <ExpressionEditor {...expElementProps} />
                        <Form fields={filteredFormFields()} onValidate={validateForm} />
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    {isNewConnectorInitWizard && (
                        <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick}/>
                    )}
                    <PrimaryButton
                        dataTestId={"sheet-save-next-btn"}
                        text="Save &amp; Next"
                        disabled={!(isAccessTokenValid && nameState.isNameProvided && nameState.isValidName && isValidForm)}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
        </div>
    );
}
