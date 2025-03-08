/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { Icon } from '@wso2-enterprise/ui-toolkit';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, TriggerModelsResponse, ServiceModel } from '@wso2-enterprise/ballerina-core';

import { useVisualizerContext } from '../../../Context';
import { CardGrid, PanelViewMore, Title, TitleWrapper } from './styles';
import { BodyText } from '../../styles';
import ButtonCard from '../../../components/ButtonCard';

export function EventIntegrationPanel() {
    const { rpcClient } = useRpcContext();
    const [triggers, setTriggers] = useState<TriggerModelsResponse>({ local: [] });
    const { cacheTriggers, setCacheTriggers } = useVisualizerContext();

    useEffect(() => {
        getTriggers();
    }, []);

    const getTriggers = () => {
        if (cacheTriggers.local.length > 0) {
            setTriggers(cacheTriggers);
        } else {
            rpcClient
                .getServiceDesignerRpcClient()
                .getTriggerModels({ query: "" })
                .then((model) => {
                    console.log(">>> bi triggers", model);
                    setTriggers(model);
                    setCacheTriggers(model);
                });
        }
    };

    const handleClick = async (key: DIRECTORY_MAP, serviceType?: string) => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIServiceWizard,
                serviceType: serviceType,
            },
        });
    };

    return (
        <PanelViewMore>
            <TitleWrapper>
                <Title variant="h2">Event Integration</Title>
                <BodyText>
                    Configure event-driven integrations for your project. Explore the available options below.
                </BodyText>
            </TitleWrapper>
            <CardGrid>
                {
                    triggers.local
                        .filter((t) => t.type === "event")
                        .map((item, index) => {
                            return (
                                <ButtonCard
                                    key={item.id}
                                    title={item.name}
                                    icon={getEntryNodeIcon(item)}
                                    onClick={() => {
                                        handleClick(DIRECTORY_MAP.SERVICES, item.moduleName);
                                    }}
                                />
                            );
                        }
                    )
                }
            </CardGrid>
        </PanelViewMore>
    );
};

// TODO: This should be removed once the new icons are added to the BE API.
export function getEntryNodeIcon(item: ServiceModel) {
    console.log(">>> item", item);
    return getCustomEntryNodeIcon(item.moduleName) || <img src={item.icon} alt={item.name} style={{ width: "38px" }} />;
}

// INFO: This is a temporary function to get the custom icon for the entry points.
// TODO: This should be removed once the new icons are added to the BE API.
export function getCustomEntryNodeIcon(type: string) {
    switch (type) {
        case "tcp":
            return <Icon name="bi-tcp" />;
        case "kafka":
            return <Icon name="bi-kafka" />;
        case "rabbitmq":
            return <Icon name="bi-rabbitmq" sx={{ color: "#f60" }} />;
        case "nats":
            return <Icon name="bi-nats" />;
        case "mqtt":
            return <Icon name="bi-mqtt" />;
        case "grpc":
            return <Icon name="bi-grpc" />;
        case "graphql":
            return <Icon name="bi-graphql" sx={{ color: "#e535ab" }} />;
        case "java.jms":
            return <Icon name="bi-java" />;
        case "trigger.github":
            return <Icon name="bi-github" />;
        default:
            return null;
    }
}
