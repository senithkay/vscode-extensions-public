/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React  from "react";

import { IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";
import { TopLevelPlusIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { headerStyles } from "../Header/DataMapperHeader";

import { useStyles } from "./style";

export interface NewLetVarDeclPlusButtonProps {
    index: number;
    onAddNewVar: (index: number) => void;
}

export function NewLetVarDeclPlusButton(props: NewLetVarDeclPlusButtonProps) {
    const { index, onAddNewVar } = props;
    const overlayClasses = useStyles();
    const TooltipComponent = withStyles(headerStyles)(TooltipBase);

    const handleOnClick = () => {
        onAddNewVar(index);
    };

    return (
        <div className={overlayClasses.plusButton}>
            <TooltipComponent
                interactive={false}
                arrow={true}
                title={"Add new let variable here"}
            >
                <IconButton
                    onClick={handleOnClick}
                    data-testid={`add-local-variable-btn-${index}`}
                >
                    <TopLevelPlusIcon selected={undefined}/>
                </IconButton>
            </TooltipComponent>
        </div>
    );
}
