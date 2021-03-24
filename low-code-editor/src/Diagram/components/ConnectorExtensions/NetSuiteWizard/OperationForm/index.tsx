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
import React, { useContext, useState } from 'react';

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { ConnectionDetails } from "../../../../../api/models";
import { ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from '../../../../../Contexts/Diagram';
import { STModification } from "../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { Get } from '../Get';
import { GetAll } from "../GetAll";

export interface OperationFormProps {
    selectedOperation: string;
    showConnectionName: boolean;
    formFields: FormField[];
    onSave: (sourceModifications?: STModification[]) => void;
    connectionDetails: ConnectorConfig;
    mutationInProgress: boolean;
    isManualConnection: boolean;
    isNewConnectorInitWizard: boolean;
    connectionInfo: ConnectionDetails;
    onConnectionChange: () => void;
    onOperationChange: () => void;
}

export function OperationForm(props: OperationFormProps) {
    const { selectedOperation, showConnectionName, formFields, onSave, connectionDetails, onConnectionChange,
            onOperationChange, mutationInProgress, isManualConnection, connectionInfo } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo } = state;
    const wizardClasses = wizardStyles();
    const classes = useStyles();

    const handleOnSave = () => {
        onSave();
    };

    const [validForm, setValidForm] = useState(selectedOperation === "getAll");
    const [validName, setValidName] = useState(true);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(connectionDetails?.action?.returnVariableName || genVariableName(connectionDetails.action.name + "Response", getAllVariables(symbolInfo)));
    const [responseVarError, setResponseVarError] = useState("");
    const customizedOperations = ["getAll", "get"];

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const onNameChange = (text: string) => {
        setValidName((text !== '') && nameRegex.test(text));
        setDefaultResponseVarName(text);
        connectionDetails.action.returnVariableName = text;
    };
    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("response name", value, defaultResponseVarName, state);
            if (varValidationResponse?.error){
                setResponseVarError(varValidationResponse.message);
                return false;
            }
        }
        return true;
    };

    connectionDetails.action.returnVariableName = defaultResponseVarName;

    const validateForm = (isRequiredFilled: boolean) => {
        setValidForm(isRequiredFilled);
    };

    // validate custom forms

    let isSaveButtonDisabled = showConnectionName ? (!validForm || mutationInProgress || !validName) :
        !validForm || mutationInProgress;
    if ((formFields.length === 0) && validName && !mutationInProgress) {
        isSaveButtonDisabled = false;
    }

    const showCalenderSelector = (!isManualConnection && connectionInfo) ? true : false;
    formFields[0].hide = showCalenderSelector;

    return (
        <div>
            <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                <div className={classes.fullWidth}>
                    {showConnectionName ? (
                        <>
                        <p className={wizardClasses.subTitle}>Connection</p>
                         <Box border={1} borderRadius={5} className={wizardClasses.box}>
                            <Typography variant="subtitle2">
                                {connectionDetails.name}
                            </Typography>
                            <IconButton
                                color="primary"
                                classes={ {
                                    root: wizardClasses.changeConnectionBtn
                                } }
                                onClick={onConnectionChange}
                            >
                                <EditIcon />
                            </IconButton>
                        </Box>
                        </>
                    ) : null
                    }
                    <>
                    <p className={wizardClasses.subTitle}>Operation</p>
                    <Box border={1} borderRadius={5} className={wizardClasses.box}>
                        <Typography variant="subtitle2">
                            {selectedOperation}
                        </Typography>
                        <IconButton
                            color="primary"
                            classes={ {
                                root: wizardClasses.changeConnectionBtn
                            } }
                            onClick={onOperationChange}
                        >
                            <EditIcon />
                        </IconButton>
                    </Box>
                    </>
                    <div className={wizardClasses.formWrapper}>
                        {formFields.length > 0 && (
                            <>
                                {selectedOperation === "getAll" && (
                                     <GetAll formFields={formFields} onValidate={validateForm} />
                                )}
                                {selectedOperation === "get" && (
                                    <Get formFields={formFields} onValidate={validateForm} />
                                )}
                                {customizedOperations.indexOf(selectedOperation) < 0 && (
                                    <Form fields={formFields} onValidate={validateForm} />
                                )}
                            </>
                        )}
                    </div>

                    <FormTextInput
                        customProps={{
                            validate: validateNameValue
                        }}
                        defaultValue={defaultResponseVarName}
                        placeholder={"Enter Response Variable Name"}
                        onChange={onNameChange}
                        label={"Response Variable Name"}
                        errorMessage={responseVarError}
                    />
                </div>
            </div>
            <div className={classes.wizardBtnHolder}>
                <PrimaryButton
                    dataTestId={"calender-save-btn"}
                    className={wizardClasses.buttonSm}
                    text="Save"
                    fullWidth={false}
                    disabled={isSaveButtonDisabled}
                    onClick={handleOnSave}
                />
            </div>
        </div>
    );
}
