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
import { Colors, DiffIcon, LayersIcon, ObservationIcon } from "../../resources";

export const DiagramLayersPanel: React.FC<any> = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
    padding: 4px 8px;
    background-color: white;
    border: 1px solid ${Colors.LIGHT_GREY};
`;

export const MainButton: React.FC<any> = styled.div`
    border: 1px solid ${Colors.LIGHT_GREY};
    width: 68px;
    height: 68px;
    border-radius: 2px;
    color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.GREY)};
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    padding: 4px;
    cursor: pointer;
`;

export const LayerButton: React.FC<any> = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    cursor: pointer;
    color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.DEFAULT_TEXT)};
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    div {
        border: 1px solid ${(props) => (props.selected ? Colors.PRIMARY : Colors.LIGHT_GREY)};
        background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
        color: ${(props) => (props.selected ? Colors.PRIMARY : Colors.GREY)};
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
        diagramLayers: { addLayer, removeLayer, removeAllLayers, hasLayer },
    } = useDiagramContext();
    const [hover, setHover] = useState(false);
    const controlPanelRef = useRef(null);
    let timeoutId: NodeJS.Timeout | null = null;

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

    const toggleBetweenDiagramLayers = () => {
        if (hasLayer(DiagramLayer.OBSERVABILITY) && !hasLayer(DiagramLayer.DIFF)) {
            removeLayer(DiagramLayer.OBSERVABILITY);
            addLayer(DiagramLayer.DIFF);
        } else if (hasLayer(DiagramLayer.DIFF) && !hasLayer(DiagramLayer.OBSERVABILITY)) {
            addLayer(DiagramLayer.OBSERVABILITY);
        } else if (hasLayer(DiagramLayer.DIFF) && hasLayer(DiagramLayer.OBSERVABILITY)) {
            removeAllLayers();
        } else {
            addLayer(DiagramLayer.OBSERVABILITY);
        }
    };

    const handleMouseOver = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setHover(true);
    };

    const handleMouseOut = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            setHover(false);
        }, 1000);
    };

    return (
        <DiagramLayersPanel ref={controlPanelRef}>
            <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={toggleBetweenDiagramLayers}>
                <MainButton selected={hasLayer(DiagramLayer.OBSERVABILITY) || hasLayer(DiagramLayer.DIFF)}>
                    <LayersIcon styles={{ width: 24, height: 24 }} />
                </MainButton>
            </div>
            {hover && (
                <LayersPanel onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <LayerButton onClick={toggleObservabilityLayer} selected={hasLayer(DiagramLayer.OBSERVABILITY)}>
                        <LayerIcon>
                            <ObservationIcon styles={{ width: 24, height: 24 }} />
                        </LayerIcon>
                        Obs
                    </LayerButton>
                    <LayerButton onClick={toggleDiffLayer} selected={hasLayer(DiagramLayer.DIFF)}>
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
