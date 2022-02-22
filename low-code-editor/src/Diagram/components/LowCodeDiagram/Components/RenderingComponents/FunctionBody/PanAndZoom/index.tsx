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
import React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { useStyles } from "../../../../../../styles";
import FitToScreenSVG from "../../../../PanAndZoom/images/fit-to-screen";
import ZoomInSVG from "../../../../PanAndZoom/images/zoom-in";
import ZoomOutSVG from "../../../../PanAndZoom/images/zoom-out";

export default function PanAndZoom(props: any) {

    return (
        <TransformWrapper
            wheel={{ disabled: true }}
            doubleClick={{ disabled: true }}
            scale={1}
            positionX={34}
            options={{ limitToBounds: false, maxScale: 2, minScale: 0.6, centerContent: false }}
        >
            {({ zoomIn, zoomOut, resetTransform }: any) => (
                <React.Fragment>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <TransformComponent>
                            <div className={'design-container'}>
                                {props.children}
                            </div>
                        </TransformComponent>
                        <div style={{ display: 'flex', flexDirection: 'column' }} className="tools">
                            <div className={'zoom-control-wrapper'} onClick={zoomIn}>
                                <ZoomInSVG />
                            </div>
                            <div className={'zoom-control-wrapper'} onClick={zoomOut}>
                                <ZoomOutSVG />
                            </div>
                            <div className={'zoom-control-wrapper'} onClick={resetTransform}>
                                <FitToScreenSVG />
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )}
        </TransformWrapper>
    )

}
