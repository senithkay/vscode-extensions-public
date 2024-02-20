import React from 'react';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from '@wso2-enterprise/eggplant-rpc-client';
import styled from '@emotion/styled';

const buttonStyle = {
    "width": "100%",
    "height": "28px",
    "maxWidth": "300px",
    "display": "grid",
    "margin": "0 auto",
    "textAlign": "center"
}

const ButtonWrapper = styled.div`
    margin-top: 20px;
    margin-bottom: 20px;
`;

const InitProject = () => {
    const { rpcClient } = useVisualizerContext();

    const openProject = () => {
        rpcClient.getVisualizerRpcClient().executeCommand({ command: "OPEN_PROJECT" });
    }

    const createProject = () => {
        rpcClient.getVisualizerRpcClient().sendMachineEvent({ type: "GET_STARTED" });
    }

    return (
        <>
            <p>You have not yet opened an eggplant project.</p>

            <ButtonWrapper>
                <VSCodeButton onClick={openProject} style={buttonStyle}>Open Eggplant Project</VSCodeButton>
            </ButtonWrapper>

            <p>Or create a new Eggplant project by clicking the button below.</p>

            <ButtonWrapper>
                <VSCodeButton title="Create a new eggplant project" onClick={createProject} style={buttonStyle}>Create Eggplant Project</VSCodeButton>
            </ButtonWrapper>
        </>
    );
};

export default InitProject;

