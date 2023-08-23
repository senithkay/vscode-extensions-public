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
import { StepCard, StepTitle, StepCardProps, StepCircle, HorizontalBar, BottomTitleWrapper, BottomTitleHorizontalBar, IconNTitleWrapper } from "./Stepper";
import styled from "@emotion/styled";

const RightSign = styled.div`
    position: relative;
    top: 15%;
    left: 35%;
    width: 5px;
    height: 12px;
    border: 2px solid white;
    border-bottom: none;
    border-right: none;
    transform: rotate(225deg);
`;

export const CompletedStepCard: React.FC<StepCardProps> = (props: StepCardProps) => (
    <StepCard>
        {props.titleAlignment === "right" ? (
            <>
                <StepCircle color='var(--vscode-textLink-foreground)'>
                    <RightSign />
                </StepCircle>
                <StepTitle color='var(--vscode-editor-foreground)'>
                    {props.step.title}
                </StepTitle>
                {props.totalSteps === props.step.id + 1 ? null : <HorizontalBar />}
            </>
        ) :
            <>
                <IconNTitleWrapper>
                    <StepCircle color='var(--vscode-textLink-foreground)'>
                        <RightSign />
                    </StepCircle>
                    {props.totalSteps === props.step.id + 1 ? null : <BottomTitleHorizontalBar />}
                    <BottomTitleWrapper color='var(--vscode-editor-foreground)'>
                        {props.step.title}
                    </BottomTitleWrapper>
                </IconNTitleWrapper>
            </>
        }
    </StepCard>
);
