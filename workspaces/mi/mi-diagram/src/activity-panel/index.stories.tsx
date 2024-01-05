/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';

import styled from '@emotion/styled';
import { ActivityPanel } from './index'

const ActivityPanelWrapper = styled.div`
    min-width: 170px;
    max-width: 270px;
`;

const WrappedActivityPanel = (args: any) => (
    <ActivityPanelWrapper>
        <ActivityPanel {...args} />
    </ActivityPanelWrapper>
);

export default {
    component: WrappedActivityPanel,
    title: 'Components/ActivityPanel',
};

export const Default = {
    args: { data: "Hello World" },
};

