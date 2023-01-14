/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
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
import AddLinkIcon from '@mui/icons-material/AddLink';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { Service } from '../../../../resources';

export function AddConnectorWidget(props: { service: Service }) {
    const { service } = props;
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const { setTargetService } = useContext(DiagramContext);

    return (
        <AddLinkIcon
            onClick={() => { setTargetService(service) }}
            onMouseOver={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: isHovered ? 'orange' : '',
                borderRadius: '50%',
                color: isHovered ? 'whitesmoke' : 'orange',
                cursor: 'pointer',
                fontSize: '22px',
                padding: '2px'
            }}
        />
    );
}
