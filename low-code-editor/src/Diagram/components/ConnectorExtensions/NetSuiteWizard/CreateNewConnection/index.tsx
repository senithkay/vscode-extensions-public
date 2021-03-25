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
import { Context } from "../../../../../Contexts/Diagram";
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName } from "../../../Portals/utils";
import { tooltipMessages } from "../../../Portals/utils/constants";

interface CreateConnectorFormProps {
    initFields: FormField[];
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave: () => void;
    onConfigNameChange: (name: string) => void;
    isNewConnectorInitWizard?: boolean;
    isOauthConnector: boolean;
}

interface NameState {
    value: string;
    isNameProvided: boolean;
    isValidName: boolean;
}

export function CreateConnectorForm(props: CreateConnectorFormProps) {
    const { state } = useContext(Context);
    const { stSymbolInfo : symbolInfo } = state;
    const { onSave, onBackClick, initFields, connectorConfig, isOauthConnector,
            onConfigNameChange, isNewConnectorInitWizard } = props;
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: connectorConfig.name,
        isValidName:  !!connectorConfig.name,
        isNameProvided: nameRegex.test(connectorConfig.name)
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [defaultConnectorName] = useState<string>(connectorConfig.name);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [configForm, setConfigForm] = useState(initFields);
    const [hasReference, setHasReference] = useState<boolean>(undefined);

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

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

    const handleOnSave = () => {
        // update config connector name, when user click next button
        connectorConfig.name = nameState.value;
        connectorConfig.connectorInit = configForm;
        onSave();
    };

    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={classNames(wizardClasses.configWizardAPIContainer, wizardClasses.bottomRadius)}>
                    <div className={classes.fullWidth}>
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                tooltipTitle: tooltipMessages.connectionName,
                                disabled: hasReference
                            }}
                            defaultValue={nameState.value}
                            onChange={onNameChange}
                            label={"Connection Name"}
                            errorMessage={connectorNameError}
                            placeholder={"Enter Connection Name"}
                        />
                        <div className={wizardClasses.formWrapper}>
                            <Form fields={configForm} onValidate={onValidate} />
                        </div>
                    </div>
                </div>
                <div className={classes.wizardBtnHolder}>
                    {(isNewConnectorInitWizard && (connectorConfig.existingConnections || isOauthConnector)) && (
                        <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick}/>
                    )}
                    <PrimaryButton
                        text="Save &amp; Next"
                        disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
                </div>
            </FormControl>
        </div>
    );
}
