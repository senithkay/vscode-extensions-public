/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useState } from 'react';
import { CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-core';
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
