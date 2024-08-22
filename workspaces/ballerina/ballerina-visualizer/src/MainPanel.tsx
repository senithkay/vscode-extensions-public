/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useState } from 'react';
import { KeyboardNavigationManager, MachineStateValue, STModification, MACHINE_VIEW } from '@wso2-enterprise/ballerina-core';
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
import { WelcomeView, ProjectForm, AddComponentView, ServiceForm, EggplantOverview } from './views/Eggplant';
import { handleRedo, handleUndo } from './utils/utils';
import { FunctionDefinition, ServiceDeclaration, STNode } from '@wso2-enterprise/syntax-tree';
import { URI } from 'vscode-uri';
import PopupPanel from './views/Eggplant/PopupPanel';
import AddConnectionWizard from './views/Eggplant/Connection/AddConnectionWizard';
import { useVisualizerContext } from './Context';
import { SidePanel } from '@wso2-enterprise/ui-toolkit';
import { RecordEditor } from '@wso2-enterprise/record-creator';

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

const MainPanel = () => {
    const { rpcClient } = useRpcContext();
    const {
        popupScreen,
        sidePanel,
        setPopupScreen,
        setSidePanel
    } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();
    const [navActive, setNavActive] = useState<boolean>(true);
    const [recordPath, setRecordPath] = useState<string>("");
    const [recordFullST, setRecordFullST] = useState<STNode>();

    const applyModifications = async (modifications: STModification[], isRecordModification?: boolean) => {
        const langServerRPCClient = rpcClient.getLangClientRpcClient();
        let filePath;
        let m: STModification[];
        if (isRecordModification) {
            filePath =  (await rpcClient.getVisualizerLocation()).recordFilePath;
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
        if (isRecordModification) {
            setRecordFullST(syntaxTree);
        }
    };

    const applyRecordModifications = async (modifications: STModification[]) => {
        applyModifications(modifications, true);
    };

    const fetchContext = () => {
        setNavActive(true);
        rpcClient.getVisualizerLocation().then((value) => {
            if (!value?.view) {
                setViewComponent(<LoadingRing />);
            } else {
                switch (value?.view) {
                    case MACHINE_VIEW.Overview:
                        if (value.isEggplant) {
                            setViewComponent(<EggplantOverview stateUpdated />);
                            // setViewComponent(<ComponentDiagram stateUpdated />);
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
                        setViewComponent(<SequenceDiagram />)
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
        rpcClient.getVisualizerLocation().then((vl) => {
            const projectRoot = vl.projectUri;
            console.log(">>> project root path", projectRoot);
            setRecordPath(vl.recordFilePath);
            console.log(">>> record file path", vl.recordFilePath);
            console.log(">>> project root path", projectRoot);
        });
        console.log(">>> visualizer location", rpcClient.getVisualizerLocation());
    }, []);

    useEffect(() => {
        const mouseTrapClient = KeyboardNavigationManager.getClient();

        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], () => handleUndo(rpcClient));
        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y'], async () => handleRedo(rpcClient));

        return () => {
            mouseTrapClient.resetMouseTrapInstance();
        }
    }, [viewComponent]);

    const handleOnClosePopup = () => {
        setPopupScreen("EMPTY");
    };

    return (
        <>
            <Global styles={globalStyles} />
            <VisualizerContainer>
                {navActive && <NavigationBar />}
                {viewComponent && <ComponentViewWrapper>
                    {viewComponent}
                </ComponentViewWrapper>}
                {popupScreen !== "EMPTY" && <PopupPanel onClose={handleOnClosePopup}>
                    {popupScreen === "ADD_CONNECTION" && <AddConnectionWizard onClose={handleOnClosePopup} />}
                </PopupPanel>}  
                <SidePanel
                    isOpen={sidePanel !== "EMPTY"}
                    onClose={() => setSidePanel("EMPTY")}
                    width={600}
                >
                    {sidePanel === "RECORD_EDITOR" && recordPath && (
                        <RecordEditor
                            onClose={() => setSidePanel("EMPTY")}
                            applyModifications={applyRecordModifications}
                            importStatements={[]}
                            langServerRpcClient={rpcClient.getLangClientRpcClient()}
                            libraryBrowserRpcClient={null}
                            onCancel={() => setSidePanel("EMPTY")}
                            onCancelStatementEditor={() => setSidePanel("EMPTY")}
                            recordCreatorRpcClient={rpcClient.getRecordCreatorRpcClient()}
                            targetPosition={{ startLine: 0, startColumn: 0 }}
                            currentFile={{
                                content: "",
                                path: recordPath,
                                size: 0
                            }}
                            isDataMapper={false}
                            showHeader={false}
                            fullST={recordFullST}
                        />
                    )}
                </SidePanel>
                {sidePanel !== "EMPTY" && <SidePanel onClose={() => setSidePanel("EMPTY")}>
                    {sidePanel === "RECORD_EDITOR" && <div>Record Editor</div>}
                </SidePanel>}
            </VisualizerContainer>
        </>
    );
};

export default MainPanel;
