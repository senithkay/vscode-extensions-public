/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { css } from "@emotion/css";

export const useStyles = () => ({
    textArea: css({
        backgroundColor: "#F8F9FA",
        padding: "0.75rem",
        borderRadius: "5px",
        boxShadow: "inset 0 2px 2px 0 rgba(0,0,0,0.07), 0 0 1px 0 rgba(50,50,77,0.07)",
        boxSizing: "border-box",
        minHeight: 104,
        width: "100%",
        border: "1px solid #DEE0E7",
        fontFamily: "inherit",
        color: "#1D2028",
        lineHeight: "22px",
        "&::placeholder": {
            color: "#8D91A3",
            fontSize: 13,
            fontWeight: 100,
            marginTop: "0.5rem",
        },
    }),
});
