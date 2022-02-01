/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

// tslint:disable-next-line:no-submodule-imports
import { Story } from '@storybook/react/types-6-0';

import { Provider as LowCodeEditorProvider } from "../../../../../../Contexts/Diagram";
import { FormState, Provider as RecordEditorProvider } from "../../../../../../Contexts/RecordEditor";
import { mockedEditorProps } from "../../ConditionConfigForms/ConditionsOverlayForm/AddWhileForm/index.stories";

import { RecordField } from "./index";

export default {
    title: 'Low Code Editor/Testing/Form/Record Editor/Record Field',
    component: RecordField,
};

const recordModel = {
    "name": "Organization",
    "fields": [{
        "name": "name",
        "type": "string",
        "isFieldOptional": false,
        "isFieldTypeOptional": false
    }, {"name": "id", "type": "int", "isFieldOptional": false, "isFieldTypeOptional": false}, {
        "name": "address",
        "fields": [{
            "name": "city",
            "type": "string",
            "isFieldOptional": false,
            "isFieldTypeOptional": false
        }, {"name": "province", "type": "string", "isFieldOptional": false, "isFieldTypeOptional": false}],
        "isInline": true,
        "type": "record",
        "isClosed": false
    }],
    "isInline": true,
    "type": "record",
    "isClosed": false,
    "isActive": true,
    "isPublic": false,
    "isTypeDefinition": true
}

const Template: Story<any> = (args: any) =>
    (
        <LowCodeEditorProvider {...mockedEditorProps} >
            <RecordEditorProvider
                state={{
                    recordModel,
                    currentForm: FormState.EDIT_RECORD_FORM,
                    currentRecord: recordModel,
                    sourceModel: null,
                }}
            >
                <RecordField {...args} />
            </RecordEditorProvider>
        </LowCodeEditorProvider>
    );

export const RecordFieldComponent = Template.bind({});
RecordFieldComponent.args = {
    recordModel,
};
