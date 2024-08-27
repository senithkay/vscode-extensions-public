import React from "react";


import { ModuleIcon } from "@wso2-enterprise/ballerina-low-code-diagram";



import useStyles from "./style";
import { BallerinaConstruct } from "@wso2-enterprise/ballerina-core";
import { Grid, GridItem, Tooltip } from "@wso2-enterprise/ui-toolkit";

export interface ModuleCardProps {
    onSelectModule: (balModule: BallerinaConstruct) => void;
    module: BallerinaConstruct;
    columns?: number;
}
export const MAX_COLUMN_WIDTH = '155px';

function ModuleCard(this: any, props: ModuleCardProps) {
    const classes = useStyles();
    const { module, columns, onSelectModule } = props;
    const moduleName = (module.displayAnnotation?.label || `${module.package?.name} / ${module.name}`).replace(/["']/g, "");
    const itemWidth = (columns === 2) ? 6 : 4;
    return (
        // <GridItem
        //     key={moduleName}
        //     id={moduleName}

        //     onClick={onSelectModule.bind(this, module)}
        //     sx={{
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         whiteSpace: 'nowrap',
        //         display: 'flex',
        //         flexDirection: 'column',
        //         alignItems: 'center',
        //         justifyContent: 'center',
        //         boxSizing: 'border-box',
        //         height: '140px',
        //         width: '140px',
        //         border: '1px solid #E6E7EC',
        //         borderRadius: '10px',
        //         backgroundColor: '#FFFFFF',
        //         padding: '16px', // theme.spacing(2)
        //         cursor: 'pointer',
        //         '&:hover': {
        //             overflow: 'visible',
        //             transform: 'scaled(1.04, 1.04, 1)',
        //             border: '1px solid #5567D5',
        // }
        //     }}
        // >
                <div className={classes.balModule} style={{width: '140px'}} onClick={onSelectModule.bind(this, module) }>
                    <div>
                        <ModuleIcon module={module} scale={0.9}/>
                    </div>
                    <Tooltip content={`${module.package?.organization} / ${module.moduleName} : ${module.package?.version}`}>
                        <div className={classes.balModuleName}>{moduleName}</div>
                    </Tooltip>
                    <div className={classes.orgName}>by {module.package.organization}</div>
                </div>
        // </GridItem>
    );
}

export default ModuleCard;
