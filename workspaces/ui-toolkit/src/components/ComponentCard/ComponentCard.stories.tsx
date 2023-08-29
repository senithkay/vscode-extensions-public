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
import { ComponentCard, ComponentCardProps } from "./ComponentCard";
import { ComponentLabel } from "./ComponentLabel";

const Template: ComponentStory<typeof ComponentCard> = (args: ComponentCardProps) => 
    <ComponentCard {...args}>
        <ComponentLabel label={"Test Component"} variant="h4" />  
    </ComponentCard>
;

export const Card = Template.bind();
Card.args = { id: "Test", description: "Description", isSelected: false, sx: {width: 900, height: 50}, onClick: (e: any) => { console.log(e) } };

export default { component: Card, title: "ComponentCard" };
