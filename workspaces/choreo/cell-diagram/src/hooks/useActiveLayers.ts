/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from "react";
import { DiagramLayer } from "../components/Controls/DiagramLayers";

export const useActiveLayers = () => {
    const [activeLayers, setActiveLayers] = useState<DiagramLayer[]>([DiagramLayer.ARCHITECTURE]);

    const addLayer = (layer: DiagramLayer) => {
        if (!activeLayers.includes(layer)) {
            setActiveLayers((prev) => [...prev, layer]);
        }
    };

    const removeLayer = (layer: DiagramLayer) => {
        if (activeLayers.includes(layer) && layer !== DiagramLayer.ARCHITECTURE) {
            setActiveLayers(activeLayers.filter((l) => l !== layer));
        }
    };

    const removeAllLayers = () => {
        setActiveLayers([DiagramLayer.ARCHITECTURE]);
    };

    const hasLayer = (layer: DiagramLayer) => {
        return activeLayers.includes(layer);
    };

    return { activeLayers, addLayer, removeLayer, removeAllLayers, hasLayer };
};
