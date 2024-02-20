import React, { useEffect } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { MachineStateValue } from "@wso2-enterprise/eggplant-core";
import { Loader } from './components/Loader';
import MainPanel from './MainPanel';
import WelcomeView from './views/WelcomeView';

const VisualizerMain = () => {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        rpcClient.webviewReady();
    }, []);


    return (
        <>
            {(() => {
                switch (true) {
                    case typeof state === 'object' && 'ready' in state:
                        return <MainPanel />;
                    case typeof state === 'object' && 'newProject' in state:
                        return <WelcomeView state={state} />;
                    default:
                        return <Loader />;
                }
            })()}
        </>
    );
};

export default VisualizerMain;

