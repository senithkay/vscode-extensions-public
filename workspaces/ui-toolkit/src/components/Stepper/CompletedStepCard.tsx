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
import { StepCard, Footer, StepTitle, StepSubTitle, StepStatus, Header, StepCardProps, HeaderProps, StepperStyleProps } from "./Stepper";
import styled from "@emotion/styled";

const CompletedCircle = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    left: 20px;
    top: 20px;
    transform: translate(-50%, -50%);
`;

const RightSign = styled.div`
    position: relative;
    top: 25%;
    left: 40%;
    width: 8px;
    height: 15px;
    border: 2px solid white;
    border-bottom: none;
    border-right: none;
    transform: rotate(225deg);
`;

const CompletedHorizontalBar = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: calc(100% - 60px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

export const CircleWithRightSign: React.FC<HeaderProps> = (props: HeaderProps) => (
    <CompletedCircle  color={props.primaryColor}>
        <RightSign />
    </CompletedCircle>
);

export const CompletedStepHeader: React.FC<HeaderProps> = (props: HeaderProps) => (
    <Header>
        <CircleWithRightSign primaryColor={props.primaryColor} />
        {props.hideBar ? null : <CompletedHorizontalBar color={props.primaryColor} />}
    </Header>
);

export const CompletedStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <CompletedStepHeader hideBar={(props.totalSteps === props.step.id + 1)} primaryColor={props.primaryColor}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            {props.showStepStatus && <StepStatus color={props.primaryColor}>Completed</StepStatus>}
        </Footer>
    </StepCard>
);
