/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { DownloadProgress } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
    height: calc(100vh - 100px);
    max-width: 800px;
    margin: 80px 120px;
    overflow: auto;
`;

const TitlePanel = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 40px;
`;

const Pane = styled.div`
    display: flex;
    padding: 0px !important;
    flex-direction: column;
    width: 100%;
`;

const Tab = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 0px;
    gap: 5px;
`;

const Headline = styled.div`
    font-size: 2.7em;
    font-weight: 400;
    font-size: 2.7em;
    white-space: nowrap;
    margin-bottom: 20px;
`;

const SubTitle = styled.div`
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 1.5em;
    line-height: normal;
`;

const Grid = styled.div({
    display: "flex",
    flexDirection: "row",
    gap: 20,
});

const AddButton = styled(Button)`
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

export interface SetupViewProps {
    haveLS: boolean;
}

export function SetupView(props: SetupViewProps) {
    const { rpcClient } = useRpcContext();
    const { haveLS } = props;

    const [progress, setProgress] = React.useState<DownloadProgress>(null);


    const downloadLS = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["kolab-setup.setupKola"] })
    };

    const reloadVscode = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["workbench.action.reloadWindow"] })
    };


    rpcClient?.onDownloadProgress((response: DownloadProgress) => {
        setProgress(response);
    });

    return (
        <>
            <Wrapper>
                <TitlePanel>
                    <Headline>Kola Setup for VS Code</Headline>
                </TitlePanel>
                <Grid>
                    <Pane>
                        <Tab>
                            <SubTitle>Have LS {haveLS}</SubTitle>
                        </Tab>
                        <Tab>
                            <SubTitle>Set up the Kola Distribution</SubTitle>
                            <AddButton appearance="primary" onClick={() => downloadLS()}>
                                <ButtonContent>
                                    <Codicon name="add" iconSx={{ fontSize: 16 }} />
                                    <TextWrapper>Download LS</TextWrapper>
                                </ButtonContent>
                            </AddButton>
                        </Tab>
                        {progress && <Tab>
                            Progress Information:
                            <SubTitle>Total Size: {progress.totalSize}MB</SubTitle>
                            <SubTitle>Downloaded: {progress.downloadedSize}MB</SubTitle>
                            <SubTitle>Message: {progress.message}</SubTitle>
                            <SubTitle>Percentage: {progress.percentage}%</SubTitle>

                            {progress.success &&
                                <AddButton appearance="primary" onClick={() => reloadVscode()}>
                                    <ButtonContent>
                                        <Codicon name="add" iconSx={{ fontSize: 16 }} />
                                        <TextWrapper>Reload vscode</TextWrapper>
                                    </ButtonContent>
                                </AddButton>
                            }
                        </Tab>}
                    </Pane>
                </Grid>
            </Wrapper>
        </>
    );
}
