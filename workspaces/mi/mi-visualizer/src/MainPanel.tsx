import React, { useEffect, useState } from 'react';
import { MachineStateValue, VisualizerLocation } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Overview } from './views/Overview';
import { MIDiagram } from '@wso2-enterprise/mi-diagram';
import { ServiceDesigner } from './views/ServiceDesigner';


const MainPanel = (props: { state: MachineStateValue }) => {
    const { state } = props;
    const { rpcClient } = useVisualizerContext();
    const [machineView, setMachineView] = useState<VisualizerLocation>(null);
    const [mainState, setMainState] = React.useState<MachineStateValue>(state);

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setMainState(newState);
    });

    useEffect(() => {
        if (typeof mainState === 'object' && 'ready' in mainState && mainState.ready === 'viewReady') {
            try {
                rpcClient.getVisualizerState().then((mState) => {
                    setMachineView(mState);
                });
            } catch (error) {

            }
        }
    }, [mainState]);

    const OverviewComponent = () => {
        switch (machineView.view) {
            case "Overview":
                return <Overview />;
            case "Diagram":
                return <MIDiagram documentUri={machineView.documentUri} />
            case "ServiceDesigner":
                return <ServiceDesigner />
            default:
                return <h1>LOADING</h1>;
        }
    };

    return (
        <div>
            {machineView && <OverviewComponent />}
        </div>
    );
};

export default MainPanel;
