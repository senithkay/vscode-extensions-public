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

