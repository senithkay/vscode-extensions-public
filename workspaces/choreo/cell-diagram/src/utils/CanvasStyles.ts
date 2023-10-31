/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createStyles, makeStyles } from "@material-ui/core/styles";
import styled from "@emotion/styled";

import { CanvasBackground, MAIN_CELL } from "../resources";

export const useStyles = makeStyles(() =>
    createStyles({
        canvas: {
            backgroundImage: `url('${CanvasBackground}')`,
            backgroundRepeat: "repeat",
            height: "100%",
            width: "100%",
        },
    })
);

export const Container = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-family: "GilmerRegular";
`;

export const DiagramContainer = styled.div`
    background-image: url(${CanvasBackground});
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 28px 20px;
    svg:not(:root) {
        overflow: visible;
    }
    [data-nodeid="${MAIN_CELL}"] {
        pointer-events: none;
    }
`;
