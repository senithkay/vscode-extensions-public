/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
            addIcon: {
                color: "#5567D5",
                padding: "5px",
                textTransform: "none",
                justifyContent: "left",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "24px"
            },
            typeLabel: {
                marginLeft: "3px",
                verticalAlign: "middle",
                padding: "5px",
                minWidth: "100px",
                marginRight: "24px"
            },
            treeLabelPortSelected: {
                backgroundColor: '#DFE2FF',
            },
            valueLabel: {
                verticalAlign: "middle",
                padding: "5px",
            },
            treeLabelOutPort: {
                float: "right",
                width: 'fit-content',
                marginLeft: "auto",
                display: "flex",
                alignItems: "center"
            },
            treeLabelInPort: {
                float: "left",
                // marginRight: "5px",
                width: 'fit-content',
                display: "flex",
                alignItems: "center"
            },
            label: {
                width: "300px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "inline-block",
                textOverflow: "ellipsis",
                "&:hover": {
                    overflow: "visible"
                }
            },
            expandIcon: {
                color: theme.palette.common.black,
                height: "25px",
                width: "25px",
                marginLeft: "auto"
            },
            queryPortWrap: {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center'
            }
        }),
    { index: 1 }
);
