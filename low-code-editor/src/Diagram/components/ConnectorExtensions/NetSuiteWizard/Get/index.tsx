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

import { FormField } from "../../../../../ConfigurationSpec/types";
import { SelectDropdownWithButton } from '../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton';
import { Form } from '../../../Portals/ConfigForm/forms/Components/Form';

export interface OperationDropdownProps {
    formFields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
}

export function Get(props: OperationDropdownProps) {
    const { formFields, onValidate } = props;
    // HACK: use hardcoded types until ENUM fix from lang-server
    const getAllRecordType = [
        "budgetCategory",
        "campaignAudience",
        "campaignCategory",
        "campaignChannel",
        "campaignFamily",
        "campaignOffer",
        "campaignSearchEngine",
        "campaignSubscription",
        "campaignVertical",
        "currency",
        "leadSource",
        "state",
        "supportCaseIssue",
        "supportCaseOrigin",
        "supportCasePriority",
        "supportCaseStatus",
        "supportCaseType",
        "taxAcct"
    ];
    const [defaultSelection, setDefaultSelection] = useState<string>();

    useEffect(() => {
        formFields.find(field => field.name === "requestRecord").fields.find(field => field.name === "recordType").value = `"${defaultSelection}"`;
    }, [defaultSelection])

    const onChange = (value: any) => {
        setDefaultSelection(value);
        onValidate(true);
    }

    if (!defaultSelection){
        // set initial selection
        if (formFields.find(field => field.name === "requestRecord").fields.find(field => field.name === "recordType").value){
            const fieldValue = formFields.find(field => field.name === "requestRecord").fields.find(field => field.name === "recordType").value.replaceAll('"', '');
            setDefaultSelection(fieldValue);
        }else{
            setDefaultSelection(getAllRecordType[0]);
        }
    }

    // HACK: hide default field and add custom selectDropdown
    formFields.find(field => field.name === "requestRecord").fields.find(field => field.name === "recordType").hide = true;

    return (
        <>
            <Form fields={formFields} onValidate={onValidate} />
            <SelectDropdownWithButton
                customProps={{ disableCreateNew: true, values: getAllRecordType }}
                label="Select Record Type"
                placeholder="Select"
                defaultValue={defaultSelection}
                onChange={onChange}
            />
        </>
    );
}
