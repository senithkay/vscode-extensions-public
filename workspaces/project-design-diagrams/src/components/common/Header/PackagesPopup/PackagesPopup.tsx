/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Popover from '@mui/material/Popover';
import { PackageLabel, PopupContainer } from '../styles/styles';
import './styles.css';

interface PopoverProps {
    anchorElement: HTMLButtonElement;
    closePopup: () => void;
    projectPackages: Map<string, boolean>;
    updateProjectPkgs: (packages: Map<string, boolean>) => void;
}

export function PackagesPopup(props: PopoverProps) {
    const { anchorElement, closePopup, projectPackages, updateProjectPkgs } = props;

    const open: boolean = Boolean(anchorElement);
    const allPackages: string[] = Array.from(projectPackages.keys());

    const updatePackages = (balPackage: string) => {
        const packages: Map<string, boolean> = new Map(projectPackages);
        packages.set(balPackage, !packages.get(balPackage));
        updateProjectPkgs(packages);
    }

    return (
        <Popover
            id='mouse-over-popover'
            open={open}
            anchorEl={anchorElement}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            onClose={closePopup}
            disableRestoreFocus
            PaperProps={{ onMouseLeave: closePopup }}
        >
            <PopupContainer>
                <FormGroup>
                    {allPackages.map((balPackage) => {
                        let isChecked: boolean = projectPackages.get(balPackage);
                        return (
                            <FormControlLabel
                                key={balPackage}
                                control={
                                    <Checkbox
                                        className={isChecked ? 'checked-box ' : 'unchecked-box'}
                                        checked={isChecked}
                                    />
                                }
                                label={<PackageLabel>{balPackage}</PackageLabel>}
                                onChange={() => { updatePackages(balPackage) }}
                            />
                        );
                    })}
                </FormGroup>
            </PopupContainer>
        </Popover>
    )
}
