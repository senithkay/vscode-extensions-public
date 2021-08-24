/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { useStyles } from './style';

interface FormAccordionProps {
    title?: string;
    depth?: number;
    mandatoryFields?: React.ReactNode[];
    optionalFields?: React.ReactNode[];
    isMandatory?: boolean;
}

export default function FormAccordion(props: FormAccordionProps) {
    const { title, depth, mandatoryFields, optionalFields, isMandatory } = props;
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState<string | false>('mandatory');

    const isEmptyMandatoryFields = mandatoryFields?.length === 0;
    const isEmptyOptionalFields = optionalFields?.length === 0;

    const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div className={classes.accordionWrapper}>
            {!isEmptyMandatoryFields && isEmptyOptionalFields && (
                <div className={classes.groupedForm}>
                    {...mandatoryFields}
                </div >
            )}
            {!isEmptyMandatoryFields && !isEmptyOptionalFields && (
                <ExpansionPanel TransitionProps={{ mountOnEnter: true }} className={depth > 1 ? classes.activeAccordionRoot : classes.activeAccordionRootFirst} expanded={true}>
                    {title && (
                        <ExpansionPanelSummary
                            className={depth > 1 ? classes.accordionSummary : classes.accordionSummaryFirst}
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography className={classes.accordionHeading}>{title}</Typography>
                            <Typography className={classes.accordionSecondaryRedHeading}>*</Typography>
                        </ExpansionPanelSummary>
                    )}
                    <ExpansionPanelDetails className={depth > 1 ? classes.accordionDetails : classes.accordionDetailsFirst}>
                        <div className={classes.groupedForm}>
                            {...mandatoryFields}
                        </div >
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
            {!isEmptyOptionalFields && (
                <ExpansionPanel TransitionProps={{ mountOnEnter: true }} className={depth > 1 ? classes.accordionRoot : classes.accordionRootFirst} expanded={(isMandatory && isEmptyMandatoryFields) || expanded === 'optional'} onChange={handleChange('optional')}>
                    <ExpansionPanelSummary
                        className={depth > 1 ? classes.accordionSummary : classes.accordionSummaryFirst}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        {title && isEmptyMandatoryFields && (<Typography className={classes.accordionHeading}>{title}</Typography>)}
                        {title !== "optional" && !isMandatory && <Typography className={classes.accordionSecondaryHeading}>&nbsp; Optional</Typography>}
                        {title !== "optional" && isMandatory && <Typography className={classes.accordionSecondaryRedHeading}>*</Typography>}
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={depth > 1 ? classes.accordionDetails : classes.accordionDetailsFirst}>
                        <div className={classes.groupedForm}>
                            {...optionalFields}
                        </div >
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            )}
        </div>
    );
}
