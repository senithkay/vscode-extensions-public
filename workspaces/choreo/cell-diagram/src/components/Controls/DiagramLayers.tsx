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
import { Colors } from "../../resources";

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
    color: ${Colors.GREY};
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
        diagramLayers: { addLayer, removeLayer, hasLayer },
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
        if (hasLayer(DiagramLayer.OBSERVABILITY)) {
            removeLayer(DiagramLayer.OBSERVABILITY);
            addLayer(DiagramLayer.DIFF);
        } else if (hasLayer(DiagramLayer.DIFF)) {
            removeLayer(DiagramLayer.DIFF);
        } else {
            addLayer(DiagramLayer.OBSERVABILITY);
        }
    }

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
                <MainButton onClick={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M12 22A10 10 0 0 1 2 12A10 10 0 0 1 12 2c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.3 0-.5.2-.5.5c0 .1.1.2.1.3c.4.5.6 1.1.6 1.7c.1 1.4-1 2.5-2.4 2.5m0-18a8 8 0 0 0-8 8a8 8 0 0 0 8 8c.3 0 .5-.2.5-.5c0-.2-.1-.3-.1-.4c-.4-.5-.6-1-.6-1.6c0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7m-5.5 6c.8 0 1.5.7 1.5 1.5S7.3 13 6.5 13S5 12.3 5 11.5S5.7 10 6.5 10m3-4c.8 0 1.5.7 1.5 1.5S10.3 9 9.5 9S8 8.3 8 7.5S8.7 6 9.5 6m5 0c.8 0 1.5.7 1.5 1.5S15.3 9 14.5 9S13 8.3 13 7.5S13.7 6 14.5 6m3 4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5"
                        />
                    </svg>
                </MainButton>
            </div>
            {hover && (
                <LayersPanel onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <LayerButton onClick={toggleObservabilityLayer} selected={hasLayer(DiagramLayer.OBSERVABILITY)}>
                        <LayerIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M9.64 13.4C8.63 12.5 7.34 12.03 6 12v3l-4-4l4-4v3c1.67 0 3.3.57 4.63 1.59a7.97 7.97 0 0 0-.99 1.81M18 15v-3c-.5 0-4.5.16-4.95 4.2c1.56.55 2.38 2.27 1.83 3.83a3.006 3.006 0 0 1-3.83 1.83c-1.55-.56-2.38-2.27-1.83-3.83c.28-.86.98-1.53 1.83-1.83A6.748 6.748 0 0 1 18 10V7l4 4zm-5 4a1 1 0 0 0-1-1a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1m-2-7.88c.58-.66 1.25-1.23 2-1.69V5h3l-4-4l-4 4h3z"
                                />
                            </svg>
                        </LayerIcon>
                        Obs
                    </LayerButton>
                    <LayerButton onClick={toggleDiffLayer} selected={hasLayer(DiagramLayer.DIFF)}>
                        <LayerIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M20 22c1.11 0 2-.89 2-2v-2h-2v2h-2v2zm-4 0v-2h-3v2zm-5 0v-2H9v-2H7v2c0 1.11.89 2 2 2zm11-6v-3h-2v3zM9 16V9h7V3c0-1.11-.89-2-2-2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2zm-2-2H3V3h11v4H9c-1.11 0-2 .89-2 2zm15-3V9c0-1.11-.89-2-2-2h-2v2h2v2z"
                                />
                            </svg>
                        </LayerIcon>
                        Drift
                    </LayerButton>
                </LayersPanel>
            )}
        </DiagramLayersPanel>
    );
}
