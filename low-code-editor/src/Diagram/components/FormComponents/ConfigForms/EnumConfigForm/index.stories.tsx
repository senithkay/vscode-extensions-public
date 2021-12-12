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

import { Provider as LowCodeEditorProvider } from "../../../../../Contexts/Diagram";
import { mockedEditorProps } from "../ConditionConfigForms/ConditionsOverlayForm/AddWhileForm/index.stories";

import { EnumConfigForm, EnumEditorProps } from "./index";
import enumModel from "./story-data/enum-decl-raw.json";

export default {
    title: 'Low Code Editor/Form/Enum Editor/Enum Editor',
    component: EnumConfigForm,
};

const Template: Story<EnumEditorProps> = (args: EnumEditorProps) => (
    <LowCodeEditorProvider {...mockedEditorProps}>
        <EnumConfigForm {...args}/>
    </LowCodeEditorProvider>
);

export const EnumEditorComponent = Template.bind({});
EnumEditorComponent.args = {
    name: "",
    model: enumModel,
    onCancel: null,
    onSave: null
};
