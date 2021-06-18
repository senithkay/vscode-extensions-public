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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import  { Grid, IconButton,  withStyles } from "@material-ui/core";
import TooltipBase from '@material-ui/core/Tooltip';
import { CopyToClipboard } from 'components/CopyToClipboard';

export const ERROR_LABEL_SVG_WIDTH_WITH_SHADOW = 65;
export const ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW = 31;
export const ERROR_LABEL_SVG_WIDTH = 59;
export const ERROR_LABEL_SVG_HEIGHT = 25;
export const ERROR_LABEL_SHADOW_OFFSET = ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW - ERROR_LABEL_SVG_HEIGHT;

export const tooltipStyles = {
    tooltip: {
        width : "666px",
        color: "#40404B",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 10px 0 rgba(0,0,0,0.22)",
        padding: "1rem",
        font: "Droid Sans Mono",
        fontSize: "12px",
        letterSpacing: 0,
        lineHeight: "20px",
    },
    arrow: {
        color: "#ffffff"
    }
};
const TooltipComponent = withStyles(tooltipStyles)(TooltipBase);

export function ConnectionErrorSVG(props: { x: number, y: number, text: string, errorMsg: string }) {
    const { text, errorMsg, ...xyProps } = props;


    const codeCopyBtn = (copy: any) => {
        const copyButtonClick = () => {
            copy(errorMsg);
        };
        return (
            <IconButton
                aria-label="test invoke URL"
                onClick={copyButtonClick}
                className={"copy"}
                disableRipple={true}
            >
                {<img src="/images/error-copy.svg" />}
            </IconButton>
        )
    };

    return (
        <svg {...xyProps} width={ERROR_LABEL_SVG_WIDTH_WITH_SHADOW} height={ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <filter
                    id="ConnectionErrorFilter"
                    x="0"
                    y="0"
                    width={ERROR_LABEL_SVG_WIDTH_WITH_SHADOW}
                    height={ERROR_LABEL_SVG_HEIGHT_WITH_SHADOW}
                    filterUnits="userSpaceOnUse"
                >
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feFlood floodColor="#8a92ab" floodOpacity="0.373" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="ErrorComplete">
                <TooltipComponent
                    title={
                        (
                        <Grid container={true} spacing={2} justify="flex-start" alignItems="flex-start">
                            <Grid item={true} xs={true} zeroMinWidth={true}>
                                {errorMsg}
                            </Grid>
                            <Grid item={true} >
                                <CopyToClipboard title={"Copied!"}>
                                    {({ copy }) => codeCopyBtn(copy)}
                                </CopyToClipboard>
                            </Grid>
                        </Grid>
                        )
                    }
                    placement="top-start"
                    arrow={true}
                    interactive={true}
                >

                    <g id="Error" transform="translate(3 2)">
                        <g transform="matrix(1, 0, 0, 1, -3, -2)" filter="url(#ConnectionErrorFilter)">
                            <rect
                                id="ErrorRect"
                                width={ERROR_LABEL_SVG_WIDTH}
                                height={ERROR_LABEL_SVG_HEIGHT}
                                rx="4"
                                transform="translate(3 2)"
                                fill="#ea4c4d"
                            />
                        </g>
                        <text
                            className="metrics-text"
                            id="Error_text"
                            transform="translate(30.5 16)"
                        >
                            <tspan x="0" y="0" textAnchor="middle">
                                {text}
                            </tspan>
                        </text>
                    </g>
                </TooltipComponent>
            </g>
        </svg>
    )
};
