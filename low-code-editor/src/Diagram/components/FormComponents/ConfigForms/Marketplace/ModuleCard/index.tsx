import React from "react";

import { Grid } from "@material-ui/core";
import { BallerinaModule } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { getConnectorIconSVG } from "../../../../Portals/utils";

import useStyles from "./style";

export interface ModuleCardProps {
    onSelectModule: (balModule: BallerinaModule) => void;
    module: BallerinaModule;
}

function ModuleCard(props: ModuleCardProps) {
    const classes = useStyles();
    const moduleName = (props.module.displayAnnotation?.label || `${props.module.package?.name} / ${props.module.name}`).replace(/["']/g, "");
    return (
        <Grid item={true} sm={6} alignItems="center">
            <div key={moduleName} onClick={props.onSelectModule.bind(this, props.module)} data-testid={moduleName.toLowerCase()}>
                <div className={classes.balModule}>
                    <div>{getConnectorIconSVG(props.module)}</div>
                    <div className={classes.balModuleName}>{moduleName}</div>
                    <div className={classes.orgName}>by {props.module.package.organization}</div>
                </div>
            </div>
        </Grid>
    );
}

export default ModuleCard;
