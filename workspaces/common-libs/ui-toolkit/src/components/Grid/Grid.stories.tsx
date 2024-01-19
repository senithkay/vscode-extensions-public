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
import { Grid, GridProps } from "./Grid";

const Template: ComponentStory<typeof Grid> = (args: GridProps) => (
    <Grid {...args}>
        <Grid item={true} key={1}>Item 1</Grid>
        <Grid item={true} key={2}>Item 2</Grid>
        <Grid item={true} key={3}>Item 3</Grid>
        <Grid item={true} key={4}>Item 4</Grid>
        <Grid item={true} key={5}>Item 5</Grid>
        <Grid item={true} key={6}>Item 6</Grid>
        <Grid item={true} key={7}>Item 7</Grid>
        <Grid item={true} key={8}>Item 8</Grid>
        <Grid item={true} key={9}>Item 9</Grid>     
    </Grid>
);

export const Default = Template.bind();

export default { component: Grid, title: "Grid" };
