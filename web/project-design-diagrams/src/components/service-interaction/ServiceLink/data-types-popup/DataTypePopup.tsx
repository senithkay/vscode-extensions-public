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

import React, { useContext } from 'react';
import { DiagramContext, NodeMenuWidget } from '../../../common';
import { Colors, Location, Parameter } from '../../../../resources';
import { mapUnionTypes } from '../link-utils';
import { Container, clickableType, defaultType, MenuButton } from './styles';

interface DataTypeProps {
    inputParams: Parameter[];
    returnType: string[];
    location: Location;
}

export function DataTypesPopup(props: DataTypeProps) {
    const { inputParams, location, returnType } = props;
    const { getTypeComposition } = useContext(DiagramContext);

    return (
        <Container>
            <div>
                <b>Input Types:</b>
                <ul>
                    {inputParams.length === 0 ? <li>None</li> :
                        inputParams.map((param, index) => {
                            let displayParam: Map<string[], boolean> = mapUnionTypes(param);

                            return (
                                <li key={index}>
                                    {Array.from(displayParam.entries()).map(([values, isClickable], key) => {
                                        return (
                                            <>
                                                {key != 0 && <> | </>}
                                                <p
                                                    style={isClickable ? clickableType : defaultType}
                                                    onClick={isClickable ? () => { getTypeComposition(values[1]) } : () => { }}
                                                >
                                                    {values[0].slice(values[0].lastIndexOf(':') + 1)}
                                                </p>
                                            </>
                                        )
                                    })}
                                </li>
                            )
                        })
                    }
                </ul>

                <b>Return Types:</b>
                <ul>
                    {returnType.length === 0 ? <li>None</li> :
                        returnType.map((returnType, index) => {
                            if (returnType) {
                                let paramName: string = returnType.slice(returnType.lastIndexOf(':') + 1);
                                let isClickable: boolean = returnType.includes(':');
                                if (paramName.endsWith('[]')) {
                                    returnType = returnType.slice(0, -2);
                                }

                                return (
                                    <li key={index}>
                                        <p
                                            style={isClickable ? clickableType : defaultType}
                                            onClick={isClickable ? () => { getTypeComposition(returnType) } : () => { }}
                                        >
                                            {paramName}
                                        </p>
                                    </li>
                                )
                            }
                        })
                    }
                </ul>
            </div>

            {location &&
                <MenuButton>
                    <NodeMenuWidget
                        background={Colors.SECONDARY}
                        location={location}
                    />
                </MenuButton>
            }
        </Container>
    );
}
