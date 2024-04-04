/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Card } from "@wso2-enterprise/ui-toolkit";

const CardContainer = styled.div({
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    justifyContent: "center",
    width: "100%",
});

const CARD_WRAPPER_DATA = {
    INBOUND_ENDPOINT: {
        cards: [
            {
                title: 'CXF_WS_RM',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'Custom',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'Feed',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'File',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'HL7',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'HTTP',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'HTTPS',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'JMS',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'KAFKA',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'MQTT',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'RABBITMQ',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'WS',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'WSO2_MB',
                icon: 'code',
                description: 'Description',
            },
            {
                title: 'WSS',
                icon: 'code',
                description: 'Description',
            }
        ]
    }
};

type CardWrapperProps = {
    cardsType: keyof typeof CARD_WRAPPER_DATA;
    setType: (type: string) => void;
}

const CardWrapper = (props: CardWrapperProps) => {
    return (
        <CardContainer>
            {CARD_WRAPPER_DATA[props.cardsType].cards.map((card, index) => (
                <Card
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    onClick={() => props.setType(card.title)}
                />
            ))}
        </CardContainer>
    )
}

export default CardWrapper;
