import React, { useEffect, useState } from 'react';
import { EVENT_TYPE, MACHINE_VIEW, MachineStateValue } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Overview } from './views/Overview';
import { ServiceDesignerView } from './views/ServiceDesigner';
import { APIWizard, APIWizardProps } from './views/Forms/APIform';
import { EndpointWizard } from './views/Forms/EndpointForm';
import { SequenceWizard } from './views/Forms/SequenceForm';
import { NavigationBar } from './components/NavigationBar';
import { ProjectWizard } from './views/Forms/ProjectForm';
import { ImportProjectWizard } from './views/Forms/ImportProjectForm';
import { TaskWizard } from './views/Forms/TaskForm';
import { MessageStoreWizard } from './views/Forms/MessageStoreForm/index';
import { Diagram } from '@wso2-enterprise/mi-diagram-2';
import { MessageProcessorWizard } from "./views/Forms/MessageProcessorForm";
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { InboundEPWizard } from './views/Forms/InboundEPform';
import { SidePanel } from '@wso2-enterprise/ui-toolkit';
import { AIOverviewWindow} from './views/AIOverviewWindow';
import { AIArtifactWindow } from './views/AIArtifactWindow';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { css, keyframes } from '@emotion/react';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;


const MainContainer = styled.div`
    display: flex;
    overflow: hidden;
`;


const FadeInContainer = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: ${fadeIn} 0.2s;
`;

const MainContent = styled.div`
    flex-grow: 1;
`;
import { LocalEntryWizard } from './views/Forms/LocalEntryForm';
import { RegistryResourceForm } from './views/Forms/RegistryResourceForm';
import { ProxyServiceWizard } from "./views/Forms/ProxyServiceForm";
import { TemplateWizard } from "./views/Forms/TemplateForm";
import { ClassMediatorForm } from './views/Forms/ClassMediatorForm';

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
    const [showAIWindow, setShowAIWindow] = useState<boolean>(false);
    const [machineView, setMachineView] = useState<MACHINE_VIEW>();

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

    useEffect(() => {
        rpcClient.getVisualizerState().then((machineView) => {
            setMachineView(machineView.view);
            if (viewComponent && machineView.view == MACHINE_VIEW.Overview) {
                setShowAIWindow(true);
            }
        });
    }, [viewComponent]); 

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'i' && (event.metaKey || event.ctrlKey)) {
                setShowAIWindow(prevShow => !prevShow);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
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
                    rpcClient
                        .getMiDiagramRpcClient()
                        .getSyntaxTree({ documentUri: machineView.documentUri })
                        .then((st) => {
                            if (st) {
                                setViewComponent(<ServiceDesignerView syntaxTree={st.syntaxTree} documentUri={machineView.documentUri} />);
                            }
                        });
                    break;
                case MACHINE_VIEW.APIForm:
                    setViewComponent(<APIWizard apiData={(machineView.customProps as APIWizardProps)?.apiData} path={machineView.documentUri} />);
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
                case MACHINE_VIEW.RegistryResourceForm:
                    setViewComponent(<RegistryResourceForm path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.MessageProcessorForm:
                    setViewComponent(<MessageProcessorWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.ProxyServiceForm:
                    setViewComponent(<ProxyServiceWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.TaskForm:
                    setViewComponent(<TaskWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.TemplateForm:
                    setViewComponent(<TemplateWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.ProjectCreationForm:
                    setViewComponent(<ProjectWizard />);
                    break;
                case MACHINE_VIEW.LocalEntryForm:
                    setViewComponent(<LocalEntryWizard />);
                    break;
                case MACHINE_VIEW.ImportProjectForm:
                    setViewComponent(<ImportProjectWizard />);
                    break;
                case MACHINE_VIEW.MessageStoreForm:
                    setViewComponent(<MessageStoreWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.ClassMediatorForm:
                    setViewComponent(<ClassMediatorForm path={machineView.documentUri} />);
                    break;
                default:
                    setViewComponent(null);
            }
        });
    }

    return (
        <Allotment >
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
            {showAIWindow && (
            <FadeInContainer>
                {machineView == MACHINE_VIEW.Overview ? <AIOverviewWindow /> : <AIArtifactWindow />}
            </FadeInContainer>
            )}
        </Allotment>

    );
};

export default MainPanel;   
