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
import React from "react";

const PanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
`;

const TopSpacer = styled.div`
    flex-grow: 1;
    min-height: 24px;
`;

const BottomSpacer = styled.div`
    flex-grow: 1;
    min-height: 48px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    max-width: 360px;
    align-self: center;
`;

const VideoThumbnail = styled.div`
    position: relative;
    width: 80%;
    aspect-ratio: 24 / 5;
    margin: 42px auto 0;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: background 0.2s;
`;

const YouTubeThumbnail = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    filter: grayscale(100%);
`;

// const PlayButton = styled.div`
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);
//     width: 36px;
//     height: 36px;
//     background-color: transparent;
//     border: 2px solid #000; /* circle border */
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     pointer-events: none;

//     &::before {
//         content: "";
//         display: inline-block;
//         width: 0;
//         height: 0;
//         border-style: solid;
//         border-width: 6px 0 6px 10px; /* creates right-pointing triangle */
//         border-color: transparent transparent transparent black; /* only left border is visible */
//     }
// `;

interface WelcomeMessageProps {
    isOnboarding?: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isOnboarding = false }) => {
    const { rpcClient } = useRpcContext();

    return (
        <PanelWrapper>
            <TopSpacer />
            <Content>
                <Icon
                    name="bi-ai-chat"
                    sx={{ width: 54, height: 54 }}
                    iconSx={{ fontSize: "54px", color: "var(--vscode-foreground)", cursor: "default" }}
                />
                <Typography
                    variant="h2"
                    sx={{
                        color: "var(--vscode-foreground)",
                        textAlign: "center",
                        margin: "12px 0",
                    }}
                >
                    BI Copilot
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        fontSize: 14,
                        marginTop: "16px",
                    }}
                >
                    BI Copilot is powered by AI. It can make mistakes. Review generated code before adding it to your
                    integration.
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        fontSize: 14,
                        marginTop: "36px",
                    }}
                >
                    Type <b>/</b> to use commands
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: "var(--vscode-descriptionForeground)",
                        textAlign: "center",
                        fontSize: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "12px",
                    }}
                >
                    <Icon isCodicon name="new-file" iconSx={{ cursor: "default" }} />
                    to attach context
                </Typography>
                {isOnboarding && (
                    <div title="Watch Quick Tour">
                        <VideoThumbnail
                            onClick={() =>
                                rpcClient.getCommonRpcClient().openExternalUrl({
                                    url: "https://youtu.be/5klLsz1alPE",
                                })
                            }
                        >
                            <YouTubeThumbnail
                                src="https://img.youtube.com/vi/QxZmnmbDUVk/hqdefault.jpg"
                                alt="Quick Tour Video"
                            />
                            <Icon
                                isCodicon
                                name="play-circle"
                                iconSx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: "32px",
                                    color: "#4b4b4b",
                                    backgroundColor: "transparent",
                                    cursor: "pointer",
                                    pointerEvents: "none",
                                }}
                            />
                        </VideoThumbnail>
                    </div>
                )}
            </Content>
            <BottomSpacer />
        </PanelWrapper>
    );
};

export default WelcomeMessage;
