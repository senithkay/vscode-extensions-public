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
    completedStepColor?: string;
    incompletedStepColor?: string;
}

export interface StepperProps {
    steps: string[];
    currentStep: number;
    showStepStatus?: boolean;
    colors?: StepCompColors;
}

export interface StepCardProps {
    step: Step;
    currentStep: number;
    totalSteps: number;
    color?: string;
    showStepStatus?: boolean;
}

export interface HeaderProps {
    hideBar?: boolean;
    primaryColor?: string;
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
    justify-content: center;
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
    font-size: 8px;
    padding-top: 15px;
`;

export const StepTitle = styled.div`
    font-size: 12px;
    padding-top: 5px;
`;

export const StepStatus = styled.div`
    color: ${(props: StepperStyleProps) => props.color};
    padding-top: 5px;
    font-size: 9px;
`;

export const StepCircle = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: relative;
    left: 12px;
    top: 20px;
    transform: translate(-50%, -50%);
`;

export const HorizontalBar = styled.div`
    background-color: ${(props: StepperStyleProps) => props.color};
    width: calc(100% - 60px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 18px;
`;

export const Stepper: React.FC<StepperProps> = (props: StepperProps) => {
    const { steps, currentStep, showStepStatus, colors } = props;

    return (
        <StpperContainer>
            {steps.map((step: string, id: number) => {
                const stepCard: StepCardProps = {
                    currentStep: currentStep,
                    step: {
                        id: id,
                        title: step
                    },
                    totalSteps: steps.length,
                    showStepStatus: showStepStatus
                };
                if (id < currentStep) {
                    stepCard.color = colors?.completedStepColor ? colors.completedStepColor :
                        'var(--vscode-textLink-foreground)';
                    return <CompletedStepCard key={`step${id}`} {...stepCard} />;
                } else if (id === currentStep) {
                    stepCard.color = colors?.incompletedStepColor ? colors?.incompletedStepColor :
                        'var(--vscode-editorOverviewRuler-selectionHighlightForeground)';
                    return <CurrentStepCard key={`step${id}`} {...stepCard} />;
                }
                stepCard.color = colors?.incompletedStepColor ? colors?.incompletedStepColor :
                    'var(--vscode-editorOverviewRuler-selectionHighlightForeground)';
                return <InCompletedStepCard key={`step${id}`} {...stepCard} />;
            })}
        </StpperContainer>
    );
};
