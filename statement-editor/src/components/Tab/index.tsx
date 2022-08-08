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
import React, { useEffect } from 'react';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { StatementEditorHint } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';

import { useStmtEditorHelperPanelStyles } from "../styles";

interface TabPanelProps {
    values: string[]
    defaultValue: string
    onSelection: (value: string) => void
    selectedTab: string
}

export default function TabPanel(props: TabPanelProps) {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { values, defaultValue, onSelection, selectedTab } = props;
    const [value, setValue] = React.useState(defaultValue);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setValue(newValue);
        onSelection(newValue);
    };

    useEffect(() => {
        setValue(selectedTab);
    }, [selectedTab])

    const tabs: React.ReactNode[] = [];
    if (values) {
        values.forEach((tabValue) => {

            let hint;
            switch(tabValue) {
                case "Suggestions":
                    hint = "Ctrl+Shift+S";
                  break;
                case "Expressions":
                    hint = "Ctrl+Shift+E";
                    break;
                case "Libraries":
                    hint = "Ctrl+Shift+L";
                    break;
                case "Parameters":
                    hint = "Ctrl+Shift+D";
                    break;
            }

            tabs.push(
                <Tab 
                    value={tabValue}
                    disableRipple={true}
                    label={
                        <StatementEditorHint content={hint} >
                            <span>{tabValue}</span>
                        </StatementEditorHint>
                    }
                />
            );
        });
    }

    return (
        <Tabs
            value={value}
            onChange={handleChange}
            className={stmtEditorHelperClasses.tabsPanelSe}
        >
            {tabs}
        </Tabs>
    );
}
