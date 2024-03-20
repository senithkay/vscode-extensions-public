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
import { MessageProcessorWizard } from "./views/Forms/MessageProcessorForm";
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { GettingStarted } from "./views/GettingStarted";
import styled from '@emotion/styled';
import { InboundEPWizard } from './views/Forms/InboundEPform';
import { LocalEntryWizard } from './views/Forms/LocalEntryForm';
import { RegistryResourceForm } from './views/Forms/RegistryResourceForm';
import { ProxyServiceWizard } from "./views/Forms/ProxyServiceForm";
import { TemplateWizard } from "./views/Forms/TemplateForm";
import { ClassMediatorForm } from './views/Forms/ClassMediatorForm';
import { HttpEndpointWizard } from "./views/Forms/HTTPEndpointForm";
import { AddressEndpointWizard } from "./views/Forms/AddressEndpointForm";
import { WsdlEndpointWizard } from "./views/Forms/WSDLEndpointForm";
import { DefaultEndpointWizard } from "./views/Forms/DefaultEndpointForm";
import { LoadBalanceWizard } from './views/Forms/LoadBalanceEPform';
import { getSyntaxTreeType } from './utils/syntax-tree';
import { FailoverWizard } from './views/Forms/FailoverEndpointForm';
import { DiagramService } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { ProxyView, ResourceView, SequenceView } from './views/Diagram';
import { RecipientWizard } from './views/Forms/RecipientEndpointForm';

const MainContainer = styled.div`
    display: flex;
    overflow: hidden;
`;

const MainContent = styled.div`
    flex-grow: 1;
`;

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

const ViewContainer = styled.div({});

const MainPanel = () => {
    const { rpcClient } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();
    const [showAIWindow, setShowAIWindow] = useState<boolean>(false);
    const [machineView, setMachineView] = useState<MACHINE_VIEW>();
    const [showNavigator, setShowNavigator] = useState<boolean>(true);
    const [stateUpdated, setStateUpdated] = React.useState<boolean>(false);

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'newProject' in newState && newState.newProject === 'viewReady') {
            setStateUpdated(!stateUpdated);
        }
        if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewReady') {
            setStateUpdated(!stateUpdated);
        }
        if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewEditing') {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.EDIT_DONE, location: null });
            setStateUpdated(!stateUpdated);
        }
    });

    useEffect(() => {
        fetchContext();
    }, [stateUpdated]);

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

    const getUniqueKey = (model: any, documentUri: string) => {
        return `${JSON.stringify(model?.range)}-${documentUri}`;
    }

    const fetchContext = () => {
        rpcClient.getVisualizerState().then((machineView) => {
            let shouldShowNavigator = true;
            switch (machineView?.view) {
                case MACHINE_VIEW.Welcome:
                    setViewComponent(<GettingStarted />);
                    shouldShowNavigator = false;
                    break;
                case MACHINE_VIEW.Overview:
                    setViewComponent(<Overview stateUpdated />);
                    break;
                case MACHINE_VIEW.Diagram:
                    setViewComponent(
                        <SequenceView
                            key={getUniqueKey(machineView.stNode, machineView.documentUri)}
                            model={machineView.stNode as DiagramService}
                            documentUri={machineView.documentUri}
                            diagnostics={machineView.diagnostics}
                        />
                    );
                    rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
                    break;
                case MACHINE_VIEW.ResourceView:
                    setViewComponent(
                        <ResourceView
                            key={getUniqueKey(machineView.stNode, machineView.documentUri)}
                            model={machineView.stNode as DiagramService}
                            documentUri={machineView.documentUri}
                            diagnostics={machineView.diagnostics}
                        />
                    );
                    rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
                    break;
                case MACHINE_VIEW.SequenceView:
                    setViewComponent(
                        <SequenceView
                            key={getUniqueKey(machineView.stNode, machineView.documentUri)}
                            model={machineView.stNode as DiagramService}
                            documentUri={machineView.documentUri}
                            diagnostics={machineView.diagnostics}
                        />
                    );
                    rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
                    break;
                case MACHINE_VIEW.ProxyView:
                    setViewComponent(
                        <ProxyView
                            key={getUniqueKey(machineView.stNode, machineView.documentUri)}
                            model={machineView.stNode as DiagramService}
                            documentUri={machineView.documentUri}
                            diagnostics={machineView.diagnostics}
                        />
                    );
                    rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
                    break;
                case MACHINE_VIEW.ServiceDesigner:
                    setViewComponent(<ServiceDesignerView syntaxTree={machineView.stNode} documentUri={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.APIForm:
                    setViewComponent(<APIWizard apiData={(machineView.customProps as APIWizardProps)?.apiData} path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.EndPointForm:
                    setViewComponent(<EndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.LoadBalanceEndPointForm:
                    setViewComponent(<LoadBalanceWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.FailoverEndPointForm:
                    setViewComponent(<FailoverWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.RecipientEndPointForm:
                    setViewComponent(<RecipientWizard path={machineView.documentUri} />);
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
                case MACHINE_VIEW.HttpEndpointForm:
                    setViewComponent(<HttpEndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.AddressEndpointForm:
                    setViewComponent(<AddressEndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.WsdlEndpointForm:
                    setViewComponent(<WsdlEndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.DefaultEndpointForm:
                    setViewComponent(<DefaultEndpointWizard path={machineView.documentUri} />);
                    break;
                case MACHINE_VIEW.ProjectCreationForm:
                    setViewComponent(<ProjectWizard cancelView={MACHINE_VIEW.Overview} />);
                    shouldShowNavigator = false;
                    break;
                case MACHINE_VIEW.LocalEntryForm:
                    setViewComponent(<LocalEntryWizard path={machineView.documentUri} />);
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
            // Update the showNavigator state based on the current view
            setShowNavigator(shouldShowNavigator);
        });
    }

    return (
        <ViewContainer>
            {!viewComponent ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : <>
                {showNavigator && <NavigationBar />}
                {viewComponent}
            </>}
        </ViewContainer>
    );
};

export default MainPanel;   
