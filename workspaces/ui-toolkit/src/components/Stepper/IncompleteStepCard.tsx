/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";
import { Footer, Header, HeaderProps, HorizontalBar, StepCard, StepCardProps, StepCircle, StepSubTitle, StepTitle } from "./Stepper";
import styled from "@emotion/styled";

const PendingStatus = styled.div`
    opacity: 0.5;
    padding-top: 5px;
    font-size: 9px;
`;

const InCompletedStepHeader: React.FC<HeaderProps> = (props: HeaderProps) => (
    <Header>
        <StepCircle color={props.color}/>
        {props.hideBar ? null : <HorizontalBar color={props.color}/>}
    </Header>
);

export const InCompletedStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <InCompletedStepHeader hideBar={(props.totalSteps === props.step.id + 1)} color={props.color}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            {props.showStepStatus && <PendingStatus color={props.color}>Pending</PendingStatus>}
        </Footer>
    </StepCard>
);
