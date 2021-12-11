/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React from "react";

import { Box } from "@material-ui/core";

import { useStyles } from "./style";

interface ButtonContainerProps {
    marginTop?: number;
    justifyContent?: string;
    children: JSX.Element | Array<JSX.Element | false> | false;
    size?: "small" | "large";
}
const ButtonContainer = ({
    justifyContent,
    marginTop,
    children,
    size,
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
