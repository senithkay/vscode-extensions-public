/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { Icon } from '@wso2-enterprise/ui-toolkit';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/ballerina-core';

import { CardGrid, PanelViewMore, Title, TitleWrapper } from './styles';
import { BodyText } from '../../styles';
import ButtonCard from '../../../components/ButtonCard';

export function AutomationPanel() {
    const { rpcClient } = useRpcContext();

    const handleClick = async () => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIMainFunctionForm,
            },
        });
    };

    return (
        <PanelViewMore>
            <TitleWrapper>
                <Title variant="h2">Automation</Title>
                <BodyText>Explore automation options to streamline your integration processes.</BodyText>
            </TitleWrapper>
            <CardGrid>
                <ButtonCard
                    icon={<Icon name="bi-task" />}
                    title="Automation"
                    onClick={handleClick}
                />
            </CardGrid>
        </PanelViewMore>
    );
};
