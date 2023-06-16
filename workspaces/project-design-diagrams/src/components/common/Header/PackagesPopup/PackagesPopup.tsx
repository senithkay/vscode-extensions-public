/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
