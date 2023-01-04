/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React  from "react";

import { IconButton } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";
import { TopLevelPlusIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { tooltipStyles } from "../../../DataMapper/Header/DataMapperHeader";

import { useStyles } from "./style";

export interface NewLetVarDeclPlusButtonProps {
    onAddNewVar: () => void;
}

export function NewLetVarDeclPlusButton(props: NewLetVarDeclPlusButtonProps) {
    const { onAddNewVar } = props;
    const overlayClasses = useStyles();
    const TooltipComponent = withStyles(tooltipStyles)(TooltipBase);
    return (
        <div className={overlayClasses.plusButton}>
            <TooltipComponent
                interactive={false}
                arrow={true}
                title={"Add new let variable here"}
            >
                <IconButton onClick={onAddNewVar}>
                    <TopLevelPlusIcon selected={undefined}/>
                </IconButton>
            </TooltipComponent>
        </div>
    );
}
