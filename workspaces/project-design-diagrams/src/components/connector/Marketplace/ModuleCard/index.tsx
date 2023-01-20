/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
