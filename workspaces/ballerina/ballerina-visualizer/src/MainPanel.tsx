/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useState } from 'react';
import { KeyboardNavigationManager, MachineStateValue, STModification, MACHINE_VIEW, PopupMachineStateValue, EVENT_TYPE } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { Global, css } from '@emotion/react';
import styled from "@emotion/styled";
import { NavigationBar } from "./components/NavigationBar"
import { LoadingRing } from "./components/Loader";
import { DataMapper } from './views/DataMapper';
import { ERDiagram } from './views/ERDiagram';
import { GraphQLDiagram } from './views/GraphQLDiagram';
import { SequenceDiagram } from './views/SequenceDiagram';
import { EggplantDiagram } from './views/EggplantDiagram';
import { Overview } from './views/Overview';
import { ServiceDesigner } from './views/ServiceDesigner';
import { WelcomeView, ProjectForm, ComponentDiagram, AddComponentView, ServiceForm, EggplantOverview, PopupMessage } from './views/Eggplant';
import { handleRedo, handleUndo } from './utils/utils';
import { FunctionDefinition, ServiceDeclaration } from '@wso2-enterprise/syntax-tree';
import { URI } from 'vscode-uri';
// import PopupPanel from './views/Eggplant/PopupPanel';
import AddConnectionWizard from './views/Eggplant/Connection/AddConnectionWizard';
import { FormView, Typography } from '@wso2-enterprise/ui-toolkit';
import { PanelType, useVisualizerContext } from './Context';
import { SidePanel } from '@wso2-enterprise/ui-toolkit';
import { ConstructPanel } from "./views/ConstructPanel";
import { EditPanel } from "./views/EditPanel";
import { RecordEditor } from './views/RecordEditor/RecordEditor';
import PopupPanel from './PopupPanel';
import { ConnectorList } from "../../ballerina-visualizer/src/views/Connectors/ConnectorWizard"
import { EndpointList } from './views/Connectors/EndpointList';
import { getSymbolInfo } from '@wso2-enterprise/ballerina-low-code-diagram';

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const VisualizerContainer = styled.div`
    width: 100%;
    /* height: 100%; */
`;

const ComponentViewWrapper = styled.div`
    height: calc(100vh - 24px);
`;

const PopUpContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2100;
    background: var(--background);
