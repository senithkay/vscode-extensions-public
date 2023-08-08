import React from "react";
import { Footer, Header, HeaderProps, StepCard, StepCardProps, StepStatus, StepSubTitle, StepTitle } from "./Stepper";
import styled from "@emotion/styled";

const CurrentStepCircle = styled.div`
    background-color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #00F;
    position: relative;
    left: 20px;
    top: 20px;
    transform: translate(-50%, -50%);
`;

const HorizontalLeftInprogressBar = styled.div`
    background-color: blue;
    width: calc(50% - 30px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

const HorizontalRightInprogressBar = styled.div`
    background-color: #16b0f7;
    width: calc(50% - 30px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

const InnerCircle = styled.div`
    background-color: blue;
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
        <CurrentStepCircle>
            <InnerCircle />
        </CurrentStepCircle>
        {props.hideBar ? null : (
            <>
                <HorizontalLeftInprogressBar />
                <HorizontalRightInprogressBar />
            </>
        )}        
    </Header>
);

export const CurrentStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <CurrentStepHeader hideBar={(props.totalSteps === props.step.id + 1)}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            <StepStatus color='blue'>
                Inprogress
            </StepStatus>
        </Footer>
    </StepCard>
);
