/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React from "react";
import {connect} from "react-redux";

import {closeMultipleTabsOverlay, openMultipleTabsOverlay} from "store/actions";
import {PortalState} from "store/index";

import {DefaultConfig} from "../../visitors/default";
import {OverlayBackground} from "../OverlayBackground";
import {useStyles} from "../OverlayBackground/style";

import "./style.scss";

export interface MultipleTabNotificationProps {
    isMultipleTabsOpen: boolean,
    dispatchOpenMultipleTabsOverlay: () => void,
    dispatchCloseMultipleTabsOverlay: () => void,
    // x: number,
    // y: number
}

export function MultipleTabNotificationC(props: MultipleTabNotificationProps) {
    const {isMultipleTabsOpen, dispatchCloseMultipleTabsOverlay, dispatchOpenMultipleTabsOverlay} = props;
    const classes = useStyles();

    return (
        <><svg
            height={DefaultConfig.overlayBackground.height}
            width={DefaultConfig.overlayBackground.width}
            className={classes.confirmationOverlayBackground}
        />
        <div className="multiple-tabs-notification">
            <g>
                <tspan x={516} y={230}>
                    <text className="mtn-title">
                        An instance of this application is already open in another tab
                    </text>
                </tspan>
                <tspan>
                    <text className="mtn-text">
                        Please switch to the already open tab to continue
                    </text>
                </tspan>
            </g>
        </div>
            </>
    );
}

const mapStateToProps = ({appInfo}: PortalState) => {
    const {isMultipleTabsOpen} = appInfo;
    return {
        isMultipleTabsOpen
    }
};

const mapDispatchToProps = {
    dispatchOpenMultipleTabsOverlay: openMultipleTabsOverlay,
    dispatchCloseMultipleTabsOverlay: closeMultipleTabsOverlay
}

const MultipleTabNotification = connect(mapStateToProps, mapDispatchToProps)(MultipleTabNotificationC);

export default MultipleTabNotification;
