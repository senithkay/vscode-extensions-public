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
import { Context as DiagramContext } from '../../../../../Contexts/Diagram';
import { Gcalendar } from "../../../../../Definitions";
import { STModification } from "../../../../../Definitions/lang-client-extended";
import {CirclePreloader} from "../../../../../PreLoader/CirclePreloader";
import { getAllVariables } from "../../../../utils/mixins";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { FormAutocomplete } from "../../../Portals/ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../Portals/ConfigForm/forms/Components/Form";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { checkVariableName, genVariableName } from "../../../Portals/utils";
import { CreateEvent } from "../CreateEvent";

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
            onOperationChange, mutationInProgress, isManualConnection, isNewConnectorInitWizard,
            connectionInfo } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, currentApp, getGcalendarList } = state;
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();

    const handleOnSave = () => {
        onSave();
    };

    const [validForm, setValidForm] = useState(false);
    const [validName, setValidName] = useState(true);
    const [fieldChecker] = useState(new Map<string, boolean>());
    const [isCalenderFetching, setIsCalenderFetching] = useState(false);
    const [gcalenderList, setGcalenderList] = useState<Gcalendar[]>(undefined)
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    const [defaultResponseVarName, setDefaultResponseVarName] = useState<string>(connectionDetails?.action?.returnVariableName || genVariableName(connectionDetails.action.name + "Response", getAllVariables(symbolInfo)));
    const [responseVarError, setResponseVarError] = useState("");
    let showCalendarSelector = false;

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

    const validateForm = (validity: boolean) => {
        // check form validity before update state to avoid too many renders
        if (validForm !== validity){
            setValidForm(validity);
        }
    };

    // validate custom forms
    const validateFields = (field: string, isInvalid: boolean): void => {
        fieldChecker.set(field, isInvalid);
        let allFieldsValid = true;
        if (isInvalid) {
            validateForm(false);
        } else {
            fieldChecker.forEach((invalid: boolean) => {
                if (invalid) {
                    allFieldsValid = false;
                    return;
                }
            });
            validateForm(allFieldsValid);
        }
    }

    let isSaveButtonDisabled = showConnectionName ? (!validForm || mutationInProgress || !validName) :
        !validForm || mutationInProgress;
    if ((formFields.length === 0) && validName && !mutationInProgress) {
        isSaveButtonDisabled = false;
    }

    // if calendar id needed in form field show calendar list and hide calendar id field
    if (formFields.find(field => field.name === "calendarId") && !isManualConnection && connectionInfo) {
        showCalendarSelector = true;
        formFields.find(field => field.name === "calendarId").hide = true;
        // validate form if only calendar id in form field
        if (formFields.length === 1){
            validateForm(true);
        }
    }

    const handleGcalendarChange = (event: object, value: any) => {
        if (value?.id) {
            formFields.find(field => field.name === "calendarId").value = `"${value.id}"`;
            setActiveGcalendar(value);
        }
    };

    function getActiveGcalendar() {
        if (gcalenderList && activeGcalendar === null) {
            // select primary calender from list
            const calender = gcalenderList.find(calendar => calendar.primary === true);
            setActiveGcalendar(calender);
            formFields.find(field => field.name === "calendarId").value = `"${calender.id}"`;
        }
        return activeGcalendar;
    }

    function handleItemLabel(gcalendar: Gcalendar) {
        return gcalendar.summary;
    }

    useEffect(() => {
        if (showCalendarSelector) {
            setIsCalenderFetching(true);
            (async () => {
                const calendarList = await getGcalendarList(currentApp?.org, connectionInfo.handle);
                setGcalenderList(calendarList);
                setIsCalenderFetching(false);
            })();
        }
    }, [ connectionInfo ]);

    const chooseCalendarPlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.GCalendar.operationForm.chooseCalendar.placeholder",
        defaultMessage: "Choose Calendar"
    });

    const addResponseVariablePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.GCalendar.addResponseVariable.placeholder",
        defaultMessage: "Enter Response Variable Name"
    });

    const addResponseVariableLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.GCalendar.addResponseVariable.label",
        defaultMessage: "Response Variable Name"
    });

    const saveConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.GCalendar.saveConnectionButton.text",
        defaultMessage: "Save"
    });

    return (
        <div>
            <div className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                <div className={classes.fullWidth}>
                    {showConnectionName ? (
                        <>
                        <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GCalendar.operationForm.title" defaultMessage="Connection"/></p>
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
                    <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GCalendar.operationForm.operation.title" defaultMessage="Operation"/></p>
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
                                {(selectedOperation === "createEvent" || selectedOperation === "updateEvent") ? (
                                    <CreateEvent
                                        isFetching={isCalenderFetching}
                                        gcalenderList={gcalenderList}
                                        isManualConnection={isManualConnection}
                                        isNewConnectorInitWizard={isNewConnectorInitWizard}
                                        formFields={formFields}
                                        validateFields={validateFields}
                                    />
                                ) : (
                                    <>
                                        {showCalendarSelector && (
                                            <p className={wizardClasses.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.GCalendar.operationForm.showCalendar.title" defaultMessage="Select Calendar"/></p>
                                        )}
                                        {showCalendarSelector && isCalenderFetching && (
                                            <CirclePreloader position="relative" />
                                        )}
                                        {showCalendarSelector && !isCalenderFetching && gcalenderList && (
                                            <>
                                                <FormAutocomplete
                                                    placeholder={chooseCalendarPlaceholder}
                                                    itemList={gcalenderList}
                                                    value={getActiveGcalendar()}
                                                    getItemLabel={handleItemLabel}
                                                    onChange={handleGcalendarChange}
                                                />
                                            </>
                                        )}
                                        <Form fields={formFields} onValidate={validateForm} />
                                    </>
                                )}
                            </div>
                            ) : null
                        }
                    </div>

                    <FormTextInput
                        customProps={{
                            validate: validateNameValue
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
                    dataTestId={"calender-save-btn"}
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
