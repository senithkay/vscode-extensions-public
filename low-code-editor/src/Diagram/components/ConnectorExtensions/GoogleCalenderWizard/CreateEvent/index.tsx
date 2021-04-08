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

import { addHours, format } from 'date-fns';

import { FormField } from "../../../../../ConfigurationSpec/types";
import { Gcalendar } from "../../../../../Definitions";
import { CirclePreloader } from "../../../../../PreLoader/CirclePreloader";
import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { FormAutocomplete } from "../../../Portals/ConfigForm/Elements/Autocomplete";
import { DateLabelPicker } from "../../../Portals/ConfigForm/Elements/DateLabelPicker";
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
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
    const { formFields, validateFields, isFetching, gcalenderList, isManualConnection } = props;
    const wizardClasses = wizardStyles();
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    enum EventDateTypes {
        START = "'start",
        END = "end"
    };

    const validateForm = (fieldName: string, isInvalid: boolean) => {
        validateFields(fieldName, isInvalid);
    };

    const calendarIdModel = formFields.find((field: any) => field.name === "calendarId");
    const calIdProps: FormElementProps = {
        model: calendarIdModel,
        customProps: {
            validate: validateForm,
            statementType: calendarIdModel.type
        }
    };

    const eventIdModel = formFields.find((field: any) => field.name === "eventId");
    const eventIdProps: FormElementProps = {
        model: eventIdModel,
        customProps: {
            validate: validateForm,
            statementType: eventIdModel?.type
        }
    };

    const titleModel = formFields.find((field: any) => field.name === "event")
            .fields.find((field: any) => field.name === "summary");
    const titleProps: FormElementProps = {
        model: titleModel,
        customProps: {
            validate: validateForm,
            statementType: titleModel.type
        }
    };

    const descModel = formFields.find((field: any) => field.name === "event")
            .fields.find((field: any) => field.name === "description");
    const descProps: FormElementProps = {
        model: descModel,
        customProps: {
            validate: validateForm,
            statementType: descModel.type
        }
    };

    const locationModel = formFields.find((field: any) => field.name === "event")
            .fields.find((field: any) => field.name === "location");
    const locationProps: FormElementProps = {
        model: locationModel,
        customProps: {
            validate: validateForm,
            statementType: locationModel.type
        }
    };

    const validateAttendee = (fieldName: string, isInvalidFromField: boolean) => {
        validateFields(fieldName, isInvalidFromField);
    }

    const attendeeModel = formFields.find((field: any) => field.name === "event")
            .fields.find((field: any) => field.name === "attendees");
    const attendeeComponnet = getFormElement({
        model: attendeeModel,
        customProps: {
            validate: validateAttendee,
        }
    }, attendeeModel.type);

    const startTimeOnChange = (time: Date) => {
        setEventDateTime(EventDateTypes.START, time);
    };

    const endTimeOnChange = (time: Date) => {
        setEventDateTime(EventDateTypes.END, time);
    };

    const setDefaultValues = () => {
        if (!getEventDateTime(EventDateTypes.START)?.value){
            setEventDateTime(EventDateTypes.START, new Date());
        }
        if (!getEventDateTime(EventDateTypes.END)?.value){
            setEventDateTime(EventDateTypes.END, addHours(new Date(), 1));
        }
    }

    const setEventDateTime = (type: EventDateTypes, date: Date) => {
        const isFieldExist = getEventDateTime(type);
        if (isFieldExist){
            formFields.find((field: any) => field.name === "event")
            .fields.find((field: any) => field.name === type)
            .fields.find((field: any) => field.name === "dateTime").value = convertDateToString(date);
        }
    }

    const getEventDateTime = (type: EventDateTypes) => {
        return formFields.find((field: any) => field.name === "event")
            .fields?.find((field: any) => field.name === type)
            .fields?.find((field: any) => field.name === "dateTime");
    }

    const convertDateToString = (date: Date) => {
        const formattedTime = format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");
        return `"${formattedTime}"`;
    }

    // for oauth authenticated connections
    const handleGcalendarChange = (event: object, value: any) => {
        if (value?.id) {
            formFields.find((field: any) => field.name === "calendarId").value = `"${value.id}"`;
            setActiveGcalendar(value);
        }
    };

    function getActiveGcalendar() {
        if (gcalenderList && activeGcalendar === null) {
            // select primary calender from list
            const calender = gcalenderList.find(calendar => calendar.primary === true);
            setActiveGcalendar(calender);
            formFields.find((field: any) => field.name === "calendarId").value = `"${calender.id}"`;
        }
        return activeGcalendar;
    }

    function handleItemLabel(gcalendar: Gcalendar) {
        return gcalendar.summary;
    }

    const showCalenderSelector = (!isManualConnection && (isFetching || gcalenderList?.length > 0)) ? true : false;
    // set default value before render
    setDefaultValues();

    return (
        <>
            {!showCalenderSelector && (
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
            {eventIdModel && (<ExpressionEditor {...eventIdProps} />)}
            <ExpressionEditor {...titleProps} />
            <ExpressionEditor {...descProps} />
            <ExpressionEditor {...locationProps} />
            <DateLabelPicker
                model={getEventDateTime(EventDateTypes.START)}
                onChange={startTimeOnChange}
                label={"Select Start Date"}
            />
            <DateLabelPicker
                model={getEventDateTime(EventDateTypes.END)}
                onChange={endTimeOnChange}
                label={"Select End Date"}
            />
            <div>{attendeeComponnet}</div>
        </>
    );
}
