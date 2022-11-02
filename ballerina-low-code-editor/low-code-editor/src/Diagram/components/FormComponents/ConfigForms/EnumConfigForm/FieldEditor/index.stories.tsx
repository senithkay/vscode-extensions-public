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

import { FieldEditor, FieldEditorProps } from "./index";

export default {
    title: 'Low Code Editor/Testing/Form/Record Editor/Field',
    component: FieldEditor,
};

const field = {
    "name": "name",
    "type": "string",
    "isFieldOptional": true,
    "isFieldTypeOptional": true,
}

const Template: Story<FieldEditorProps> = (args: FieldEditorProps) => <FieldEditor {...args} />;

export const FieldItemComponent = Template.bind({});
FieldItemComponent.args = {
    field,
    onDeleteClick: null
};
