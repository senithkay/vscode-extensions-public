import React from 'react';
import styled from "@emotion/styled";

export interface StepperStyleProps {
    color?: string;
}

export interface StepperProps {
}

const DivWithCircle = styled.div`
    position: relative;
    width: 200px;
`;

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

const CurrentStepCircle = styled.div`
    background-color: #fff;
    width: 40px;
    height: 40px;
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

const CompletedHorizontalBar = styled.div`
    background-color: #048453;
    width: calc(100% - 60px);
    height: 2px;
    position: relative;
    top: 20px;
    left: 10px;
`;


const Header = styled(DivWithCircle)`
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

const StepCard = styled.div`
    display: flex;
    flex-direction: column;
`;

const Footer = styled.div`
    display: flex;
    flex-direction: column;
`;

const StepSubTitle = styled.div`
    opacity: 0.5;
    font-size: 12px;
    padding-top: 10px;
`;

const StepTitle = styled.div`
    font-size: 18px;
    padding-top: 5px;
`;

const StepStatus = styled.div`
    color: ${(props: StepperStyleProps) => props.color};
    padding-top: 5px;
    font-size: 14px;
`;


export const CircleWithRightSign: React.FC = () => (
    <CompletedCircle>
        <RightSign />
    </CompletedCircle>
);

export const CompletedStep: React.FC = () => (
    <>
        <CircleWithRightSign />
        <CompletedHorizontalBar />
    </>
);

export const InCompletedStep: React.FC = () => (
    <>
        <InCompletedCircle />
    </>
);

export const CurrentStep: React.FC = () => (
    <>
        <CurrentStepCircle>
            <InnerCircle />
        </CurrentStepCircle>
        <HorizontalLeftInprogressBar />
        <HorizontalRightInprogressBar />
    </>
);

export const Stepper: React.FC<StepperProps> = (props: StepperProps) => {
    console.log('Stepper props', props);
    return (
        <StpperContainer>
            <StepCard>
                <Header>
                    <CompletedStep />
                </Header>
                <Footer>
                    <StepSubTitle>
                        STEP 1
                    </StepSubTitle>
                    <StepTitle>
                        Card Details
                    </StepTitle>
                    <StepStatus color='#048453'>
                        Completed
                    </StepStatus>
                </Footer>
            </StepCard>
            <StepCard>
                <Header>
                    <CompletedStep />
                </Header>
                <Footer>
                    <StepSubTitle>
                        STEP 1
                    </StepSubTitle>
                    <StepTitle>
                        Card Details
                    </StepTitle>
                    <StepStatus color='#048453'>
                        Completed
                    </StepStatus>
                </Footer>
            </StepCard>
            <StepCard>
                <Header>
                    <CurrentStep />
                </Header>
                <Footer>
                    <StepSubTitle>
                        STEP 2
                    </StepSubTitle>
                    <StepTitle>
                        Card Details
                    </StepTitle>
                    <StepStatus color='blue'>
                        Inprogress
                    </StepStatus>
                </Footer>
            </StepCard>
            <StepCard>
                <Header>
                    <InCompletedStep />
                </Header>
                <Footer>
                    <StepSubTitle>
                        STEP 3
                    </StepSubTitle>
                    <StepTitle>
                        Card Details
                    </StepTitle>
                    <StepSubTitle>
                        Pending
                    </StepSubTitle>
                </Footer>
            </StepCard>
        </StpperContainer>
    );
};
