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
import { css } from '@emotion/css';

export const useStyles = () => ({
    valueLabel: css({
        verticalAlign: "middle",
        padding: "5px"
    }),
    typeLabel: css({
        marginLeft: "3px",
        verticalAlign: "middle",
        padding: "5px",
        minWidth: "100px",
        marginRight: "24px"
    }),
    boldedTypeLabel: css({
        fontWeight: 800,
        fontSize: "14px"
    }),
    treeLabelInPort: css({
        float: "left",
        width: 'fit-content',
        display: "flex",
        alignItems: "center"
    }),
    label: css({
        width: "300px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        display: "inline-block",
        textOverflow: "ellipsis",
        "&:hover": {
            overflow: "visible"
        }
    }),
    selectTypeWrap: css({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "inherit",
        padding: "10px",
        background: "var(--vscode-sideBar-background)",
        borderRadius: "4px"
    }),
    unionTypesList: css({
        columnGap: '5%',
        display: 'grid',
        gridTemplateColumns: '100%',
        width: 'inherit',
        "& .MuiListItem-root": {
            marginBottom: '8px',
            padding: '0 10px'
        }
    }),
    unionTypeListItem: css({
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...hoverColor1,
        ...activeColour
    }),
    unionTypeValue: css({
        color: "var(--vscode-foreground)",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }),
    loader: css({
        float: "right",
        marginLeft: "auto",
        marginRight: '3px',
        alignSelf: 'center'
    }),
    warningContainer: css({
        display: 'flex',
        alignItems: 'center'
    }),
    warningText: css({
        color:  'var(--vscode-errorForeground)',
        fontSize: '15px',
        fontFamily: 'Droid Sans Mono',
        fontWeight: 'normal'
    }),
    warningSymbol: css({
        fontSize: '16px',
        marginRight: '5px'
    })
});

const hoverColor1 = {
    '&:hover': {
        backgroundColor: 'var(--vscode-list-hoverBackground)',
    }
}

const activeColour = {
    '&:active': {
        backgroundColor: 'rgba(204,209,242,0.61)'
    },
}
