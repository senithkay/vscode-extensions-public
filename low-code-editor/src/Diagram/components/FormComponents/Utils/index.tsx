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
import React from "react";

import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import * as Forms from "../ConfigForms";
import { FormFieldChecks } from "../Types";

export function getForm(type: string, args: any) {
    const Form = (Forms as any)[type];
    return Form ? (
        <Form {...args} />
    ) : <Forms.Custom {...args}/>;
}

export function isAllEmpty(allFieldChecks: Map<string, FormFieldChecks>): boolean {
    let result = true
    allFieldChecks.forEach((fieldChecks, key) => {
        if (!fieldChecks.isEmpty) {
            result = false;
        }
    });
    return result;
}

export function isAllIgnorable(fields: FormField[]): boolean {
    let result = true;
    fields.forEach((field, key) => {
        if (!(field.optional || field.defaultable)) {
            result = false;
        }
    });
    return result;
}

export function isAllFieldsValid(allFieldChecks: Map<string, FormFieldChecks>, model: FormField | FormField[], isRoot: boolean): boolean {
    let result = true;
    let canModelIgnore = false;
    let allFieldsIgnorable = false;

    if (!isRoot) {
        const formField = model as FormField;
        canModelIgnore = formField.optional || formField.defaultable;
        allFieldsIgnorable = isAllIgnorable(formField.fields);
    }else{
        const formFields = model as FormField[];
        allFieldsIgnorable = isAllIgnorable(formFields);
    }

    allFieldChecks.forEach(fieldChecks => {
        if (!canModelIgnore && !fieldChecks.canIgnore && (!fieldChecks.isValid || fieldChecks.isEmpty)) {
            result = false;
        }
        if (fieldChecks.canIgnore && !fieldChecks.isEmpty && !fieldChecks.isValid) {
            result = false;
        }
    });

    return result;
}

const BALLERINA_CENTRAL_ROOT = 'https://lib.ballerina.io';

export function generateDocUrl(org: string, module: string, method: string) {
    return method
        ? `${BALLERINA_CENTRAL_ROOT}/${org}/${module}/latest/clients/Client#${method}`
        : `${BALLERINA_CENTRAL_ROOT}/${org}/${module}/latest/clients/Client`
}

