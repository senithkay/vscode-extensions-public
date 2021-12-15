import React from "react";

import { Grid } from "@material-ui/core";
import { BallerinaModule } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { ModuleIcon } from "../../../../LowCodeDiagram/Components/RenderingComponents/Connector/ConnectorHeader/ModuleIcon";

import useStyles from "./style";

export interface ModuleCardProps {
    onSelectModule: (balModule: BallerinaModule) => void;
    module: BallerinaModule;
    columns?: number;
}

function ModuleCard(props: ModuleCardProps) {
    const classes = useStyles();
    const { module, columns, onSelectModule } = props;
    const moduleName = (module.displayAnnotation?.label || `${module.package?.name} / ${module.name}`).replace(/["']/g, "");
    const itemWidth = (columns === 2) ? 6 : 4;
    return (
        <Grid item={true} sm={itemWidth} alignItems="center">
            <div key={moduleName} onClick={onSelectModule.bind(this, module)} data-testid={moduleName.toLowerCase()}>
                <div className={classes.balModule}>
                    <div>
                        <ModuleIcon module={module} />
                    </div>
                    <div className={classes.balModuleName}>{moduleName}</div>
                    <div className={classes.orgName}>by {module.package.organization}</div>
                </div>
            </div>
        </Grid>
    );
}

export default ModuleCard;
