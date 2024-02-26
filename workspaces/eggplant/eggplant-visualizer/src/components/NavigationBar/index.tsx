/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { NavButtonGroup } from "./NavButtonGroup";
import styled from "@emotion/styled";

interface NavigationBarProps {
}

export function NavigationBar(props: NavigationBarProps) {

    const NavigationContainer = styled.div`
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    `;

    return (
        <NavigationContainer id="nav-bar-main">
            <NavButtonGroup />
        </NavigationContainer>
    );

}

