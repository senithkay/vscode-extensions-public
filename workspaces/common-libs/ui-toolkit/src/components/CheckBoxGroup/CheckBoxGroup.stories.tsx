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
import { CheckBoxGroup, CheckBoxGroupProps } from "./CheckBoxGroup";
import styled from "@emotion/styled";

const Container = styled.div`
    display: flex;
    gap: 20px;
`;

const Template: ComponentStory<typeof CheckBoxGroup> = (args: CheckBoxGroupProps) => {
    return (
        <Container>
            <CheckBoxGroup {...args} />
        </Container>
    );
};

export const Default = Template.bind();
Default.args = {
    items: [
        { label: "Option 1", value: "Option 1" },
        { label: "Option 2", value: "Option 2" },
        { label: "Option 3", value: "Option 3" },
    ],
    onChange: (selected: string[]) => {
        console.log(selected);
    },
    values: ["Option 1", "Option 3"],
};

export default { component: CheckBoxGroup, title: "CheckBoxGroup" };
