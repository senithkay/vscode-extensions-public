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

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { useStatementEditorStyles } from "../styles";

interface TabPanelProps {
    values: string[]
    defaultValue: string
    onSelection: (value: string) => void
    docExpandClicked : boolean
    selectedTab: string
}

export default function TabPanel(props: TabPanelProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { values, defaultValue, onSelection, docExpandClicked, selectedTab } = props;
    const [value, setValue] = React.useState(defaultValue);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setValue(newValue);
        onSelection(newValue);
    };

    // React.useEffect(() => {
    //     if (docExpandClicked){
    //         setValue("Parameters");
    //     }
    // }, [docExpandClicked])

    // TODO : Fix issue with opening the correct tab when clicked on the other expression
    React.useEffect(() => {
        setValue(selectedTab);
    })


    const tabs: React.ReactNode[] = [];
    if (values) {
        values.forEach((tabValue) => {
            tabs.push(
                <Tab value={tabValue} label={tabValue} disableRipple={true}/>
            );
        });
    }

    return (
        <Tabs
            value={value}
            onChange={handleChange}
            className={statementEditorClasses.tabsPanelSe}
        >
            {tabs}
        </Tabs>
    );
}
