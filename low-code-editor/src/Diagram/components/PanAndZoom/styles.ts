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

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        zoomControls: {
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 'calc(50% - 50px)',
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
            background: 'url("/images/zoom-in.svg") no-repeat center, #FFF',
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: 'url("/images/zoom-in-hover.svg") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)',
            }
        },
        zoomOut: {
            height: 32,
            width: 32,
            borderRadius: 20,
            boxShadow: '0 1px 1px 0 #CBCFDA',
            backgroundColor: '#FFF',
            background: 'url("/images/zoom-out.svg") no-repeat center, #FFF',
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: 'url("/images/zoom-out-hover.svg") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)',
            }
        },
        fitToScreen: {
            height: 32,
            width: 32,
            borderRadius: 20,
            backgroundColor: '#FFF',
            boxShadow: '0 1px 1px 0 #CBCFDA',
            background: 'url("/images/fit-to-screen.svg") no-repeat center, #FFF',
            marginTop: theme.spacing(0.5),
            '&:hover, &:focus': {
                boxShadow: "0 1px 2px 0 #CBCFDA",
                background: 'url("/images/fit-to-screen-hover.svg") no-repeat center, linear-gradient(180deg, #F7F8FB 0%, #FFFFFF 100%)',
            }
        }
    })
);
