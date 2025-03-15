/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Button } from "@wso2-enterprise/ui-toolkit";

const Wrapper = styled.div`
    max-width: 660px;
    margin: 80px 120px;
`;

const Headline = styled.div`
    font-size: 2.7em;
    font-weight: 400;
    font-size: 2.7em;
    white-space: nowrap;
    margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
    margin-top: 10px;
    width: 100%;
`;

const ButtonContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    height: 28px;
`;

//

const TitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
`;


const StepContainer = styled.div`
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
`;


const StepDescription = styled.div<{ color?: string }>`
    font-size: 1em;
    line-height: 20px;
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    color: ${(props: { color?: string }) => props.color || "inherit"};
`;


export function BallerinaUpdateView() {
    const { rpcClient } = useRpcContext();

    const updateBallerina = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["ballerina.update-ballerina"] })
    };

    return (
        <Wrapper>
            <TitleContainer>
                <Headline>Ballerina 2201.12.0 (Swan Lake Update 12)</Headline>
            </TitleContainer>
            <StepContainer>
                <Row>
                    <Column>
                        <StepDescription>
                            We're sorry, but your current ballerina distribution is not compatible with the current version of our VS Code extension. Please consider updating to version 12 for a seamless experience.
                        </StepDescription>
                        <StyledButton appearance="primary" onClick={() => updateBallerina()}>
                            <ButtonContent>
                                Update  Now
                            </ButtonContent>
                        </StyledButton>
                    </Column>
                </Row>
            </StepContainer>
        </Wrapper>
    );
}
