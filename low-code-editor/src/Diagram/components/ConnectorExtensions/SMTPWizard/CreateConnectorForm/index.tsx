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

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { tooltipMessages } from "../../../Portals/utils/constants";

// import '../style.scss'
interface CreateConnectorFormProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connector: Connector;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
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
    const { onBackClick, onSave, functionDefinitions, connectorConfig, connector, isNewConnectorInitWizard, homePageEnabled } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo } = state;
    const configForm: FormField[] = connectorConfig && connectorConfig.connectorInit && connectorConfig.connectorInit.length > 0 ?
        connectorConfig.connectorInit : functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const [connectorInitFormFields, setConnectorInitFormFields] = useState(configForm);
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: connectorConfig.name,
        isValidName: true,
        isNameProvided: true
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [connectorNameError, setConnectorNameError] = useState('');
    const [defaultConnectorName, setDefaultConnectorName] = useState<string>(undefined);
    const [hasReference, setHasReference] = useState<boolean>(undefined);

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

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    // generate variable name and set to default text
    const defaultText: string = (connectorConfig.name === "" || connectorConfig.name === undefined) ?
        genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)) : connectorConfig.name;

    if (defaultConnectorName === undefined){
        setDefaultConnectorName(connectorConfig.name);
    }

    // Set init function of the connector.
    // connectorConfig.connectorInit = connectorInitFormFields;

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
    };

    const handleOnSave = () => {
        const actionName = "sendEmailMessage";

        // if connector name available skip setting new value
        connectorConfig.name = nameState.value;
        connectorConfig.action = {
            name: actionName,
            fields: functionDefinitions.get(actionName)?.parameters
        }
        connectorConfig.connectorInit = connectorInitFormFields;
        onSave();
    };


    return (
        <div>
            <FormControl className={wizardClasses.mainWrapper}>
                <div className={wizardClasses.configWizardAPIContainer}>
                    <div className={classes.fullWidth}>
                        <FormTextInput
                            customProps={{
                                validate: validateNameValue,
                                tooltipTitle: tooltipMessages.connectionName,
                                disabled: hasReference
                            }}
                            defaultValue={defaultText}
                            onChange={onNameChange}
                            label={"Connection Name"}
                            errorMessage={connectorNameError}
                            placeholder={"Enter Connection Name"}
                        />
                        <div className={wizardClasses.formWrapper}>
                            <Form fields={connectorInitFormFields} onValidate={onValidate} />
                        </div>
                    </div>
                </div>
                {/* <div className={wizardClasses.APIbtnWrapper}> */}
                <div className={classes.wizardBtnHolder}>
                    {isNewConnectorInitWizard && homePageEnabled && (
                        <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick}/>
                    )}
                    <PrimaryButton
                        text="Save &amp; Next"
                        disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
                    {/* </div> */}
                </div>
            </FormControl>
        </div >
    );
}
