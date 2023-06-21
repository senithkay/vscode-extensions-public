/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
            switch (tabValue) {
                case "Suggestions":
                    hint = "Ctrl+Shift+M";
                    break;
                case "Expressions":
                    hint = "Ctrl+Shift+,";
                    break;
                case "Libraries":
                    hint = "Ctrl+Shift+.";
                    break;
                case "Parameters":
                    hint = "Ctrl+Shift+/";
                    break;
            }

            tabs.push(
                <Tab
                    value={tabValue}
                    disableRipple={true}
                    label={(
                        <StatementEditorHint content={hint} >
                            <span>{tabValue}</span>
                        </StatementEditorHint>
                    )}
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
