/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CSSProperties } from "react";
import { Colors } from "../../../resources";

export const portStyles: CSSProperties = {
    position: "absolute",
    height: "10px",
    width: "10px",
    backgroundColor: `${Colors.SURFACE}`,
    borderRadius: "50%",
    border: `2px solid ${Colors.OUTLINE_VARIANT}`,
    margin: "-6px 0",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

export const topPortStyles: CSSProperties = {
    ...portStyles,
    margin: "-6px 0",
    alignItems: "flex-start",
};

export const bottomPortStyles: CSSProperties = {
    ...portStyles,
    margin: "-6px 0",
    alignItems: "flex-end",
};

export const leftPortStyles: CSSProperties = {
    ...portStyles,
    margin: "0 -6px",
    justifyContent: "flex-start",
};

export const rightPortStyles: CSSProperties = {
    ...portStyles,
    margin: "0 -6px",
    justifyContent: "flex-end",
};
