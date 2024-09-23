/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { OptionPopup } from "./OptionPopup";
import styled from "@emotion/styled";

export default {
    component: OptionPopup,
    title: 'Resource',
};

const Container = styled.div`
    min-height: 500px;
`;

export const OptionPopupStory = () => {
    const handleParamChange = (params: string[]) => {
        console.log(params);
    }
    return (
        <Container>
            <OptionPopup options={["Option 1", "Option 2"]} selectedOptions={["Option 1"]} onOptionChange={handleParamChange}/>
        </Container>
    );
};
