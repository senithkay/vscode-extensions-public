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

import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@material-ui/core";
import classNames from "classnames";

import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { useStyles as useStyleForRadio } from "../../../Portals/ConfigForm/Elements/RadioControl/style";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
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
    const connectorConfigFormFields: FormField[] = connectorConfig && connectorConfig.connectorInit && connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const [connectorInitFormFields, setConnectorInitFormFields] = useState(connectorConfigFormFields);
    const classes = useStyles();
    const radioClasses = useStyleForRadio();
    const wizardClasses = wizardStyles();
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const initialNameState: NameState = {
        value: connectorConfig.name,
        isValidName: true,
        isNameProvided: true
    };
    // Action for the connector
    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    const initActionNameSelect: string = action.name && action.name !== "get" && action.name !== "post" && action.name !== "put" ? action.name : "";
    const initActionNameRadio: string = action.name ? action.name : "";

    const [nameState, setNameState] = useState<NameState>(initialNameState);
    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(false);
    const [actionNameSelect] = useState(initActionNameSelect);
    const [actionNameRadio, setActionNameRadio] = useState(initActionNameRadio);
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

    // generate variable name and set to default text
    const defaultText: string = (connectorConfig.name === "" || connectorConfig.name === undefined) ?
        genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)) : connectorConfig.name;

    // Set init function of the connector.
    connectorConfig.connectorInit = connectorInitFormFields;

    // check for name when navigating back
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
            const varValidationResponse = checkVariableName("connector name", value, defaultText, state);
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
        // update config connector name, when user click next button
        // if connector name available skip setting new value
        connectorConfig.name = nameState.value;
        onSave();
        // TODO: tour step should update without redux store
        // dispatchGoToNextTourStep("DIAGRAM_CONFIG_HTTP_NEXT");
    };

    const handleOnOperationRadioChange = (event: any) => {
        const actionName = event.target.value;
        connectorConfig.action = {
            name: actionName,
            fields: functionDefinitions.get(actionName).parameters
        };
        setActionNameRadio(actionName);
        // TODO: tour step should update without redux store
        // if (actionName === "get") {
        //     dispatchGoToNextTourStep("DIAGRAM_CONFIG_HTTP_METHOD");
        // }
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
                        <div className={classNames("product-tour-url")}>
                            <Form fields={connectorInitFormFields} onValidate={onValidateWithTour} />
                        </div>
                        <div className={classNames(classes.groupedForm, classes.marginTB, "product-tour-operation")}>
                            <div className={classes.labelWrapper}>
                                <FormHelperText className={classes.inputLabelForRequired}>Select an Operation</FormHelperText>
                                <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                            </div>
                            <RadioGroup aria-label={"operations"} name={"operations"} value={actionNameRadio} onChange={handleOnOperationRadioChange} >
                                <FormControlLabel
                                    value={"get"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"GET"}
                                />
                                <FormControlLabel
                                    data-testid={"post"}
                                    value={"post"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"POST"}
                                />
                                <FormControlLabel
                                    value={"put"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"PUT"}
                                />
                                <FormControlLabel
                                    value={"delete"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"DELETE"}
                                />
                                <FormControlLabel
                                    value={"patch"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"PATCH"}
                                />
                                <FormControlLabel
                                    value={"forward"}
                                    control={<Radio classes={{ root: radioClasses.radiobtn, checked: radioClasses.checked }} />}
                                    label={"FORWARD"}
                                />
                            </RadioGroup>
                        </div>
                    </div>
                </div>
                {/* <div className={wizardClasses.APIbtnWrapper}> */}
                <div className={classes.wizardBtnHolder}>
                    {isNewConnectorInitWizard && homePageEnabled && (
                        <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick}/>
                    )}
                    <PrimaryButton
                        dataTestId={"http-save-next"}
                        text="Save &amp; Next"
                        className="product-tour-next"
                        disabled={!(isGenFieldsFilled && nameState.isNameProvided && nameState.isValidName && ((actionNameSelect && actionNameSelect !== "") || (actionNameRadio && actionNameRadio !== "")))}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
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
