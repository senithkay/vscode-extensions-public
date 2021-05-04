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

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { Connector } from "../../../../../Definitions";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import Tooltip from "../../../Portals/ConfigForm/Elements/Tooltip";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { tooltipMessages } from "../../../Portals/utils/constants";
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
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo } = state;
    const connectorConfigFormFields: FormField[] = connectorConfig && connectorConfig.connectorInit && connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const [connectorInitFormFields] = useState(connectorConfigFormFields);
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const initialNameState: NameState = {
        value: connectorConfig.name || genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)),
        isValidName: true,
        isNameProvided: true
    };

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [connectorNameError, setConnectorNameError] = useState('');
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
            const varValidationResponse = checkVariableName("connector name", value, nameState.value, state);
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
                            defaultValue={nameState.value}
                            onChange={onNameChange}
                            label={"Connection Name"}
                            errorMessage={connectorNameError}
                            placeholder={"Enter Connection Name"}
                        />
                        <div className={classNames("product-tour-url")}>
                            <Form fields={connectorInitFormFields} onValidate={onValidateWithTour} />
                        </div>
                    </div>
                </div>
                {/* <div className={wizardClasses.APIbtnWrapper}> */}
                <div className={isNewConnectorInitWizard && homePageEnabled ? classes.wizardCreateBtnHolder : classes.wizardBtnHolder}>
                    <div className={classes.saveBtnHolder}>
                        <Tooltip
                            title={tooltipMessages.connectorButtons.savaButton}
                            interactive={true}
                            placement="top"
                            arrow={true}
                        >
                            <PrimaryButton
                                dataTestId={"http-save-next"}
                                text="Save"
                                className="product-tour-next"
                                disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName)}
                                fullWidth={false}
                                onClick={handleOnSave}
                            />
                        </Tooltip>
                    </div>
                </div>
                {/* <ProductTourStep
                    startCondition={true}

                    waitBeforeShow={2000}
                    step='DIAGRAM_CONFIG_HTTP_URL'
                />
                <ProductTourStep
                    startCondition={true}

                    waitBeforeShow={500}
                    step='DIAGRAM_CONFIG_HTTP_METHOD'
                />
                <ProductTourStep
                    startCondition={true}

                    waitBeforeShow={500}
                    step='DIAGRAM_CONFIG_HTTP_NEXT'
                /> */}
            </FormControl >
        </div >
    );
}

// TODO: goToNextTourStep - tour step should update without redux store
// const mapDispatchToProps = {
//     dispatchGoToNextTourStep: goToNextTourStep,
// };
