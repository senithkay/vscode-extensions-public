/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import styled from "@emotion/styled";
import { createStyles, makeStyles } from "@material-ui/core/styles";


// tslint:disable-next-line:no-var-requires
// const background = require('../../resources/assets/PatternBg.svg') as string;

export const Canvas = styled.div`
  position: relative;
  cursor: move;
  overflow: hidden;
  & > svg {
    overflow: visible;
  }
`;

export const useDiagramStyles = makeStyles(() =>
    createStyles({
        diagramContainer: {
            minWidth: '100%',
            padding: '15px',
            height: '100px'
        }
    }),
);

