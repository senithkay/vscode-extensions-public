/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Icon, Typography } from "@wso2-enterprise/ui-toolkit";

export const Welcome = styled.div({
    padding: "0 20px",
});

const CardTitle = styled.h3({
    margin: "4px 0",
});

const CardWrapper = styled.div({
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "var(--vscode-toolbar-hoverBackground)",
    padding: "16px",
    borderRadius: "4px",
    marginBottom: "48px",
    gap: "16px",
    cursor: "pointer",
    maxWidth: "350px",
});

const PlayIcon = styled.div({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--vscode-foreground)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
});

const Triangle = styled.div({
    width: 0,
    height: 0,
    borderLeft: "12px solid #000",
    borderTop: "7px solid transparent",
    borderBottom: "7px solid transparent",
    marginLeft: "2px",
});

interface WelcomeMessageProps {
    isOnboarding?: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isOnboarding = false }) => {
    const { rpcClient } = useRpcContext();

    return (
        <Welcome>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "100px",
                }}
            >
                {isOnboarding && (
                    <CardWrapper
                        onClick={() =>
                            rpcClient.getAiPanelRpcClient().openExternalUrl({ url: "https://youtu.be/5klLsz1alPE" })
                        }
                    >
                        <PlayIcon>
                            <Triangle />
                        </PlayIcon>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <CardTitle>Quick Tour: WSO2 Copilot in Action</CardTitle>
                            <Typography
                                variant="body2"
                                sx={{ color: "var(--vscode-descriptionForeground)", fontSize: 12 }}
                            >
                                A quick walkthrough to get you started
                            </Typography>
                        </div>
                    </CardWrapper>
                )}

                <Icon
                    name="bi-ai-chat"
                    sx={{ width: 60, height: 50 }}
                    iconSx={{
                        fontSize: "60px",
                        color: "var(--vscode-foreground)",
                        cursor: "default",
                    }}
                />

                <div style={{ display: "inline-flex" }}>
                    <h2>WSO2 Copilot</h2>
                </div>
                <Typography
                    variant="body1"
                    sx={{
                        marginBottom: "24px",
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        maxWidth: 350,
                        fontSize: 14,
                    }}
                >
                    WSO2 Copilot is powered by AI. It can make mistakes. Make sure to review the generated code before
                    adding it to your integration.
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        marginBottom: "14px",
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        maxWidth: 350,
                        fontSize: 14,
                    }}
                >
                    Type / to use commands
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        marginBottom: "24px",
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        maxWidth: 350,
                        fontSize: 14,
                        gap: 10,
                        display: "inline-flex",
                    }}
                >
                    <Icon isCodicon={true} name="new-file" iconSx={{ cursor: "default" }} /> to attatch context
                </Typography>
            </div>
        </Welcome>
    );
};

export default WelcomeMessage;
