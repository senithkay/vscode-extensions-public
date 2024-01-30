/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams-core";

export const toSnakeCase = (str: string): string => {
    str = str.trim();
    return str.replace(/\s+/g, "_");
};

export const toTitleCase = (str: string): string => {
    str = str.trim();
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));
}

// save diagram zoom level and position to local storage
export const saveDiagramZoomAndPosition = (model: DiagramModel) => {
    const zoomLevel = model.getZoomLevel();
    const modelOffsetX = model.getOffsetX();
    const modelOffsetY = model.getOffsetY();

    // Store them in localStorage
    localStorage.setItem("zoomLevel", JSON.stringify(zoomLevel));
    localStorage.setItem("modelOffsetX", JSON.stringify(modelOffsetX));
    localStorage.setItem("modelOffsetY", JSON.stringify(modelOffsetY));
};

// load diagram zoom level and position from local storage
export const loadDiagramZoomAndPosition = (engine: DiagramEngine) => {
    const zoomLevel = JSON.parse(localStorage.getItem("zoomLevel") || "100");
    const modelOffsetX = JSON.parse(localStorage.getItem("modelOffsetX") || "0");
    const modelOffsetY = JSON.parse(localStorage.getItem("modelOffsetY") || "0");

    engine.getModel().setZoomLevel(zoomLevel);
    engine.getModel().setOffset(modelOffsetX, modelOffsetY);
};

// zoom to fit the canvas
export const fitDiagramToNodes = (engine: DiagramEngine) => {
    if (engine.getCanvas()?.getBoundingClientRect) {
        engine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
    }
    engine.repaintCanvas();
};
