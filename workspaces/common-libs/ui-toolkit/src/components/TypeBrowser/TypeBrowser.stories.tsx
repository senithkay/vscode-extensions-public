/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { TypeBrowser, TypeBrowserProps } from "./TypeBrowser";

const Template: ComponentStory<typeof TypeBrowser> = (args: TypeBrowserProps) => <div style={{ width: 300 }}><TypeBrowser {...args} /></div>;

export const Select = Template.bind();
Select.args = { id: "type-editor", label: "Words", nullable: false, onChange: (value: string) => { console.log(value); }, onCreateNewRecord: (value: string) => { console.log(`Create Record with Name: ${value}`); }, items: ["foo", "boo"] };

export default { component: Select, title: "Type Editor" };
