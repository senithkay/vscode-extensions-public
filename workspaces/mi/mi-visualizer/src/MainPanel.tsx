import React, { useEffect, useState } from 'react';
import { MachineStateValue, MachineViews } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Overview } from './views/Overview';
import { ServiceDesignerView } from './views/ServiceDesigner';
import { APIWizard } from './views/Forms/APIform';
import { EndpointWizard } from './views/Forms/EndpointForm';
import { SequenceWizard } from './views/Forms/SequenceForm';
import { NavigationBar } from './components/NavigationBar';
import { ProjectWizard } from './views/Forms/ProjectForm';
import { Diagram } from '@wso2-enterprise/mi-diagram-2';
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { InboundEPWizard } from './views/Forms/InboundEPform';
import { DiagramView } from './views/DiagramView';

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 40px;
    width: 40px;
    margin-top: auto;
    padding: 4px;
`;

const MainPanel = () => {
    const { rpcClient } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();
    const [view, setView] = useState<MachineViews>(null);

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewReady') {
            fetchContext();
        }
    });

    useEffect(() => {
        fetchContext();
    }, []);


    const fetchContext = () => {
        rpcClient.getVisualizerState().then((machineView) => {
            switch (machineView?.view) {
                case "Overview":
                    setViewComponent(<Overview />);
                    break;
                case "Diagram":
                    setViewComponent(<DiagramView />);
                    break;
                case "ServiceDesigner":
                    setViewComponent(<ServiceDesignerView />);
                    break;
                case "APIForm":
                    setViewComponent(<APIWizard />);
                    break;
                case "EndPointForm":
                    setViewComponent(<EndpointWizard />);
                    break;
                case "SequenceForm":
                    setViewComponent(<SequenceWizard />);
                    break;
                case "InboundEPForm":
                    setViewComponent(<InboundEPWizard />);
                    break;
                case "ProjectCreationForm":
                    setViewComponent(<ProjectWizard />);
                    break;
                default:
                    setViewComponent(null);
            }
            setView(machineView.view);
        });
    }

    const MemoizedComponent = React.useMemo(() => viewComponent, [view]);

    return (
        <div style={{
            overflow: "hidden",
        }}>
            {!MemoizedComponent ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : <div>
                <NavigationBar />
                {MemoizedComponent}
            </div>}
        </div>
    );
};

export default MainPanel;
