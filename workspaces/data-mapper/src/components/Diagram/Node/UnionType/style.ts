/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
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
            valueLabel: {
                verticalAlign: "middle",
                padding: "5px",
            },
            typeLabel: {
                marginLeft: "3px",
                verticalAlign: "middle",
                padding: "5px",
                minWidth: "100px",
                marginRight: "24px"
            },
            boldedTypeLabel: {
                fontFamily: "GilmerBold",
                fontSize: "14px",
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
            selectTypeWrap: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "inherit",
                padding: "10px",
                background: "#F7F8FB",
                borderRadius: "4px",
            },
            unionTypesList: {
                columnGap: '5%',
                display: 'grid',
                gridTemplateColumns: '100%',
                width: 'inherit',
                "& .MuiListItem-root": {
                    marginBottom: '8px',
                    padding: '0 10px'
                },
            },
            unionTypeListItem: {
                "& .MuiListItemText-root": {
                    margin: '0'
                },
                ...hoverColor1,
                ...activeColour
            },
            unionTypeValue: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            loader: {
                float: "right",
                marginLeft: "auto",
                marginRight: '3px',
                alignSelf: 'center'
            },
            warningText: {
                color:  '#e85454',
                display: 'flex',
                justifyContent: 'space-between'
            },
        }),
    { index: 1 }
);

const hoverColor1 = {
    '&:hover': {
        backgroundColor: '#F0F1FB',
    }
}

const activeColour = {
    '&:active': {
        backgroundColor: 'rgba(204,209,242,0.61)'
    },
}
