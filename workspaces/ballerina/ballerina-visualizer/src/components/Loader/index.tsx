/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import React from 'react';
import styled from "@emotion/styled";
import { ProgressRing } from '@wso2-enterprise/ui-toolkit';

export const LoadingRing = () => {

    const ProgressContainer = styled.div`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    return (
        <ProgressContainer>
            <ProgressRing />
        </ProgressContainer>
    );
}