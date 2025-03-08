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
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/ballerina-core';

import { CardGrid, PanelViewMore, Title, TitleWrapper } from './styles';
import { BodyText } from '../../styles';
import ButtonCard from '../../../components/ButtonCard';
import { useVisualizerContext } from '../../../Context';

export function OtherArtifactsPanel() {
    const { rpcClient } = useRpcContext();
    const { setPopupMessage } = useVisualizerContext();

    const handleClick = async (key: DIRECTORY_MAP) => {
        if (key === DIRECTORY_MAP.CONNECTIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddConnectionWizard,
                },
            });
        } else if (key === DIRECTORY_MAP.DATA_MAPPERS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIDataMapperForm,
                },
            });
        } else if (key === DIRECTORY_MAP.TYPES) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.TypeDiagram,
                },
            });
        } else if (key === DIRECTORY_MAP.CONFIGURATIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.ViewConfigVariables,
                },
            });
        } else if (key === DIRECTORY_MAP.FUNCTIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIFunctionForm,
                },
            });
        } else {
            setPopupMessage(true);
        }
    };

    return (
        <PanelViewMore>
            <TitleWrapper>
                <Title variant="h2">Other Artifacts</Title>
                <BodyText>
                    Manage additional components for your integration. Select from the options below.
                </BodyText>
            </TitleWrapper>
            <CardGrid>
                <ButtonCard
                    icon={<Icon name="bi-connection" />}
                    title="Connections"
                    description="Set up external service connections, like databases and APIs."
                    onClick={() => handleClick(DIRECTORY_MAP.CONNECTIONS)}
                />
                <ButtonCard
                    icon={<Icon name="bi-connection" />}
                    title="Data Mappers"
                    description="Create data mappings for reusable transformations"
                    onClick={() => handleClick(DIRECTORY_MAP.DATA_MAPPERS)}
                />
                <ButtonCard
                    icon={<Icon name="bi-type" />}
                    title="Types"
                    description="Define and manage data types with JSON schema."
                    onClick={() => handleClick(DIRECTORY_MAP.TYPES)}
                />
                <ButtonCard
                    icon={<Icon name="bi-config" />}
                    title="Configurations"
                    description="Handle environment variables and secrets for your project."
                    onClick={() => handleClick(DIRECTORY_MAP.CONFIGURATIONS)}
                />
                <ButtonCard
                    icon={<Icon name="bi-function" />}
                    title="Functions"
                    description="Create reusable functions to streamline your integration logic."
                    onClick={() => handleClick(DIRECTORY_MAP.FUNCTIONS)}
                />
            </CardGrid>
        </PanelViewMore>
    );
};
