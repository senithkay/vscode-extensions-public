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
import { Footer, Header, HeaderProps, StepCard, StepCardProps, StepStatus, StepSubTitle, StepTitle, StepperStyleProps } from "./Stepper";
import styled from "@emotion/styled";

const CurrentStepCircle = styled.div`
    background-color: var(--vscode-editor-foreground);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid ${(props: StepperStyleProps) => props.color};
    position: relative;
    left: 20px;
    top: 20px;
    transform: translate(-50%, -50%);
`;

const HorizontalLeftInprogressBar = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: calc(50% - 30px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

const HorizontalRightInprogressBar = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: calc(50% - 30px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

const InnerCircle = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: 25px;
    height: 25px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

export const CurrentStepHeader: React.FC<HeaderProps> = (props: HeaderProps) => (
    <Header>
        <CurrentStepCircle color={props.primaryColor}>
            <InnerCircle color={props.primaryColor}/>
        </CurrentStepCircle>
        {props.hideBar ? null : (
            <>
                <HorizontalLeftInprogressBar color={props.primaryColor}/>
                <HorizontalRightInprogressBar color={props.secondaryColor}/>
            </>
        )}        
    </Header>
);

export const CurrentStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <CurrentStepHeader hideBar={(props.totalSteps === props.step.id + 1)} primaryColor={props.primaryColor} secondaryColor={props.secondaryColor}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            <StepStatus color={props.primaryColor}>
                Inprogress
            </StepStatus>
        </Footer>
    </StepCard>
);
