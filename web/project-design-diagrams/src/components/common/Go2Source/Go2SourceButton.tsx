/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import CodeIcon from '@mui/icons-material/Code';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { LineRange } from '../../../resources';

export function Go2SourceWidget(props: { lineRange: LineRange }) {
    const { lineRange } = props;
    const { go2source } = useContext(DiagramContext);

    const [isHovered, setIsHovered] = useState<boolean>(false);

    return (
        <CodeIcon
            onClick={() => go2source(lineRange)}
            onMouseOver={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: isHovered ? '#49ad63' : '',
                borderRadius: '50%',
                color: isHovered ? 'whitesmoke' : '#49ad63',
                cursor: 'pointer',
                fontSize: '18px'
            }}
        />
    );
}
