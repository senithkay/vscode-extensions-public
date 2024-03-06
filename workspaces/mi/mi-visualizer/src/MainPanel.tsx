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
    const [showAIWindow, setShowAIWindow] = useState<boolean>(false);
    

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setMainState(newState);
    });

    useEffect(() => {
        if (component && machineView.view === 'Overview') {
            setShowAIWindow(true);
        }
    }, [component]); 

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
                    if (identifier && st?.syntaxTree?.api?.resource) {
                        const resourceNode = st?.syntaxTree?.api.resource.find((resource: any) => (resource.uriTemplate === machineView.identifier) || resource.uriTemplate === undefined);
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
            case "InboundEPForm":
                setComponent(<InboundEPWizard />);
                break;
            case "ProjectCreationForm":
                setComponent(<ProjectWizard />);
                break;
        }
    };
    return (
            
            <Allotment >
                <MainContent>
                    {!component ? (
                        <LoaderWrapper>
                            <ProgressRing />
                        </LoaderWrapper>
                    ) : <div>
                        <NavigationBar />
                        {component}
                    </div>}
                </MainContent>
                {showAIWindow && (
                <FadeInContainer>
                    {machineView.view == "Overview" ? <AIOverviewWindow /> : <AIArtifactWindow />}
                </FadeInContainer>
        )}       
             </Allotment>
    );
};

export default MainPanel;
