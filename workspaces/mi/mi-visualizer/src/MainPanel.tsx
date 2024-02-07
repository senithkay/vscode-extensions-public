import React, { useEffect, useState } from 'react';
import { MachineStateValue, VisualizerLocation } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Overview } from './views/Overview';
import { ServiceDesignerView } from './views/ServiceDesigner';
import { APIWizard } from './views/Forms/APIform';
import { EndpointWizard } from './views/Forms/EndpointForm';
import { SequenceWizard } from './views/Forms/SequenceForm';
import { NavigationBar } from './components/NavigationBar';
import { ProjectWizard } from './views/Forms/ProjectForm';
import { Diagram } from '@wso2-enterprise/mi-diagram-2';

const MainPanel = (props: { state: MachineStateValue }) => {
    const { state } = props;
    const { rpcClient } = useVisualizerContext();
    const [machineView, setMachineView] = useState<VisualizerLocation>(null);
    const [mainState, setMainState] = React.useState<MachineStateValue>(state);
    const [component, setComponent] = useState<JSX.Element | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number>(0);

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

        rpcClient.getMiDiagramRpcClient().onRefresh(() => {
            setLastUpdated(Date.now());
        });
    }, [mainState]);

    useEffect(() => {
        if (machineView) {
            OverviewComponent();
        }

    }, [machineView, lastUpdated]);

    const OverviewComponent = () => {
        switch (machineView.view) {
            case "Overview":
                setComponent(<Overview />);
                break;
            case "Diagram":
                rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: machineView.documentUri }).then((st) => {
                    if (machineView.identifier && st?.syntaxTree?.api?.resource) {
                        const resourceNode = st?.syntaxTree?.api.resource.find((resource: any) => resource.uriTemplate === machineView.identifier);
                        setComponent(<Diagram model={resourceNode} documentUri={machineView.documentUri} />);
                    }
                });
                break;
            case "ServiceDesigner":
                setComponent(<ServiceDesignerView />);
                break;
            case "APIForm":
                setComponent(<APIWizard />);
                break;
            case "EndPointForm":
                setComponent(<EndpointWizard />);
                break;
            case "SequenceForm":
                setComponent(<SequenceWizard />);
                break;
            case "ProjectCreationForm":
                setComponent(<ProjectWizard />);
                break;
        }
    };

    return (
        <div>
            {!component ? <h1>LOADING</h1> : <div>
                <NavigationBar />
                {component}
            </div>}
        </div>
    );
};

export default MainPanel;
