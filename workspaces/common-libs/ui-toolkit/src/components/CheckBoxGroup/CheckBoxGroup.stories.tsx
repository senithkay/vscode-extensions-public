/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ComponentStory } from "@storybook/react";
import { CheckBox, CheckBoxGroup, CheckBoxGroupProps } from "./CheckBoxGroup";
import styled from "@emotion/styled";

const Container = styled.div`
    display: flex;
    gap: 20px;
`;

const Template: ComponentStory<typeof CheckBoxGroup> = (args: CheckBoxGroupProps) => {
    return (
        <Container>
            <CheckBoxGroup {...args}>
                <CheckBox label="Option 1" value="option1" />
                <CheckBox label="Option 2" value="option2" />
                <CheckBox label="Option 3" value="option3" />
                <CheckBox label="Option 4" value="option4" />
                <CheckBox label="Option 5" value="option5" />
            </CheckBoxGroup>
        </Container>
    );
};

export const Default = Template.bind();
Default.args = {
    onChange: (selected: string[]) => {
        console.log(selected);
    },
    values: ["Option 1", "Option 3"],
};

export default { component: CheckBoxGroup, title: "CheckBoxGroup" };
