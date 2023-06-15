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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import styled from '@emotion/styled';

import { CanvasBackground } from '../resources';

export const useStyles = makeStyles(() =>
    createStyles({
        canvas: {
            backgroundImage: `url('${CanvasBackground}')`,
            backgroundRepeat: 'repeat',
            minHeight: 'calc(100vh - 50px)',
            minWidth: '100vw'
        }
    })
);

export const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    width: 100vw;
`;

export const DiagramContainer = styled.div`
    align-items: center;
    background-image: url(${CanvasBackground});
    display: flex;
    flex-direction: column;
    height: calc(100vh - 50px);
    justify-content: center;
    width: 100vw;
    svg:not(:root) {
        overflow: visible;
    }
`;
