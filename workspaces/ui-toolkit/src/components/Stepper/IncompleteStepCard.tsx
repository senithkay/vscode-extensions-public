import React from "react";
import { Footer, Header, HeaderProps, StepCard, StepCardProps, StepSubTitle, StepTitle } from "./Stepper";
import styled from "@emotion/styled";

const InCompletedCircle = styled.div`
    background-color: #16b0f7;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    left: 20px;
    top: 20px;
    transform: translate(-50%, -50%);
`;

const InCompleteHorizontalBar = styled.div`
    background-color: #16b0f7;
    width: calc(100% - 60px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

const PendingStatus = styled.div`
    opacity: 0.5;
    padding-top: 5px;
    font-size: 14px;
`;

const InCompletedStepHeader: React.FC<HeaderProps> = (props: HeaderProps) => (
    <Header>
        <InCompletedCircle />
        {props.hideBar ? null : <InCompleteHorizontalBar />}
    </Header>
);

export const InCompletedStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <InCompletedStepHeader hideBar={(props.totalSteps === props.step.id + 1)}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            <PendingStatus>
                Pending
            </PendingStatus>
        </Footer>
    </StepCard>
);
