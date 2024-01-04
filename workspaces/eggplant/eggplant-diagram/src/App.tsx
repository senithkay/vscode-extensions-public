/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { debounce, set } from "lodash";
import { BodyWidget } from "./components/layout/BodyWidget";
import { Flow } from "./types";
import {
    addDiagramListener,
    generateDiagramModelFromFlowModel,
    generateEngine,
    loadDiagramZoomAndPosition,
    removeOverlay,
    saveDiagramZoomAndPosition,
} from "./utils";
import { OverlayLayerModel } from "./components/overlay";
import { DefaultLinkModel, DefaultNodeModel } from "./components/default";
import { DataMapperViewManager } from "./components/data-mapper/ViewManager";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000,
        cacheTime: 1000,
      },
    },
  });

interface EggplantAppProps {
    flowModel: Flow;
    onModelChange: (flowModel: Flow) => void;
}

export function EggplantApp(props: EggplantAppProps) {
    const { flowModel, onModelChange } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [selectedNode, setSelectedNode] = useState<DefaultNodeModel | null>(null);
    const [_selectedLink, setSelectedLink] = useState<DefaultLinkModel | null>(null);
    const [tnfFnPosition, setTnfFnPosition] = useState<NodePosition | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            drawDiagram();
        }
    }, [diagramEngine, flowModel]);

    const handleDiagramChange = (model: Flow) => {
        onModelChange(model);
        saveDiagramZoomAndPosition(diagramEngine.getModel());
    };

    const handleTnfFnPosition = (position: NodePosition) => {
        setTnfFnPosition(position);
        if (position === null) {
            setSelectedNode(null);
        }
    };

    const debouncedHandleDiagramChange = debounce(handleDiagramChange, 300);

    const drawDiagram = () => {
        const model = new DiagramModel();
        model.addLayer(new OverlayLayerModel());
        // generate diagram model
        generateDiagramModelFromFlowModel(model, flowModel);
        diagramEngine.setModel(model);
        addDiagramListener(diagramEngine, flowModel, debouncedHandleDiagramChange, setSelectedNode, setSelectedLink);
        setDiagramModel(model);
        loadDiagramZoomAndPosition(diagramEngine);
        // remove overlay
        removeOverlay(diagramEngine);
    };

    return (
        <>
            <QueryClientProvider client={queryClient}>
                {diagramEngine && diagramModel && (
                    <>
                        {!tnfFnPosition && (
                            <BodyWidget
                                engine={diagramEngine}
                                flowModel={flowModel}
                                onModelChange={handleDiagramChange}
                                selectedNode={selectedNode}
                                setSelectedNode={setSelectedNode}
                                openDataMapper={handleTnfFnPosition}
                            />     
                        )}
                        {tnfFnPosition && (
                            <DataMapperViewManager
                                filePath={flowModel.fileName}
                                fnLocation={tnfFnPosition}
                                onFnChange={handleTnfFnPosition}
                            />
                        )}
                    </>               
                )}
            </QueryClientProvider>
        </>
    );
}

export default EggplantApp;
