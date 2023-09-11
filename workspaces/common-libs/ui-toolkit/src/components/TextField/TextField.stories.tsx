/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { TextField, TextFieldProps } from "./TextField";

const Template: ComponentStory<typeof TextField> = (args: TextFieldProps) => <TextField {...args} />;

export const TextFieldWithError = Template.bind();
TextFieldWithError.args = { value: "Sample Text", label: "TextField", errorMsg: "Test Error", autoFocus: true, placeholder: "placeholder", onChange: null };

export const RequiredTextFieldWithError = Template.bind();
RequiredTextFieldWithError.args = { value: "Sample Text", label: "TextField", errorMsg: "Test Error", required: true, placeholder: "placeholder", onChange: null };

export const TextFieldWithoutLabel = Template.bind();
TextFieldWithoutLabel.args = { value: "Sample Text", errorMsg: "Test Error", required: true, placeholder: "placeholder", onChange: null };

export default { component: TextField, title: "TextField" };
