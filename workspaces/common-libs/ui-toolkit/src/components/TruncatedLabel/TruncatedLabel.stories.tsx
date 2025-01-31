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
import { TruncatedLabel, TruncatedLabelProps } from "./TruncatedLabel";
import styled from "@emotion/styled";

const ContainerSpan = styled.span({
    display: "flex",
    // // alignItems: "center",
    width: "50px",
    // whiteSpace: "nowrap",
    // overflow: "hidden",
    // textOverflow: "ellipsis",
    // color: "inherit"
});

const Template: ComponentStory<typeof TruncatedLabel> = (args: TruncatedLabelProps) =>
    <ContainerSpan>
        <TruncatedLabel {...args} />

    </ContainerSpan>;

export const TruncatedLabelComponent = Template.bind();
TruncatedLabelComponent.args = { children: "This is a long text that should be truncated", style: { color: "red" } };

export default { component: TruncatedLabel, title: "TruncatedLabel" };