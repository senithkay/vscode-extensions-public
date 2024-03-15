/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

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

