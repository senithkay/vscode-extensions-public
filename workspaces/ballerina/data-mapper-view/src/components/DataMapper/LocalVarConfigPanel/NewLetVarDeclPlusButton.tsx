/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React  from "react";

import { Button, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { TopLevelPlusIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStyles } from "./style";

export interface NewLetVarDeclPlusButtonProps {
    index: number;
    onAddNewVar: (index: number) => void;
}

export function NewLetVarDeclPlusButton(props: NewLetVarDeclPlusButtonProps) {
    const { index, onAddNewVar } = props;
    const overlayClasses = useStyles();

    const handleOnClick = () => {
        onAddNewVar(index);
    };

    return (
        <div className={overlayClasses.plusButton}>
            <Tooltip
                content={"Add new let variable here"}
            >
                <Button
                    appearance="icon"
                    onClick={handleOnClick}
                    data-testid={`add-local-variable-btn-${index}`}
                >
                    <TopLevelPlusIcon selected={undefined}/>
                </Button>
            </Tooltip>
        </div>
    );
}
