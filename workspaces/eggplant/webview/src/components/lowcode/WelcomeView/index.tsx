import React from 'react';
import { MachineStateValue, EventType } from "@wso2-enterprise/eggplant-core";
import ProjectForm from "../ProjectForm";
import { useVisualizerContext } from '@wso2-enterprise/eggplant-rpc-client';

const WelcomeView = (props: { state: MachineStateValue }) => {
    const { state } = props;
    const { eggplantRpcClient } = useVisualizerContext();

    const handleWelcomeView = () => {
        switch (true) {
            case typeof state === 'object' && 'newProject' in state && state.newProject == "welcome":
                return <WelcomeView />;
            case typeof state === 'object' && 'newProject' in state && state.newProject == "create":
                return <ProjectForm />;
        }
    };

    const handleGetStarted = () => {
        eggplantRpcClient.getWebviewRpcClient().sendMachineEvent({ type: "GET_STARTED" });
    }

    const WelcomeView = () => {
        return (
            <div style={{
                fontFamily: 'var(--vscode-font-family)',
                margin: 0,
                padding: 20,
                textAlign: 'center'
            }}>
                <header style={{
                    background: 'var(--vscode-editor-background)',
                    padding: 30,
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: 40, marginBottom: 10 }}>Welcome to Eggplant!</h1>
                    <p>The low-code tool that makes programming as easy as dragging and dropping.</p>
                    <button onClick={handleGetStarted} className="get-started" style={{
                        background: 'var(--vscode-button-background)',
                        color: 'var(--vscode-button-foreground)',
                        padding: '10px 20px',
                        border: 'none',
                        marginTop: '30px',
                        cursor: 'pointer'
                    }}>Get Started</button>
                </header>
            </div>
        );
    };

    return (handleWelcomeView());
};

export default WelcomeView;

