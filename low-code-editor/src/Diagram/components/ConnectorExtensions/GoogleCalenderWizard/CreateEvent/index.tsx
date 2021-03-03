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
import React, { useEffect, useState } from 'react';

import { FormHelperText } from "@material-ui/core";
import { addHours, format } from 'date-fns';

import { FormField } from "../../../../../ConfigurationSpec/types";
import { Gcalendar } from "../../../../../Definitions";
import { CirclePreloader } from "../../../../../PreLoader/CirclePreloader";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { FormAutocomplete } from "../../../Portals/ConfigForm/Elements/Autocomplete";
import { DateLabelPicker } from "../../../Portals/ConfigForm/Elements/DateLabelPicker";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";
import { getFormElement } from "../../../Portals/utils";

export interface OperationDropdownProps {
    formFields: FormField[] | any;
    isFetching: boolean;
    gcalenderList: Gcalendar[];
    isManualConnection: boolean;
    isNewConnectorInitWizard: boolean;
    validateFields: (field: string, isInvalid: boolean) => void;
}

export function CreateEvent(props: OperationDropdownProps) {
    const { formFields, validateFields, isFetching, gcalenderList,
            isManualConnection, isNewConnectorInitWizard } = props;

    const classes = useStyles();
    const wizardClasses = wizardStyles();

    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);

    const validateForm = (fieldName: string, isInvalid: boolean) => {
        validateFields(fieldName, isInvalid);
    };

    const calIdProps: FormElementProps = {
        model: formFields[0],
        customProps: {
            validate: validateForm,
            statemenType: formFields[0].type
        }
    };

    const titleModel = formFields.find((item: any) => item.name === "event")
            .fields.find((item: any) => item.name === "summary");

    const titleProps: FormElementProps = {
        model: titleModel,
        customProps: {
            validate: validateForm,
            statemenType: titleModel.type
        }
    };

    const descModel = formFields.find((item: any) => item.name === "event")
            .fields.find((item: any) => item.name === "description");
    const descProps: FormElementProps = {
        model: descModel,
        customProps: {
            validate: validateForm,
            statementType: descModel.type
        }
    };

    const locationModel = formFields.find((item: any) => item.name === "event")
            .fields.find((item: any) => item.name === "location");
    const locationProps: FormElementProps = {
        model: locationModel,
        customProps: {
            validate: validateForm,
            statementType: locationModel
        }
    };

    const startTimeModel: FormField = {
        type: "string",
        name: "Start Time"
    };

    const startTimeOnChange = (time: Date) => {
        formFields[1].fields[5].fields[1].value = convertDateToString(time);
    };

    const endTimeModel: FormField = {
        type: "string",
        name: "End Time"
    }
    const endTimeOnChange = (time: Date) => {
        formFields[1].fields[6].fields[1].value = convertDateToString(time);
    };

    const onChangeAttendee = () => {
        let record = "";
        formFields[1].fields[12].fields.forEach((field: any, index: number) => {
            if (index === (formFields[1].fields[12].fields.length - 1)) {
                record += "{email: " + field.value + ", responseStatus: no}";
            } else {
                record += "{email: " + field.value + ", responseStatus: no},";
            }
        });
        formFields[1].fields[12].value = record;
    };

    const setDefaultValues = () => {
        if (formFields[1].fields[5].fields[1]?.value === undefined){
            formFields[1].fields[5].fields[1].value = convertDateToString(new Date());
        }
        if (formFields[1].fields[6].fields[1]?.value === undefined){
            formFields[1].fields[6].fields[1].value = convertDateToString(addHours(new Date(), 1));
        }
    }

    const convertDateToString = (date: Date) => {
        const formattedTime = format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");
        return `"${formattedTime}"`;
    }

    const attendeeComponnet = getFormElement({
        model: formFields[1].fields[12],
        onChange: onChangeAttendee
    }, formFields[1].fields[12].type);

    // for oauth authenticated connections
    const handleGcalendarChange = (event: object, value: any) => {
        if (value?.id) {
            formFields[0].value = "\"" + value?.id + "\"";
        }
        setActiveGcalendar(value);
    };
    function getActiveGcalendar() {
        if (gcalenderList && activeGcalendar === null) {
            // select primary calender from list
            const calender = gcalenderList.find(calendar => calendar.primary === true);
            setActiveGcalendar(calender);
            formFields[0].value = "\"" + calender?.id + "\"";
        }
        return activeGcalendar;
    }
    function handleItemLabel(gcalendar: Gcalendar) {
        return gcalendar.summary;
    }

    const showCalenderSelector = (!isManualConnection && (isFetching || gcalenderList?.length > 0)) ? true : false;

    // set default value before render
    setDefaultValues();

    useEffect(() => {
        if (!isNewConnectorInitWizard) {
            const attendeeField = formFields.find(item => item.name === "event")
                .fields.find(item => item.name === "attendees");
            const emails: FormField[] = [];
            attendeeField.fields.forEach((field) => {
                const email = field.fields.find(item => item.name === "email");
                emails.push(email);
            })
            attendeeField.fields = emails;
        }
    }, [isNewConnectorInitWizard]);

    return (
        <>
            {!showCalenderSelector && isManualConnection && (
                <ExpressionEditor {...calIdProps} />
            )}
            {showCalenderSelector && (
                <p className={wizardClasses.subTitle}>Select Calendar</p>
            )}
            {showCalenderSelector && isFetching && (
                <CirclePreloader position="relative" />
            )}
            {showCalenderSelector && !isFetching && gcalenderList && (
                <FormAutocomplete
                    placeholder="Choose Calendar"
                    itemList={gcalenderList}
                    value={getActiveGcalendar()}
                    getItemLabel={handleItemLabel}
                    onChange={handleGcalendarChange}
                />
            )}
            <ExpressionEditor {...titleProps} />
            <ExpressionEditor {...descProps} />
            <ExpressionEditor {...locationProps} />
            <DateLabelPicker
                model={formFields[1]?.fields[5]?.fields[1]}
                onChange={startTimeOnChange}
                label={"Select Start Date"}
            />
            <DateLabelPicker
                model={formFields[1]?.fields[6]?.fields[1]}
                onChange={endTimeOnChange}
                label={"Select End Date"}
            />

                <>
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>Attendees</FormHelperText>
                        <FormHelperText className={classes.optionalLabel}>Optional</FormHelperText>
                    </div>
                    <div>
                        {attendeeComponnet}
                    </div>
                </>

        </>
    );
}
