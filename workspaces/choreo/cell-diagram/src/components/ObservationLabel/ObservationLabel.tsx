/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { Colors } from "../../resources";
import { Observations } from "../../types";

interface ObservationLabelProps {
    observations: Map<string, Observations>;
}

const Container = styled.div`
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    border: 1px solid ${Colors.PRIMARY_SELECTED};
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const DotRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 4px;
`;

const Dot = styled.div`
    height: 12px;
    width: 12px;
    background-color: ${Colors.PRIMARY_LIGHT};
    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.6s ease;
    cursor: pointer;
`;

const ActiveDot = styled(Dot)`
    background-color: ${Colors.NODE_BORDER};
`;

export function ObservationLabel(props: ObservationLabelProps) {
    const [activeIndex, setActiveIndex] = useState(0); // Add state to keep track of the active section
    const observationsArray = Array.from(props.observations);

    const convertToMs = (value: number) => (value / 1000 / 1000).toFixed(value / 1000 / 1000 > 100 ? 1 : 2);

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
    };

    const [_serviceId, observations] = observationsArray[activeIndex]; // Get the active observation

    return (
        <Container>
            <Section>
                <Row>
                    <div>Error Percentage</div>
                    <div>{((observations.errorCount * 100) / observations.requestCount).toFixed(2)}%</div>
                </Row>
                <Row>
                    <div>Average Latency</div>
                    <div>{convertToMs(observations.avgLatency)} ms</div>
                </Row>
                <Row>
                    <div>99% Latency</div>
                    <div>{convertToMs(observations.p99Latency)} ms</div>
                </Row>
                <Row>
                    <div>90% Latency</div>
                    <div>{convertToMs(observations.p90Latency)} ms</div>
                </Row>
                <Row>
                    <div>50% Latency</div>
                    <div>{convertToMs(observations.p50Latency)} ms</div>
                </Row>
            </Section>
            {observationsArray.length > 1 && (
                <DotRow>
                    {observationsArray.map((_, index) =>
                        index === activeIndex ? <ActiveDot onClick={() => handleDotClick(index)} /> : <Dot onClick={() => handleDotClick(index)} />
                    )}
                </DotRow>
            )}
        </Container>
    );
}
