/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useState } from "react";

import { Context } from "../../../../Context/diagram";
import { ViewMode } from "../../../../Context/types";
import { FunctionHeader } from "../FunctionHeader/FunctionHeader";

import FitToScreenSVG from "./images/fit-to-screen";
import InteractionMode from "./images/interaction-mode";
import StatementMode from "./images/statement-mode";
import ZoomInSVG from "./images/zoom-in";
import ZoomOutSVG from "./images/zoom-out";


interface PanAndZoomProps {
    viewMode: ViewMode;
    toggleViewMode: () => void;
}

const defaultZoomStatus = {
    scale: 1,
    panX: 34,
    panY: 23,
};

const MAX_ZOOM: number = 2;
const MIN_ZOOM: number = 0.6
const ZOOM_STEP: number = 0.1;

export default function PanAndZoom(props: React.PropsWithChildren<PanAndZoomProps>) {
    const { viewMode, toggleViewMode } = props;
    const diagramContext = useContext(Context);
    const { onDiagramDoubleClick } = diagramContext.props;
    const [zoomStatus, setZoomStatus] = useState(defaultZoomStatus);
    const containerRef = React.useRef(null);

    function handleDoubleClick() {
        if (onDiagramDoubleClick) {
            onDiagramDoubleClick();
        }
    }

    const zoomIn = () => {
        setZoomStatus({
            ...zoomStatus,
            scale: zoomStatus.scale + ZOOM_STEP >= MAX_ZOOM ? MAX_ZOOM : zoomStatus.scale + ZOOM_STEP
        });
    }

    const zoomOut = () => {
        setZoomStatus({
            ...zoomStatus,
            scale: zoomStatus.scale - ZOOM_STEP <= MIN_ZOOM ? MIN_ZOOM : zoomStatus.scale - ZOOM_STEP
        });
    }

    const resetZoomStatus = () => {
        setZoomStatus(defaultZoomStatus)
    }

    const handleZoomAndPanWithWheel = (e: React.WheelEvent) => {
        if (e.metaKey || e.ctrlKey) {
            // zoom logic
            const delta = Math.sign(e.deltaY);
            if (delta === 1) {
                zoomOut();
            } else if (delta === -1) {
                zoomIn();
            }
        } else {
            // pan logic
            setZoomStatus({
                ...zoomStatus,
                panX: zoomStatus.panX + e.deltaX,
                panY: zoomStatus.panY + -e.deltaY,
            });
        }
    }

    return (
        <div className={'design-container-outer'} style={{ display: "flex", flexDirection: "column" }}>
            <FunctionHeader />
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                    style={{
                        position: "relative",
                        width: 'fit-content',
                        height: 'fit-content',
                        overflow: "hidden",
                        userSelect: "none",
                        margin: 0,
                        padding: 0,
                    }}
                    ref={containerRef}
                    onWheel={handleZoomAndPanWithWheel}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            width: 'fit-content',
                            height: 'fit-content',
                            margin: 0,
                            padding: 0,
                            transformOrigin: '0% 0%',
                            transform: `scale(${zoomStatus.scale}) translate(${zoomStatus.panX}px, ${zoomStatus.panY}px)`,
                            transition: 'transform 0.1s ease',
                        }}
                    >
                        <div className={'design-container'} onDoubleClick={handleDoubleClick}>
                            {props.children}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }} className="tools">
                    <div className={'zoom-control-wrapper'} onClick={toggleViewMode}>
                        {viewMode === ViewMode.STATEMENT ? <InteractionMode /> : <StatementMode />}
                    </div>
                    <div className={'zoom-control-wrapper'} onClick={zoomIn}>
                        <ZoomInSVG />
                    </div>
                    <div className={'zoom-control-wrapper'} onClick={zoomOut}>
                        <ZoomOutSVG />
                    </div>
                    <div className={'zoom-control-wrapper'} onClick={resetZoomStatus}>
                        <FitToScreenSVG />
                    </div>
                </div>
            </div>
        </div>
    )

}
