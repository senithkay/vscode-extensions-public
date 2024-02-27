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
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { InboundEPWizard } from './views/Forms/InboundEPform';

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

        rpcClient.onFileContentUpdate(() => {
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
                    const identifier = machineView.identifier || machineView.identifier === undefined;
                    if (identifier && st?.syntaxTree) {
                        if (st?.syntaxTree?.api?.resource) {
                            const resourceNode = st?.syntaxTree?.api.resource.find((resource: any) => (resource.uriTemplate === machineView.identifier) || resource.uriTemplate === undefined);
                            setComponent(<Diagram model={resourceNode} documentUri={machineView.documentUri} />);
                        } else if (st?.syntaxTree?.sequence) {
                            const sequenceNode = st?.syntaxTree?.sequence;
                            setComponent(<Diagram model={sequenceNode} documentUri={machineView.documentUri} />);
                        }
                    }
                });
                rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
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
            case "InboundEPForm":
                setComponent(<InboundEPWizard />);
                break;
            case "ProjectCreationForm":
                setComponent(<ProjectWizard />);
                break;
        }
    };

    return (
        <div style={{
            overflow: "hidden",
        }}>
            {!component ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : <div>
                <NavigationBar />
                {component}
            </div>}
        </div>
    );
};

export default MainPanel;
