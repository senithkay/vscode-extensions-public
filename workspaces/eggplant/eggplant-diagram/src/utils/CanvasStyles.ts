/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
            minWidth: '100%'
        }
    })
);

export const Container = styled.div`
    align-items: center;
    display: flex;
    height: 100vh;
    width: 100%;
`;

export const DiagramContainer = styled.div`
    align-items: center;
    background-image: url(${CanvasBackground});
    display: flex;
    flex-direction: column;
    height: calc(100vh - 50px);
    justify-content: center;
    width: 100%;
    svg:not(:root) {
        overflow: visible;
    }
`;

export const WorkerContainer: React.FC<any> = styled.div`
  height: 100vh;
  background-image: url('${CanvasBackground}');
  background-repeat: repeat;
  display: flex;
  font-family: 'GilmerRegular';

  > * {
    height: 100%;
    min-height: 100%;
    width: 100%;
  }
  svg:not(:root) {
    overflow: visible;
  }
`;

