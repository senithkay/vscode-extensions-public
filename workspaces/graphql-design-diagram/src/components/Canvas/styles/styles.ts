/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import styled from "@emotion/styled";
import { createStyles, makeStyles } from "@material-ui/core/styles";

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
