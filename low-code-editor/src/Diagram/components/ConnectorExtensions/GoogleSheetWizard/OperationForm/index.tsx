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
import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { ConnectionDetails } from "../../../../../api/models";
import { ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext} from '../../../../../Contexts/Diagram';
import {
    GithubRepo,
    GSpreadsheet
} from "../../../../../Definitions";
import { STModification } from "../../../../../Definitions/lang-client-extended";
import { CirclePreloader } from "../../../../../PreLoader/CirclePreloader";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { FormAutocomplete } from "../../../Portals/ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../Portals/utils";

export interface OperationFormProps {
    selectedOperation: string;
    showConnectionName: boolean;
    formFields: FormField[];
    onSave: (sourceModifications?: STModification[]) => void;
    connectionDetails: ConnectorConfig;
    mutationInProgress: boolean;
    isManualConnection: boolean;
    connectionInfo: ConnectionDetails;
    onConnectionChange: () => void;
    onOperationChange: () => void;
}

export function OperationForm(props: OperationFormProps) {
    const { selectedOperation, showConnectionName, formFields, onSave, connectionDetails, onConnectionChange,
            onOperationChange, mutationInProgress, isManualConnection,
            // gsheetConnections, dispatchFetchGsheetList,
            connectionInfo } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, currentApp, getGsheetList } = state;
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();

    const handleOnSave = () => {
        onSave();
    };

    const [validForm, setValidForm] = useState(selectedOperation === "createEvent");
    const [validName, setValidName] = useState(true);
    const [isGSpreadsheetFetching, setIsGSpreadsheetFetching] = useState(false);
    const [gSpreadsheetList, setGSpreadsheetList] = useState<GSpreadsheet[]>(undefined);
    const [activeGsheet, setActiveGsheet] = useState<ConnectionDetails>(null);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(connectionDetails.action.returnVariableName || genVariableName(connectionDetails.action.name + "Response", getAllVariables(symbolInfo)));
    const [responseVarError, setResponseVarError] = useState("");

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

    const showSheetSelector = !isManualConnection && connectionInfo && (selectedOperation === "openSpreadsheetById");
    if (formFields.find(field => field.name === "spreadsheetId")){
        formFields.find(field => field.name === "spreadsheetId").hide = showSheetSelector;
    }

    const handleGsheetChange = (event: object, value: any) => {
        setActiveGsheet(value);
        setValidForm(true);
        formFields[0].value = "\"" + value?.id + "\"";
    };
    function handleItemLabel(githubRepo: GithubRepo) {
        return githubRepo.name;
    }

    useEffect(() => {
        if (showSheetSelector) {
            setIsGSpreadsheetFetching(true);
            (async () => {
                const sheetList = await getGsheetList(currentApp?.org, connectionInfo.handle);
                setGSpreadsheetList(sheetList);
                setIsGSpreadsheetFetching(false);
            })();
        }
    }, [ connectionInfo ]);

    let isSaveButtonDisabled = showConnectionName ? (!validForm || mutationInProgress || !validName) :
        !validForm || mutationInProgress;
    if ((formFields.length === 0) && validName && !mutationInProgress) {
        isSaveButtonDisabled = false;
    }

    const chooseGSheetPlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.GSheet.operationForm.chooseCalendar.placeholder",
        defaultMessage: "Choose a spreadsheet"
    });

    const addResponseVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.GSheet.addResponseVariable.placeholder",
        defaultMessage: "Enter response variable name"
    });

    const addResponseVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.GSheet.addResponseVariable.label",
        defaultMessage: "Response Variable Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.GSheet.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    const GSheetTooltipMessages = {
        responseVariableName: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.GSheet.responseVariableNametooltip.title",
                defaultMessage: "Add a valid name for the response variable. Avoid using special characters, having spaces in the middle, starting with a numerical character, and including keywords such as Return, Foreach, Resource, Object, etc."
            }),
    }
    };

    return (
        <div>
            <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                <div className={classes.fullWidth}>
                    {showConnectionName ? (
                        <>
                        <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GSheet.operationForm.title" defaultMessage="Connection"/></p>
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
                    <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GSheet.operationForm.operation.title" defaultMessage="Operation"/></p>
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
                        {formFields.length > 0 ? (
                            <div>
                                {showSheetSelector && (
                                    <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GSheet.operationForm.showCalendar.title" defaultMessage="Select Sheet"/></p>
                                )}
                                {showSheetSelector && isGSpreadsheetFetching && (
                                    <CirclePreloader position="relative" />
                                )}
                                {showSheetSelector && !isGSpreadsheetFetching && gSpreadsheetList && (
                                    <FormAutocomplete
                                        placeholder={chooseGSheetPlaceholder}
                                        itemList={gSpreadsheetList}
                                        value={activeGsheet}
                                        getItemLabel={handleItemLabel}
                                        onChange={handleGsheetChange}
                                    />
                                )}
                                <Form fields={formFields} onValidate={validateForm}/>
                            </div>
                            ) : null
                        }
                    </div>

                    <FormTextInput
                        customProps={{
                            validate: validateNameValue,
                            tooltipTitle: GSheetTooltipMessages.responseVariableName.title,
                        }}
                        defaultValue={defaultResponseVarName}
                        placeholder={addResponseVariablePlaceholder}
                        onChange={onNameChange}
                        label={addResponseVariableLabel}
                        errorMessage={responseVarError}
                    />
                </div>
            </div>
            <div className={classes.wizardBtnHolder}>
                <PrimaryButton
                    dataTestId={"sheet-save-btn"}
                    className={wizardClasses.buttonSm}
                    text={saveConnectionButtonText}
                    fullWidth={false}
                    disabled={isSaveButtonDisabled}
                    onClick={handleOnSave}
                />
            </div>
        </div>
    );
}
