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
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Context } from "../../../../Context/diagram";
import { ViewMode } from "../../../../Context/types";

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

interface PanningEvent {
    positionX: number,
    positionY: number,
}

const MAX_ZOOM: number = 2;
const MIN_ZOOM: number = 0.6
const ZOOM_STEP: number = 0.1;

export default function PanAndZoom(props: React.PropsWithChildren<PanAndZoomProps>) {
    const { viewMode, toggleViewMode } = props;
    const diagramContext = useContext(Context);
    const { onDiagramDoubleClick } = diagramContext.props;
    const [zoomStatus, setZoomStatus] = useState(defaultZoomStatus);

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

    function onPanningStart() {
        document.body.style.cursor = 'grabbing';
    }

    function onPanningStop(e: PanningEvent) {
        document.body.style.cursor = 'default';
        const { positionX, positionY } = e;
        if ((zoomStatus.panX !== positionX) || (zoomStatus.panY !== positionY)) {
            setZoomStatus({
                ...zoomStatus,
                panX: positionX,
                panY: positionY
            });
        }

    }

    return (
        <TransformWrapper
            wheel={{ disabled: true }}
            doubleClick={{ disabled: true }}
            scale={zoomStatus.scale}
            positionX={zoomStatus.panX}
            positionY={zoomStatus.panY}
            options={{ limitToBounds: false, centerContent: false }}
            onPanningStart={onPanningStart}
            onPanningStop={onPanningStop}
        >
            <div className={'design-container-outer'}>
                <TransformComponent>
                    <div className={'design-container'} onDoubleClick={handleDoubleClick}>
                        {props.children}
                    </div>
                </TransformComponent>
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
        </TransformWrapper>
    )

}
