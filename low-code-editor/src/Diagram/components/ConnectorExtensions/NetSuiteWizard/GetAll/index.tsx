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
import { useIntl } from 'react-intl';

import { FormField } from "../../../../../ConfigurationSpec/types";
import { SelectDropdownWithButton } from '../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton';

export interface OperationDropdownProps {
    formFields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
}

export function GetAll(props: OperationDropdownProps) {
    const { formFields, onValidate } = props;
    const intl = useIntl();
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
        formFields.find(field => field.name === "RecordType").value = `"${defaultSelection}"`;
    }, [defaultSelection])

    const onChange = (value: any) => {
        setDefaultSelection(value);
        onValidate(true);
    };

    const selectRecordTypeLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.NetSuite.GetAll.selectRecordType.label",
        defaultMessage: "Select record type"
    });

    const selectRecordTypePlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.NetSuite.GetAll.selectRecordType.placeholder",
        defaultMessage: "Select"
    });


    if (!defaultSelection){
        // set initial selection
        if (formFields.find(field => field.name === "RecordType").value){
            const fieldValue = formFields.find(field => field.name === "RecordType").value.replaceAll('"', '');
            setDefaultSelection(fieldValue);
        }else{
            setDefaultSelection(getAllRecordType[0]);
        }
    }

    return (
        <>
            <SelectDropdownWithButton
                customProps={{ disableCreateNew: true, values: getAllRecordType }}
                label={selectRecordTypeLabel}
                placeholder={selectRecordTypePlaceholder}
                defaultValue={defaultSelection}
                onChange={onChange}
            />
        </>
    );
}
