/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import gsap from "gsap";
import { useDiagramContext } from "../DiagramContext/DiagramContext";
import { Colors, DiagramIcon, DiffIcon, LayersIcon, ObservationIcon } from "../../resources";

export const DiagramLayersPanel: React.FC<any> = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
    gap: 4px;
    position: absolute;
    bottom: 15px;
    left: 15px;
`;

export const LayersPanel: React.FC<any> = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 4px;
    background-color: ${Colors.SURFACE_BRIGHT};
    border: 1px solid ${Colors.SURFACE_DIM};
`;

export const MainButton: React.FC<any> = styled.div`
    border: 1px solid ${Colors.SURFACE_DIM};
    width: 34px;
    height: 34px;
    border-radius: 2px;
    color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.OUTLINE_VARIANT)};
    background-color: ${Colors.SURFACE_BRIGHT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    padding: 5px;
    cursor: pointer;
    &:active {
        background-color: ${Colors.SURFACE_DIM};
    }
`;

export const LayerButton: React.FC<any> = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    cursor: ${(props) => (props.clickable ? "pointer" : "not-allowed")};
    color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.ON_SURFACE_VARIANT)};
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    div {
        border: 1px solid ${(props) => (props.selected ? Colors.PRIMARY : Colors.SURFACE_DIM)};
        background-color: ${Colors.SURFACE};
        color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.OUTLINE_VARIANT)};
    }
    &:hover {
        color: ${Colors.PRIMARY};
    }
    &:hover div {
        border: 1px solid ${Colors.PRIMARY};
        color: ${Colors.PRIMARY};
    }
`;

export const LayerIcon: React.FC<any> = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    padding: 4px;
`;

export enum DiagramLayer {
    ARCHITECTURE = "architecture",
    OBSERVABILITY = "observability",
    DIFF = "diff",
}

interface DiagramLayersProps {
    animation?: boolean;
}

export function DiagramLayers(props: DiagramLayersProps) {
    const { animation = true } = props;
    const {
        diagramLayers: { addLayer, removeLayer, hasLayer, activeLayers },
    } = useDiagramContext();
    const [hover, setHover] = useState(false);
    const controlPanelRef = useRef(null);
    const canRemoveLayer = activeLayers.length > 1;

    useEffect(() => {
        if (animation) {
            gsap.fromTo(
                controlPanelRef.current,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                    delay: 1,
                }
            );
        }
    }, []);

    const toggleArchitectureLayer = () => {
        if (hasLayer(DiagramLayer.ARCHITECTURE)) {
            removeLayer(DiagramLayer.ARCHITECTURE);
        } else {
            addLayer(DiagramLayer.ARCHITECTURE);
        }
    };

    const toggleObservabilityLayer = () => {
        if (hasLayer(DiagramLayer.OBSERVABILITY)) {
            removeLayer(DiagramLayer.OBSERVABILITY);
        } else {
            addLayer(DiagramLayer.OBSERVABILITY);
        }
    };

    const toggleDiffLayer = () => {
        if (hasLayer(DiagramLayer.DIFF)) {
            removeLayer(DiagramLayer.DIFF);
        } else {
            addLayer(DiagramLayer.DIFF);
        }
    };

    const toggleDiagramLayerPanel = () => {
        setHover((prev) => !prev);
    };

    return (
        <DiagramLayersPanel ref={controlPanelRef}>
            <div onClick={toggleDiagramLayerPanel}>
                <MainButton selected={hasLayer(DiagramLayer.OBSERVABILITY) || hasLayer(DiagramLayer.DIFF)}>
                    <LayersIcon styles={{ width: 24, height: 24 }} />
                </MainButton>
            </div>
            {hover && (
                <LayersPanel>
                    <LayerButton
                        onClick={toggleArchitectureLayer}
                        selected={hasLayer(DiagramLayer.ARCHITECTURE)}
                        clickable={hasLayer(DiagramLayer.ARCHITECTURE) ? canRemoveLayer : true}
                    >
                        <LayerIcon>
                            <DiagramIcon styles={{ width: 24, height: 24 }} />
                        </LayerIcon>
                        Static
                    </LayerButton>
                    <LayerButton
                        onClick={toggleObservabilityLayer}
                        selected={hasLayer(DiagramLayer.OBSERVABILITY)}
                        clickable={hasLayer(DiagramLayer.OBSERVABILITY) ? canRemoveLayer : true}
                    >
                        <LayerIcon>
                            <ObservationIcon styles={{ width: 24, height: 24 }} />
                        </LayerIcon>
                        Obs
                    </LayerButton>
                    <LayerButton
                        onClick={toggleDiffLayer}
                        selected={hasLayer(DiagramLayer.DIFF)}
                        clickable={hasLayer(DiagramLayer.DIFF) ? canRemoveLayer : true}
                    >
                        <LayerIcon>
                            <DiffIcon styles={{ width: 24, height: 24 }} />
                        </LayerIcon>
                        Drift
                    </LayerButton>
                </LayersPanel>
            )}
        </DiagramLayersPanel>
    );
}
