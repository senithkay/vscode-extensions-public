/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';
import Lottie from 'react-lottie';

import cn from "classnames";

import animationData from './data.json';
import './styles.scss'

export interface TextPreloaderVerticalProps {
    position: "relative" | "absolute" | "fixedMargin";
}

export function TextPreloaderVertical(props: TextPreloaderVerticalProps) {
    const { position } = props;

    let loaderPosition = (position === "relative") ?
        cn("TextVerticalPreloader-wrapper-relative") : cn("TextVerticalPreloader-wrapper-absolute");
    switch (position) {
        case "absolute":
            loaderPosition = "TextVerticalPreloader-wrapper-absolute";
            break;
        case "relative":
            loaderPosition = "TextVerticalPreloader-wrapper-absolute";
            break;
        case "fixedMargin":
            loaderPosition = "TextVerticalPreloader-wrapper-fixed-margin";
            break;
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className={loaderPosition}>
            <Lottie options={defaultOptions} height={`100%`} width={`100%`} />
        </div>
    );
}
