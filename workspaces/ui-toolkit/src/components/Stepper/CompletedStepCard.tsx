import React from "react";
import { StepCard, Footer, StepTitle, StepSubTitle, StepStatus, Header, StepCardProps, HeaderProps } from "./Stepper";
import styled from "@emotion/styled";

const CompletedCircle = styled.div`
    background-color: #048453;
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
    background-color: #048453;
    width: calc(100% - 60px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;

export const CircleWithRightSign: React.FC = () => (
    <CompletedCircle>
        <RightSign />
    </CompletedCircle>
);

export const CompletedStepHeader: React.FC<HeaderProps> = (props: HeaderProps) => (
    <Header>
        <CircleWithRightSign />
        {props.hideBar ? null : <CompletedHorizontalBar />}
    </Header>
);

export const CompletedStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        <CompletedStepHeader hideBar={(props.totalSteps === props.step.id + 1)}/>
        <Footer>
            <StepSubTitle>
                {`STEP ${props.step.id + 1}`}
            </StepSubTitle>
            <StepTitle>
                {props.step.title}
            </StepTitle>
            <StepStatus color='#048453'>
                Completed
            </StepStatus>
        </Footer>
    </StepCard>
);
