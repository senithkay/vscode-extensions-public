/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React, { useEffect } from "react";

import { Checkbox, ClickAwayListener, FormControlLabel } from "@material-ui/core";

interface FilterProps {
    filterMap: any;
    updateFilterMap: (map: any) => void;
    handleFilterClose: () => void;
}

export function Filter(props: FilterProps) {
    const { filterMap, updateFilterMap, handleFilterClose } = props;
    const selectors: React.ReactElement[] = [];

    Object.keys(filterMap).forEach(key => {
        const handleOnToggle = (evt: any) => {
            evt.stopPropagation();
            filterMap[key] = !filterMap[key];
            updateFilterMap({ ...filterMap });
        }
        selectors.push(
            <FormControlLabel
                control={<Checkbox checked={filterMap[key]} onChange={handleOnToggle} />}
                label={key}
            />
        );
    })
    // filterMap.forEach(filter => {
    //     selectors.push(
    //         <input type="checkbox" id="vehicle1" name="vehicle1" value={filter.name} />
    //     );
    // })

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={handleFilterClose}
        >
            <div>
                {selectors}
            </div>
        </ClickAwayListener>
    )
}

