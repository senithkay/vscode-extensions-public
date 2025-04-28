/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Icon, Typography } from "@wso2-enterprise/ui-toolkit";
import React from "react";

const PanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
    padding: 24px 16px;
`;

const TopSpacer = styled.div`
    flex-grow: 1;
    min-height: 24px;
`;

const BottomSpacer = styled.div`
    flex-grow: 1;
    min-height: 48px;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;

const FooterContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 18px;
    width: 100%;
    max-width: 360px;
    align-self: center;
    margin-bottom: 60px;
`;

const Title = styled.h2`
    display: inline-flex;
    margin-top: 40px;
`;

const StyledButton = styled(VSCodeButton)`
    width: 100%;
    height: 32px;
    margin-top: 12px;
`;

const PostLoginSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const LegalNotice: React.FC = () => {
    return (
        <PostLoginSection>
            <div>
                WSO2 Copilot uses AI to assist with integration. Please review all suggested content before adding it to
                your integration.
            </div>
            <div>
                By signing in, you agree to our{" "}
                <a
                    href="https://wso2.com/licenses/wso2-ai-services-terms-of-use/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Terms of Use
                </a>
                .
            </div>
        </PostLoginSection>
    );
};

const LoginPanel: React.FC = () => {
    const { rpcClient } = useRpcContext();

    const handleWSO2Login = () => {
        rpcClient.getAiPanelRpcClient().login();
    };

    return (
        <PanelWrapper>
            <TopSpacer />
            <HeaderContent>
                <Icon
                    name="bi-ai-chat"
                    sx={{ width: 54, height: 54 }}
                    iconSx={{ fontSize: "54px", color: "var(--vscode-foreground)", cursor: "default" }}
                />
                <Title>Welcome to WSO2 Copilot</Title>
                <Typography
                    variant="body1"
                    sx={{
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        maxWidth: 350,
                        fontSize: 14,
                    }}
                >
                    Integrate better with your AI pair.
                </Typography>
            </HeaderContent>
            <BottomSpacer />
            <FooterContent>
                <LegalNotice />
                <StyledButton onClick={handleWSO2Login}>Login to WSO2 Copilot</StyledButton>
            </FooterContent>
        </PanelWrapper>
    );
};

export default LoginPanel;
