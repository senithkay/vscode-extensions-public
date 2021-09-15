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
import React from 'react';

// tslint:disable-next-line: no-submodule-imports
import { Story } from '@storybook/react/types-6-0';

import { RecordFromJson, RecordFromJsonProps } from "./index";
import { Provider as DiagramProvider } from "../../../../../Contexts/Diagram";

export default {
    title: 'Low Code Editor/Form/Record/Record from JSON',
    component: RecordFromJson,
};

const initialState = {
    isMutationProgress: false,
    modifyDiagram: jest.fn()
}

const Template: Story<RecordFromJsonProps> = (args: RecordFromJsonProps) => (
    <DiagramProvider initialState={initialState} >
        <RecordFromJson {...args} />;
    </DiagramProvider>
);

export const RecordFromJSON = Template.bind({});
RecordFromJSON.args = {
    targetPosition: {
        line: 1,
        column: 1
    }
};
