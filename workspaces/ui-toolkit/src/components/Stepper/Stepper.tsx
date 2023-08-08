import React from 'react';
import styled from "@emotion/styled";
import { CompletedStepCard } from './CompletedStepCard';
import { CurrentStepCard } from './CurrentStepCard';
import { InCompletedStepCard } from './IncompleteStepCard';

export interface StepperStyleProps {
    color?: string;
}

export interface Step {
    id: number;
    title: string;
}

export interface StepperProps {
    steps: string[];
    currentStep: number;
}

export interface StepCardProps {
    step: Step;
    currentStep: number;
    totalSteps: number;
}

export interface HeaderProps {
    hideBar: boolean;
}

const DivWithCircle = styled.div`
    position: relative;
    width: 200px;
`;

export const Header = styled(DivWithCircle)`
    background-color: #fff;
    display: flex;
    flex-direction: row;
`;

const StpperContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: initial;
    height: 300px;
`;

export const StepCard = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Footer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const StepSubTitle = styled.div`
    opacity: 0.5;
    font-size: 12px;
    padding-top: 10px;
`;

export const StepTitle = styled.div`
    font-size: 18px;
    padding-top: 5px;
`;

export const StepStatus = styled.div`
    color: ${(props: StepperStyleProps) => props.color};
    padding-top: 5px;
    font-size: 14px;
`;

export const Stepper: React.FC<StepperProps> = (props: StepperProps) => {
    const { steps, currentStep } = props;

    return (
        <StpperContainer>
            {steps.map((step: string, id: number) => {
                const stepCard: StepCardProps = {
                    currentStep: currentStep,
                    step: {
                        id: id,
                        title: step
                    },
                    totalSteps: steps.length
                };
                if (id < currentStep) {
                    return <CompletedStepCard key={`step${id}`} {...stepCard} />;
                } else if (id === currentStep) {
                    return <CurrentStepCard key={`step${id}`} {...stepCard} />;
                }
                return <InCompletedStepCard key={`step${id}`} {...stepCard} />;
            })}
        </StpperContainer>
    );
};
