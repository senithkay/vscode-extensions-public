/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { CSSProperties } from "react";

export const useStyles = makeStyles(() =>
    createStyles({
        listItemText: {
            color: "#595959",
            "& .MuiListItemText-primary": {
                fontSize: 14,
                fontFamily: "GilmerRegular",
            },
        },
    })
);

export const DefaultTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '14px'
}

export const ContentTextProps: CSSProperties = {
    fontFamily: 'GilmerRegular',
    fontSize: '15px'
}

export const TitleTextProps: CSSProperties = {
    fontFamily: 'GilmerMedium',
    fontSize: '16px'
}
