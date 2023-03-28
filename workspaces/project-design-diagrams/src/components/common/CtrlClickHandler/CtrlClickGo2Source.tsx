/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

import React, { Children, cloneElement, PropsWithChildren, ReactElement, useContext } from 'react';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { Location } from '../../../resources';

interface CtrlClickProps {
    location: Location;
}

export function CtrlClickGo2Source(props: PropsWithChildren<CtrlClickProps>) {
    const { location, children } = props;
    const { editingEnabled, editLayerAPI } = useContext(DiagramContext);

    const handleClick = (e: any) => {
        if (editingEnabled && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            editLayerAPI?.go2source(location);
        }
    };

    const mappedChildren = Children.map(children, (child) => {
        return cloneElement(child as ReactElement, {
            onClick: handleClick
        });
    });

    return (
        <>
            {mappedChildren}
        </>
    );
}
