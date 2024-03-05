import React, { useEffect, useState } from 'react';
import { EVENT_TYPE, MACHINE_VIEW, MachineStateValue } from '@wso2-enterprise/mi-core';
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
import { LocalEntryWizard } from './views/Forms/LocalEntryForm';

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

    useEffect(() => {
        fetchContext();

        rpcClient?.onStateChanged((newState: MachineStateValue) => {
            if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewReady') {
                fetchContext();
            }
            if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewEditing') {
                rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.EDIT_DONE, location: null });
                fetchContext();
            }
        });

    }, []);


    const fetchContext = () => {
        rpcClient.getVisualizerState().then((machineView) => {
            switch (machineView?.view) {
                case MACHINE_VIEW.Overview:
                    setViewComponent(<Overview />);
                    break;
                case MACHINE_VIEW.Diagram:
                    rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: machineView.documentUri }).then((st) => {
                        if (!st?.syntaxTree) {
                            return;
                        }

                        rpcClient.getMiDiagramRpcClient().getDiagnostics({ documentUri: machineView.documentUri }).then((diagnostics) => {

                            const identifier = machineView.identifier;
                            let model;
                            if (identifier != undefined && st.syntaxTree.api?.resource) {
                                model = st.syntaxTree.api.resource[identifier];
                            } else if (st.syntaxTree.sequence) {
                                model = st.syntaxTree.sequence;
                            }
                            setViewComponent(<Diagram model={model} documentUri={machineView.documentUri} diagnostics={diagnostics.diagnostics} />);
                        });
                    });
                    rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
                    break;
                case MACHINE_VIEW.ServiceDesigner:
                    setViewComponent(<ServiceDesignerView />);
                    break;
                case MACHINE_VIEW.APIForm:
                    setViewComponent(<APIWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.EndPointForm:
                    setViewComponent(<EndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.SequenceForm:
                    setViewComponent(<SequenceWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.InboundEPForm:
                    setViewComponent(<InboundEPWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.ProjectCreationForm:
                    setViewComponent(<ProjectWizard />);
                    break;
                case MACHINE_VIEW.LocalEntryForm:
                    setViewComponent(<LocalEntryWizard />);
                    break;
                default:
                    setViewComponent(null);
            }
        });
    }

    return (
        <div style={{
            overflow: "hidden",
        }}>
            {!viewComponent ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : <div>
                <NavigationBar />
                {viewComponent}
            </div>}
        </div>
    );
};

export default MainPanel;
