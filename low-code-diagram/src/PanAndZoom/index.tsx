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

import React, { useContext } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import classNames from "classnames";

import { Context as DiagramContext } from "../Context/diagram";

import FitToScreenSVG from "./images/fit-to-screen";
import ZoomInSVG from "./images/zoom-in";
import ZoomOutSVG from "./images/zoom-out";
import "./style.scss";

export interface PanAndZoomProps {
    children?: React.ReactElement | React.ReactElement[],
}

interface PanningEvent {
    positionX: number,
    positionY: number,
}

export default function PanAndZoom(props: PanAndZoomProps) {
    const diagramContext = useContext(DiagramContext);
    const { zoomStatus } = diagramContext.props;
    const zoomOut = diagramContext?.api?.panNZoom?.zoomOut;
    const zoomIn = diagramContext?.api?.panNZoom?.zoomIn;
    const fitToScreen = diagramContext?.api?.panNZoom?.fitToScreen;
    const pan = diagramContext?.api?.panNZoom?.pan;
    const showTooltip = diagramContext?.api?.edit?.showTooltip;

    const { scale, panX, panY } = zoomStatus || { scale: 1, panX: 34, panY: 23 }; // Find a better way to set zoomStatus

    const { children } = props;

    function onClickZoomIn() {
        zoomIn();
    }
    function onClickZoomOut() {
        zoomOut()
    }
    function onClickFitToScreen() {
        fitToScreen();
    }
    function onPanningStart() {
        document.body.style.cursor = 'grabbing';
    }

    function onPanningStop(e: PanningEvent) {
        document.body.style.cursor = 'default';
        const { positionX, positionY } = e;
        if ((zoomStatus.panX !== positionX) || (zoomStatus.panY !== positionY)) {
            pan(positionX, positionY);
        }
    }

    function onWheel(e: any) {
        if (e.currentTarget.classList.contains('pan-zoom-wrapper')) {
            if (e.ctrlKey) {
                // pinch zoom or ctrl + mouse wheel scroll detected
                // TODO: implement pinch to zoom
            } else {
                // Multiplication by 0.8, is to reduce sensitivity a little.
                pan(
                    zoomStatus.panX + -0.8 * e.deltaX,
                    zoomStatus.panY + -0.8 * e.deltaY,
                );
            }
        }
    }

    React.useEffect(() => {
        document.body.addEventListener("mousedown", onDrag, false);
        return function cleanup() {
            document.body.removeEventListener("mousedown", onDrag, false);
        };
    }, []);

    function onDrag(event: any) {
        // disable diagram scrolling
        const classList = (event?.target?.classList as DOMTokenList);
        if (event?.target?.nodeName === 'INPUT' || classList.contains('exp-editor')
            || classList.contains('view-line')) {
            event.stopPropagation();
            return;
        }
        let target = event?.target;
        const els = [];
        while (target) {
            els.unshift(target);
            target = target.parentNode;
        }
        for (const el of els) {
            if (el?.classList?.contains("exp-editor")) {
                event.stopPropagation();
                break;
            }
        }
    }

    const zoomInButton = (
        <div data-testid={"zoom-in-btn"} className={"zoomControlWrapper"}>
            <ZoomInSVG />
        </div>
    );
    const zoomOutButton = (
        <div data-testid={"zoom-out-btn"} className={"zoomControlWrapper"}>
            <ZoomOutSVG />
        </div>
    );
    const fitToScreenButton = (
        <div data-testid={"fit-to-screen-btn"} className={"zoomControlWrapper"} >
            <FitToScreenSVG />
        </div>
    );
    // TODO:Add new tooltip component to support this scenario
    // const zoomInTooltip = showTooltip ? showTooltip(zoomInButton, "heading-content", {
    //     content: "Zoom In",
    //     heading: ""
    // }, "left-start", true) : zoomInButton;

    // const zoomOutTooltip = showTooltip ? showTooltip(zoomOutButton, "heading-content", {
    //     content: "Zoom Out",
    //     heading: ""
    // }, "left-start", true) : zoomOutButton;

    // const fitToScreenTooltip = showTooltip ? showTooltip(fitToScreenButton, "heading-content", {
    //     content: "Fit to screen",
    //     heading: ""
    // }, "left-start", true) : fitToScreenButton;

    return (
        <div className={classNames("pan-zoom-wrapper", "pan-zoom-root")} onWheel={onWheel}>
            <TransformWrapper
                wheel={{ disabled: true }}
                doubleClick={{ disabled: true }}
                scale={scale}
                positionX={panX}
                positionY={panY}
                options={{ limitToBounds: false, maxScale: 2, minScale: 0.6, centerContent: false }}
                onPanningStart={onPanningStart}
                onPanningStop={onPanningStop}
            >
                <TransformComponent>
                    {children}
                </TransformComponent>

            </TransformWrapper>

            <div className={"zoomControls"}>
                <button className={"panelBtn"} onClick={onClickZoomIn}>
                    {zoomInButton}
                </button>
                <button className={"panelBtn"} onClick={onClickZoomOut}>
                    {zoomOutButton}
                </button>
                <button className={"panelBtn"} onClick={onClickFitToScreen}>
                    {fitToScreenButton}
                </button>
            </div>
        </div>
    );
};
