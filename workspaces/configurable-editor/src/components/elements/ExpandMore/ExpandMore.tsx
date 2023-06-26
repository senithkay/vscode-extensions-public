/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { IconButton } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { useStyles } from "./style";

interface ExpandMoreProps {
    expand: boolean;
    onClick: () => void;
}
const ExpandMore = ({ expand, onClick }: ExpandMoreProps) => {
    const classes = useStyles();

    return (
        <IconButton
            className={!expand ? classes.expandMoreIcon : classes.expandLessIcon}
            aria-expanded={expand}
            onClick={onClick}
            size={"small"}
            data-cyid="expand-more"
        >
            <ExpandMoreIcon />
        </IconButton>
    );
};
export default ExpandMore;
ExpandMore.defaultProps = {
    expand: true,
};
