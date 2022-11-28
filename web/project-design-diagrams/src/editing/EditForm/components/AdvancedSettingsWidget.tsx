/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DiagramContext } from '../../../components/common';
import { TextInputWidget } from './TextInput';
import { ControlButton } from './ControlButtons';
import { ButtonColor, ComponentDetails, PackageNameRegex, PackageNameRules } from '../resources/constants';
import { AdvancedSettings, AdvancedControlsContainer, AdvancedControlsHeader, AdvancedHeaderTitle } from '../resources/styles';

interface AdvancedSettingsProps {
    component: ComponentDetails;
    visibility: boolean;
    changeVisibility: (status: boolean) => void;
    updatePackage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    selectDirectory: () => void;
}

export function AdvancedSettingsWidget(props: AdvancedSettingsProps) {
    const { component, visibility, changeVisibility, updatePackage, selectDirectory } = props;
    const { getProjectRoot } = useContext(DiagramContext);

    const [projectRoot, setProjectRoot] = useState<string>(undefined);

    useEffect(() => {
        async function getDefaultDirectory() {
            const projecRoot = await getProjectRoot();
            setProjectRoot(projecRoot);
        }
        getDefaultDirectory();
    }, [])

    return (
        <AdvancedSettings>
            <AdvancedControlsHeader>
                <AdvancedHeaderTitle>Advanced Settings</AdvancedHeaderTitle>

                <IconButton color='default' onClick={() => changeVisibility(!visibility)}>
                    {visibility ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </AdvancedControlsHeader>

            {visibility &&
                <>
                    <TextInputWidget
                        label={'Package Name'}
                        value={component.package}
                        required={false}
                        error={!PackageNameRegex.test(component.package)}
                        errorMessage={PackageNameRules}
                        onChange={updatePackage}
                    />

                    <TextInputWidget
                        label={'Directory'}
                        value={component.directory || projectRoot}
                        readonly={true}
                    />

                    <AdvancedControlsContainer>
                        <ControlButton
                            label={'Select'}
                            onClick={selectDirectory}
                            color={ButtonColor}
                            disabled={false}
                        />
                    </AdvancedControlsContainer>
                </>
            }
        </AdvancedSettings>
    );
}
