/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { css } from "@emotion/css";
import { Colors } from "../../../../resources/constants";

export const useStyles = () => ({
    balModule: css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        height: '140px',
        border: `1px solid ${Colors.OUTLINE_VARIANT}`,
        backgroundColor: `${Colors.PRIMARY_CONTAINER}`,
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: `${Colors.PRIMARY_CONTAINER}`,
            border: `1px solid ${Colors.PRIMARY}`
        },
    }),
    balModuleName: css({
        fontSize: '13px',
        width: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 500,
        textAlign: 'center',
    }),
    orgName: css({
        fontSize: '13px',
        width: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
    }),
});

export default useStyles;
