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
import styled from '@emotion/styled';
import Grid, { GridProps } from "./Grid";

const GridItem = styled.div`
    width: fit-content;
    height: fit-content;
`;

const Template: ComponentStory<typeof Grid> = (args: GridProps) => (
    <Grid {...args}>
        <GridItem key={1}>Item 1</GridItem>
        <GridItem key={2}>Item 2</GridItem>
        <GridItem key={3}>Item 3</GridItem>
        <GridItem key={4}>Item 4</GridItem>
        <GridItem key={5}>Item 5</GridItem>
        <GridItem key={6}>Item 6</GridItem>
        <GridItem key={7}>Item 7</GridItem>
        <GridItem key={8}>Item 8</GridItem>
    </Grid>
);

export const Default = Template.bind();

export default { component: Grid, title: "Grid" };
