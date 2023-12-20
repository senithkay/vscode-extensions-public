/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { getDagreEngine } from "../../../utils";
import { Icon } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../../resources";

interface ControlProps {
    engine: DiagramEngine;
    refresh: () => void;
}

namespace S {
    export const IconButton = styled(Icon)``;

    export const ControlPanel: React.FC<any> = styled.div`
        bottom: 12px;
        left: 15px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        justify-content: space-between;
        position: absolute;
        width: 32px;
    `;
}

export function DiagramControls(props: ControlProps) {
    const { engine, refresh } = props;

    const rearrange = () => {
        const dagreEngine = getDagreEngine();
        dagreEngine.redistribute(engine.getModel());
        engine.repaintCanvas();
        zoomToFit();
        refresh();
    };

    const onZoom = (zoomIn: boolean) => {
        const delta: number = zoomIn ? +5 : -5;
        engine.getModel().setZoomLevel(engine.getModel().getZoomLevel() + delta);
        engine.repaintCanvas();
    };

    const zoomToFit = () => {
        if (engine.getCanvas()?.getBoundingClientRect) {
            engine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
        }
    };

    const zoomToActualSize = () => {
        engine.getModel().setZoomLevel(100);
        engine.repaintCanvas();
    };

    return (
        <S.ControlPanel>
            <S.IconButton
                name={"fullscreen"}
                onClick={zoomToFit}
                sx={{
                    height: "24px",
                    width: "28px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "20px",
                    border: `1px solid ${Colors.OUTLINE_VARIANT}`,
                    backgroundColor: Colors.SURFACE,
                    padding: "8px 4px 4px 4px",
                }}
            />
            <S.IconButton
                name={"magic"}
                onClick={rearrange}
                sx={{
                    height: "24px",
                    width: "28px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "20px",
                    border: `1px solid ${Colors.OUTLINE_VARIANT}`,
                    backgroundColor: Colors.SURFACE,
                    padding: "8px 4px 4px 4px",
                }}
            />
        </S.ControlPanel>
    );
}
