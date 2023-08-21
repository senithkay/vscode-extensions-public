/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
// import { ComponentModel, GetPersistERModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
// import { CMEntity as Entity } from "@wso2-enterprise/ballerina-languageclient";
import { generateEngine } from "./utils";
import { DiagramControls, HeaderWidget, OverlayLayerModel, CellDiagramContext, PromptScreen } from "./components";
import { dagreEngine, Colors } from "./resources";
import { Container, DiagramContainer, useStyles } from "./utils/CanvasStyles";

import "./resources/assets/font/fonts.css";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { Project } from "./types";

const projectModel: Project = {
    id: "p1",
    name: "A",
    components: [
        {
            id: "X",
            version: "0.1.0",
            services: {
                "ABC:A:X:svc1Basepath": {
                    id: "ABC:A:X:svc1Basepath",
                    label: "svc1Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:X:svc2Basepath"],
                    isExposedToInternet: false,
                },
                "ABC:A:X:svc2Basepath": {
                    id: "ABC:A:X:svc2Basepath",
                    label: "svc2Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Y:svc2Basepath", "salesforce://salesforceCorporate"],
                    isExposedToInternet: false,
                },
            },
            connections: [
                {
                    id: "ABC:A:Y:svc2Basepath",
                    type: "http",
                },
                {
                    id: "salesforce://salesforceCorporate",
                    type: "connector",
                },
            ],
        },
        {
            id: "Y",
            version: "0.1.1",
            services: {
                "ABC:A:Y:svc1Basepath": {
                    id: "ABC:A:Y:svc1Basepath",
                    label: "svc1Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Y:svc2Basepath"],
                    isExposedToInternet: true,
                },
                "ABC:A:Y:svc2Basepath": {
                    id: "ABC:A:Y:svc2Basepath",
                    label: "svc2Basepath",
                    type: "http",
                    dependencyIds: ["ABC:A:Z:basepath", "ABC:B:X:basepath"],
                    isExposedToInternet: false,
                },
            },
            connections: [
                {
                    id: "ABC:A:Z:basepath",
                    type: "http",
                },
                {
                    id: "ABC:B:X:basepath",
                    type: "grpc",
                },
            ],
        },
        {
            id: "Z",
            version: "0.2.0",
            services: {
                "ABC:A:Z:basepath": {
                    id: "ABC:A:Z:basepath",
                    label: "basepath",
                    type: "http",
                    dependencyIds: [],
                    isExposedToInternet: false,
                },
            },
            connections: [
                {
                    id: "github://github",
                    type: "connector",
                },
            ],
        },
    ],
    modelVersion: "0.4.0",
};

interface CellDiagramProps {
    // getPersistModel: () => Promise<GetPersistERModelResponse>;
    // selectedRecordName: string;
    // showProblemPanel: () => void;
}

export function CellDiagram(props: CellDiagramProps) {
    // const { getPersistModel, selectedRecordName, showProblemPanel } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel | undefined>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>("");
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [userMessage, setUserMessage] = useState<string>("");
    const [collapsedMode, setIsCollapsedMode] = useState<boolean>(false);
    const [focusedNodeId, setFocusedNodeId] = useState<string>("");

    const styles = useStyles();

    useEffect(() => {
        refreshDiagram();
        // const nodeId = selectedRecordName ? `$anon/.:0.0.0:${selectedRecordName}` : "";
        // if (nodeId !== selectedNodeId) {
        //     setSelectedNodeId(nodeId);
        // }
        // setFocusedNodeId("");
    }, [props]);

    useEffect(() => {
        if (diagramEngine.getCanvas()) {
            function handleEscapePress(event: KeyboardEvent) {
                if (event.key === "Escape" && selectedNodeId) {
                    setSelectedNodeId("");
                }
            }
            document.addEventListener("keydown", handleEscapePress);
        }
    }, [diagramModel, diagramEngine.getCanvas()]);

    const refreshDiagram = () => {
        // getPersistModel().then((response) => {
        //     const pkgModel: Map<string, ComponentModel> = new Map(Object.entries(response.persistERModel));
        //     const entities: Map<string, Entity> = new Map(Object.entries(pkgModel.get("entities") as any));
        //     setHasDiagnostics(response.diagnostics.length > 0);
        //     if (entities.size) {
        //         const model = modelMapper(entities);
        //         model.addLayer(new OverlayLayerModel());
        //         diagramEngine.setModel(model);
        //         pkgModel;
        //         setDiagramModel(model);
        //         autoDistribute(model);
        //     } else if (response.diagnostics.length && !diagramModel) {
        //         setUserMessage(ERRONEOUS_MODEL);
        //     } else if (!response.diagnostics?.length) {
        //         setDiagramModel(undefined);
        //         setUserMessage(NO_ENTITIES_DETECTED);
        //     }
        // });
    };

    const autoDistribute = (model: DiagramModel) => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });

            const overlayLayer = diagramEngine
                .getModel()
                .getLayers()
                .find((layer) => layer instanceof OverlayLayerModel);
            if (overlayLayer) {
                diagramEngine.getModel().removeLayer(overlayLayer);
            }
            diagramEngine.setModel(model);
        }, 30);
    };

    const switchCollapseMode = (shouldCollapse: boolean) => {
        setIsCollapsedMode(shouldCollapse);
        if (diagramModel) {
            autoDistribute(diagramModel);
        }
    };

    let ctx = {
        collapsedMode,
        selectedNodeId,
        setSelectedNodeId,
        setHasDiagnostics,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId("");
        }
    };

    return (
        <Container>
            <CellDiagramContext {...ctx}>
                <HeaderWidget collapsedMode={collapsedMode} setIsCollapsedMode={switchCollapseMode} />
                <DiagramContainer onClick={handleCanvasClick}>
                    {diagramEngine?.getModel() && diagramModel ? (
                        <>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramEngine}
                                className={styles.canvas}
                                focusedNode={diagramEngine?.getModel()?.getNode(focusedNodeId)}
                            />
                            <DiagramControls engine={diagramEngine} refreshDiagram={refreshDiagram} showProblemPanel={() => {}} />
                        </>
                    ) : userMessage ? (
                        <PromptScreen userMessage={userMessage} showProblemPanel={() => {}} />
                    ) : (
                        <CircularProgress sx={{ color: Colors.PRIMARY }} />
                    )}
                </DiagramContainer>
            </CellDiagramContext>
        </Container>
    );
}
