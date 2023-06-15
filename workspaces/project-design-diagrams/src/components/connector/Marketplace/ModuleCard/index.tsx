/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from "react";

import { Grid } from "@material-ui/core";
import { BallerinaConstruct } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import useStyles from "./style";
import ModuleIcon from '../ModuleIcon';

export interface ModuleCardProps {
    module: BallerinaConstruct;
    selected?: BallerinaConstruct;
    columns?: number;
    onSelectModule: (balModule: BallerinaConstruct) => void;
}

function ModuleCard(this: any, props: ModuleCardProps) {
    const classes = useStyles();
    const { module, selected, columns, onSelectModule } = props;
    const moduleName = (module.displayAnnotation?.label || `${module.package?.name} / ${module.name}`).replace(/["']/g, "");
    const itemWidth = columns === 2 ? 6 : 4;

    const handleOnSelect = () => {
        onSelectModule(module);
    }

    return (
        <Grid item={true} xs={itemWidth} alignItems="center">
            <div key={moduleName + module.id} onClick={handleOnSelect} data-testid={moduleName.toLowerCase()}>
                <div className={(selected && (selected.id == module.id)) ? classes.selectedBalModule : classes.balModule}>
                    <ModuleIcon module={module}/>
                    <div className={classes.balModuleName}>{moduleName}</div>
                    <div className={classes.orgName}>by {module.package.organization}</div>
                </div>
            </div>
        </Grid>
    );
}

export default ModuleCard;