`;

const MainPanel = () => {
    const { rpcClient } = useRpcContext();
    const {
        sidePanel,
        setSidePanel,
        popupMessage,
        setPopupMessage,
        activePanel } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();
    const [navActive, setNavActive] = useState<boolean>(true);
    const [popupState, setPopupState] = useState<PopupMachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'viewActive' in newState && newState.viewActive === 'viewReady') {
            fetchContext();
        }
    });

    rpcClient?.onPopupStateChanged((newState: PopupMachineStateValue) => {
        setPopupState(newState);
    });

    // TODO: Need to refactor this function. use util apply modifications function
    const applyModifications = async (modifications: STModification[], isRecordModification?: boolean) => {
        const langServerRPCClient = rpcClient.getLangClientRpcClient();
        let filePath;
        let m: STModification[];
        if (isRecordModification) {
            filePath = (await rpcClient.getVisualizerLocation()).recordFilePath;
            if (modifications.length === 1) {
                // Change the start position of the modification to the beginning of the file
                m = [{
                    ...modifications[0],
                    startLine: 0,
                    startColumn: 0,
                    endLine: 0,
                    endColumn: 0
                }];
            }
        } else {
            filePath = (await rpcClient.getVisualizerLocation()).documentUri;
            m = modifications;
        }
        const { parseSuccess, source: newSource, syntaxTree } = await langServerRPCClient?.stModify({
            astModifications: m,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            rpcClient.getVisualizerRpcClient().addToUndoStack(newSource);
            await langServerRPCClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });
        }
    };

    const fetchContext = () => {
        setNavActive(true);
        rpcClient.getVisualizerLocation().then((value) => {
            console.log("fetchContext", value);
            if (!value?.view) {
                setViewComponent(<LoadingRing />);
            } else {
                switch (value?.view) {
                    case MACHINE_VIEW.Overview:
                        if (value.isEggplant) {
                            setViewComponent(<EggplantOverview stateUpdated />);
                            break;
                        }
                        setViewComponent(<Overview visualizerLocation={value} />);
                        break;
                    case MACHINE_VIEW.ServiceDesigner:
                        setViewComponent(
                            <ServiceDesigner
                                model={value?.syntaxTree as ServiceDeclaration}
                                applyModifications={applyModifications}
                                isEggplant={value.isEggplant}
                            />
                        );
                        break;
                    case MACHINE_VIEW.EggplantDiagram:
                        setViewComponent(<EggplantDiagram syntaxTree={value?.syntaxTree} />);
                        break;
                    case MACHINE_VIEW.ERDiagram:
                        setViewComponent(<ERDiagram />);
                        break;
                    case MACHINE_VIEW.DataMapper:
                        setViewComponent((
                            <DataMapper
                                filePath={value.documentUri}
                                model={value?.syntaxTree as FunctionDefinition}
                                applyModifications={applyModifications}
                            />
                        ));
                        break;
                    case MACHINE_VIEW.GraphQLDiagram:
                        setViewComponent(<GraphQLDiagram />);
                        break;
                    case MACHINE_VIEW.SequenceDiagram:
                        setViewComponent(
                            <SequenceDiagram syntaxTree={value?.syntaxTree} applyModifications={applyModifications} />)
                        break;
                    case MACHINE_VIEW.EggplantWelcome:
                        setNavActive(false);
                        setViewComponent(<WelcomeView />)
                        break;
                    case MACHINE_VIEW.EggplantProjectForm:
                        setViewComponent(<ProjectForm />)
                        break;
                    case MACHINE_VIEW.EggplantComponentView:
                        setViewComponent(<AddComponentView />)
                        break;
                    case MACHINE_VIEW.EggplantServiceForm:
                        setViewComponent(<ServiceForm />)
                        break;
                    default:
                        setNavActive(false);
                        setViewComponent(<LoadingRing />);
                }
            }
        });
    }

    useEffect(() => {
        fetchContext();
    }, []);

    useEffect(() => {
        const mouseTrapClient = KeyboardNavigationManager.getClient();

        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], () => handleUndo(rpcClient));
        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y'], async () => handleRedo(rpcClient));

        return () => {
            mouseTrapClient.resetMouseTrapInstance();
        }
    }, [viewComponent]);

    const handleOnCloseMessage = () => {
        setPopupMessage(false);
    }

    const handleOnClose = () => {
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.CLOSE_VIEW, location: { view: null }, isPopup: true })
    }

    return (
        <>
            <Global styles={globalStyles} />
            <VisualizerContainer>
                {navActive && <NavigationBar />}
                {viewComponent && <ComponentViewWrapper>
                    {viewComponent}
                </ComponentViewWrapper>}
                {sidePanel !== "EMPTY" && sidePanel === "ADD_CONNECTION" &&
                    <ConnectorList applyModifications={applyModifications} />
                }

                {popupMessage &&
                    <PopupMessage onClose={handleOnCloseMessage}>
                        <Typography variant='h3'>This feature is coming soon!</Typography>
                    </PopupMessage>
                }
                {sidePanel === "RECORD_EDITOR" && (
                    <RecordEditor
                        isRecordEditorOpen={sidePanel === "RECORD_EDITOR"}
                        onClose={() => setSidePanel("EMPTY")}
                        rpcClient={rpcClient}
                    />
                )}
                {activePanel?.isActive && activePanel.name === PanelType.CONSTRUCTPANEL && (
                    <ConstructPanel applyModifications={applyModifications} />
                )
                }
                {activePanel?.isActive && activePanel.name === PanelType.STATEMENTEDITOR && (
                    <EditPanel applyModifications={applyModifications} />
                )
                }
                {typeof popupState === 'object' && 'open' in popupState && (
                    <PopUpContainer>
                        <FormView title='' onClose={handleOnClose}>
                            <PopupPanel formState={popupState} />
                        </FormView>
                    </PopUpContainer>
                )}
                {sidePanel !== "EMPTY" && sidePanel === "ADD_ACTION" &&
                    <EndpointList stSymbolInfo={getSymbolInfo()} applyModifications={applyModifications} />
                }
            </VisualizerContainer>
        </>
    );
};

export default MainPanel;
