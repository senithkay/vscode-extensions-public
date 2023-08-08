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

export interface StepCompColors {
    currentStepPrimaryColor?: string;
    currentStepSecondaryColor?: string;
    completedStepColor?: string;
    incompletedStepColor?: string;
}

export interface StepperProps {
    steps: string[];
    currentStep: number;
    colors?: StepCompColors;
}

export interface StepCardProps {
    step: Step;
    currentStep: number;
    totalSteps: number;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface HeaderProps {
    hideBar?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
}

const DivWithCircle = styled.div`
    position: relative;
    width: 200px;
`;

export const Header = styled(DivWithCircle)`
    background-color: var(--vscode-editor-background);
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
    font-size: 10px;
    padding-top: 10px;
`;

export const StepTitle = styled.div`
    font-size: 12px;
    padding-top: 5px;
`;

export const StepStatus = styled.div`
    color: ${(props: StepperStyleProps) => props.color};
    padding-top: 5px;
    font-size: 11px;
`;

export const Stepper: React.FC<StepperProps> = (props: StepperProps) => {
    const { steps, currentStep, colors } = props;

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
                    stepCard.primaryColor = colors?.completedStepColor ? colors.completedStepColor :
                        'var(--vscode-charts-green)';
                    return <CompletedStepCard key={`step${id}`} {...stepCard} />;
                } else if (id === currentStep) {
                    stepCard.primaryColor = colors?.currentStepPrimaryColor ? colors.currentStepPrimaryColor :
                        'var(--vscode-editorSuggestWidget-highlightForeground)';
                    stepCard.secondaryColor = colors?.currentStepSecondaryColor ? colors.currentStepSecondaryColor :
                        'var(--vscode-editorSuggestWidget-selectedBackground)';
                    return <CurrentStepCard key={`step${id}`} {...stepCard} />;
                }
                stepCard.primaryColor = colors?.incompletedStepColor ? colors?.incompletedStepColor :
                    'var(--vscode-editorSuggestWidget-selectedBackground)';
                return <InCompletedStepCard key={`step${id}`} {...stepCard} />;
            })}
        </StpperContainer>
    );
};
