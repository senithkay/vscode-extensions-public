/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { AutoResizeTextArea } from './TextArea';

const meta: Meta<typeof AutoResizeTextArea> = {
    title: 'Auto Resize Text Area',
    component: AutoResizeTextArea,
};
export default meta;

type Story = StoryObj<typeof AutoResizeTextArea>;

export const Default: Story = {
    render: () => {
        const [value, setValue] = React.useState<string>('Hello ${world}Hello ${world}Hello ${world}Hello ${world}Hello ${world}Hello ${world}Hello ${world}Hello ${world}');
        return (
            <div style={{ width: '300px' }}>
                <AutoResizeTextArea
                    value={value}
                    growRange={{ start: 1, offset: 5 }}
                    onChange={e => setValue(e.target.value)}
                />
            </div>
        );
    },
};
