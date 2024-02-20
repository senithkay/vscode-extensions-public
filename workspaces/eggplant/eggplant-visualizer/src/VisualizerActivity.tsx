import React, { useEffect } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { MachineStateValue } from "@wso2-enterprise/eggplant-core";
import { Loader } from './components/Loader';
import ActivityPanel from './views/ActivityPanel';
import InitProject from './views/InitProject';

const VisualizerActivity = () => {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        rpcClient.activityReady();
    }, []);

    return (
        <>
            {(() => {
                switch (true) {
                    case typeof state === 'object' && 'ready' in state:
                        return <ActivityPanel />;
                    case typeof state === 'object' && 'newProject' in state:
                        return <InitProject />;
                    default:
                        return <Loader />;
                }
            })()}
        </>
    );
};

export default VisualizerActivity;

