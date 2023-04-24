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

import React, { useContext, useState } from 'react';
import { CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DiagramContext } from '../../../common';
import { ServiceLinkMenu } from '../LinkMenuPanel/LinkMenuPanel';
import { mapUnionTypes } from '../link-utils';
import { Colors } from '../../../../resources';
import { Container, clickableType, defaultType, MenuButton } from './styles';
import { ServiceLinkModel } from '../ServiceLinkModel';

interface DataTypeProps {
    callingFunction: RemoteFunction | ResourceFunction;
    link: ServiceLinkModel;
}

export function DataTypesPopup(props: DataTypeProps) {
    const { callingFunction, link } = props;
    const { getTypeComposition, editingEnabled } = useContext(DiagramContext);

    const [position, setPosition] = useState({ x: undefined, y: undefined });
    const [anchorElement, setAnchorElement] = useState<SVGPathElement | HTMLDivElement>(null);

    const onMouseOver = (event: React.MouseEvent<SVGPathElement | HTMLDivElement>) => {
		setAnchorElement(event.currentTarget);
	}

	const onMouseLeave = () => {
		setAnchorElement(null);
	}

    return (
        <Container>
            <div>
                <b>Input Types:</b>
                <ul>
                    {callingFunction.parameters.length === 0 ? <li>None</li> :
                        callingFunction.parameters.map((param, index) => {
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
                    {callingFunction.returns.length === 0 ? <li>None</li> :
                        callingFunction.returns.map((returnType, index) => {
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

            {location && editingEnabled &&
                <>
                    <MenuButton>
                        <MoreVertIcon
                            cursor='pointer'
                            onClick={onMouseOver}
                            onMouseOver={(e: { pageX: number; pageY: number; }) => setPosition({ x: e.pageX, y: e.pageY })}
                            sx={{
                                backgroundColor: Colors.SECONDARY,
                                borderRadius: '30%',
                                fontSize: '18px',
                                margin: '0px',
                                position: 'absolute',
                                right: 2.5
                            }}
                        />
                    </MenuButton>

                    <ServiceLinkMenu
                        link={link}
                        anchorElement={anchorElement}
                        position={position}
                        onMouseLeave={onMouseLeave}
                        onMouseOver={onMouseOver}
                        isL2={true}
                    />
                </>
            }
        </Container>
    );
}
