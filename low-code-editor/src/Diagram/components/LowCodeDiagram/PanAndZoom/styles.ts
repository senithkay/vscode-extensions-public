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
// tslint:disable: ordered-imports
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { zoomInSvg, zoomInHoverSvg, zoomOutSvg, zoomOutHoverSvg, fitToScreenSvg, fitToScreenHoverSvg } from "../../../../assets"

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "& .react-transform-component": {
                // fix for https://github.com/wso2-enterprise/choreo/issues/2224
                userSelect: 'auto'
            }
        },
        zoomControls: {
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: "40vh",
            right: 15,
            zIndex: 400
        },
        panelBtn: {
            zIndex: 100,
            padding: 0,
            minWidth: 0,
            boxShadow: "0 1px 1px 0 #CBCFDA",
            background: "transparent",
            display: "contents"
        },
        zoomIn: {
            height: 32,
            width: 32,
            borderRadius: 20,
            boxShadow: '0 1px 1px 0 #CBCFDA',
            backgroundColor: '#FFF',
            background: `url("${zoomInSvg}") no-repeat center, #FFF`,
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: `url("${zoomInHoverSvg}") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)`,
            }
        },
        zoomOut: {
            height: 32,
            width: 32,
            borderRadius: 20,
            boxShadow: '0 1px 1px 0 #CBCFDA',
            backgroundColor: '#FFF',
            background: `url("${zoomOutSvg}") no-repeat center, #FFF`,
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: `url("${zoomOutHoverSvg}") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)`,
            }
        },
        fitToScreen: {
            height: 32,
            width: 32,
            borderRadius: 20,
            backgroundColor: '#FFF',
            boxShadow: '0 1px 1px 0 #CBCFDA',
            background: `url("${fitToScreenSvg}") no-repeat center, #FFF`,
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: `url("${fitToScreenHoverSvg}") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)`,
            }
        },
        zoomControlWrapper: {
            height: 32,
            width: 32,
            borderRadius: 20,
            boxShadow: '0 1px 1px 0 #CBCFDA',
            background:  "#fff",
            marginTop: theme.spacing(0.5),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: "#f1f1f1",
            }
        }
    })
);
