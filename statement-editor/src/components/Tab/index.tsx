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
import React from 'react';

import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core";
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

interface StyledTabProps {
    label: string;
    value: string;
}

interface TabPanelProps {
    values: string[]
    defaultValue: string
    onSelection: (value: string) => void
}

const StyledTab = withStyles((theme: Theme) =>
    createStyles({
        root: {
            textTransform: 'none'
        },
    }),
)((props: StyledTabProps) => <Tab {...props} />);

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        autoCapitalization: false
    },
});

export default function TabPanel(props: TabPanelProps) {
    const { values, defaultValue, onSelection } = props;
    const classes = useStyles();
    const [value, setValue] = React.useState(defaultValue);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setValue(newValue);
        onSelection(newValue);
    };

    const tabs: React.ReactNode[] = [];
    if (values) {
        values.forEach((tabValue) => {
            tabs.push(
                <StyledTab value={tabValue} label={tabValue} />
            );
        });
    }

    return (
        <Paper className={classes.root}>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
            >
                {tabs}
            </Tabs>
        </Paper>
    );
}
