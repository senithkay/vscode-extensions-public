/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
import { modelMapper, generateEngine } from "./utils";
import { DiagramControls, OverlayLayerModel, PromptScreen } from "./components";
import { ERRONEOUS_MODEL, NO_ENTITIES_DETECTED, dagreEngine, Colors } from "./resources";
import { Container, DiagramContainer, WorkerContainer, useStyles } from "./utils/CanvasStyles";

import "./resources/assets/font/fonts.css";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { Model } from "./types/types";
import { DefaultState } from "./components/PortLinking/DefaultState";

interface EggplantDiagramProps {
    model: Model;
}

export function EggplantDiagram(props: EggplantDiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const [userMessage, setUserMessage] = useState<string>(undefined);

    const styles = useStyles();

    useEffect(() => {
        refreshDiagram();
    }, [props]);

    const refreshDiagram = () => {
        if (model.nodes?.length > 0) {
            const updatedModel = modelMapper(model.nodes);
            updatedModel.addLayer(new OverlayLayerModel());
            diagramEngine.setModel(updatedModel);
            setDiagramModel(updatedModel);
            autoDistribute(updatedModel);
        } else if (!diagramModel) {
            setUserMessage(ERRONEOUS_MODEL);
        } else {
            setDiagramModel(undefined);
            setUserMessage(NO_ENTITIES_DETECTED);
        }
    };

    const autoDistribute = (model: DiagramModel) => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
            diagramEngine.getModel().removeLayer(
                diagramEngine
                    .getModel()
                    .getLayers()
                    .find((layer) => layer instanceof OverlayLayerModel)
            );
            diagramEngine.setModel(model);
            // Use this custom "DefaultState" instead of the actual default state we get with the engine
            diagramEngine.getStateMachine().pushState(new DefaultState());
        }, 30);
    };

    return (
        // <Container>
        //     <DiagramContainer>
        <WorkerContainer>
                {diagramEngine?.getModel() && diagramModel ? (
                    <>
                        <NavigationWrapperCanvasWidget
                            diagramEngine={diagramEngine}
                            className={styles.canvas}
                        />
                        <DiagramControls engine={diagramEngine} refreshDiagram={refreshDiagram} />
                    </>
                ) : userMessage ? (
                    <PromptScreen userMessage={userMessage} />
                ) : (
                    <CircularProgress sx={{ color: Colors.PRIMARY }} />
                )}
        </WorkerContainer>
        //     </DiagramContainer>
        // </Container>
    );
}
