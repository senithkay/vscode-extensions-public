/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import styled from "@emotion/styled";
import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";


const Container = styled.div<{variant: 'primary' | 'secondary'}>`
    border-left: 0.3rem solid var(${props => props.variant ==='secondary' ? '--vscode-editorWidget-border' : '--vscode-focusBorder'});
    background: var(${props => props.variant === 'secondary' ? 'transparent' : '--vscode-inputValidation-infoBackground'});
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    gap: 12px;
    margin-bottom: 15px;
    width: -webkit-fill-available;
`;

const WideVSCodeButton = styled(VSCodeButton)`
    width: 100%;
    max-width: 300px;
    align-self: center;
`;

const Title = styled.div`
    color: var(--vscode-foreground);
    font-weight: 500;
`;

const SubTitle = styled.div`
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
`;

interface Props {
    title?: string;
    subTitle?: string;
    buttonTitle: string;
    iconName?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    buttonDisabled?: boolean;
    buttonId?: string;
}

export const AlertBox = (props: Props) => {
    const { title, buttonTitle, subTitle, iconName, variant = 'primary', buttonDisabled = false, onClick, buttonId } = props;
    return (
        <Container variant={variant}>
            {title && <Title>{title}</Title>}
            {subTitle && <SubTitle>{subTitle}</SubTitle>}
            <WideVSCodeButton onClick={onClick} appearance={variant} disabled={buttonDisabled} id={`alert-btn${buttonId ? `-${buttonId}` : ''}`}>
                {iconName && (
                    <>
                        <Codicon name={iconName} /> &nbsp;{" "}
                    </>
                )}
                {buttonTitle}
            </WideVSCodeButton>
        </Container>
    );
};
