/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { Box } from "@material-ui/core";

import { useStyles } from "./style";

interface ButtonContainerProps {
    marginTop?: number;
    justifyContent?: string;
    children: JSX.Element | (JSX.Element | false)[] | false;
    size?: "small" | "large";
}
const ButtonContainer = ({
    justifyContent,
    marginTop,
    children,
    size= "small",
}: ButtonContainerProps) => {
    const classes = useStyles();
    const btnGrid = React.Children.map(children, (element) => (
        <Box className={size === "small" ? classes.buttonContainerSmall : classes.buttonContainerLarge}>
            {element}
        </Box>
    ));
    return (
        <Box width="100%" mt={marginTop}>
            <Box
                display="flex"
                justifyContent={justifyContent}
                flexWrap="wrap"
                className={size === "small" ? classes.buttonGridSmall : classes.buttonGridLarge}
            >
                {btnGrid}
            </Box>
        </Box>
    );
};
export default ButtonContainer;
ButtonContainer.defaultProps = {
    justifyContent: "flex-start",
    marginTop: 5,
    size: "large",
};
