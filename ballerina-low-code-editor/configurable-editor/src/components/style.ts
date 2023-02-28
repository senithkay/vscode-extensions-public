/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        accordion: {
            alignItems: "center",
            backgroundColor: "#F7F8FB",
            border: "1px solid #d5d5d5",
            borderTopLeftRadius: theme.spacing(0.5),
            borderTopRightRadius: theme.spacing(0.5),
            display: "flex",
            gap: theme.spacing(1),
            padding: theme.spacing(0.8, 1.5, 0.8, 1),
        },
        accordionBox: {
            "&:last-child": {
                marginBottom: 0,
            },
            "marginBottom": theme.spacing(1),
        },
        buttonBorder: {
            border: theme.spacing(1),
            borderColor: "#FF9494",
        },
        buttonConnections: {
            backgroundColor: "#F7F8FB",
            border: "1px solid #E0E2E9",
            borderRadius: 5,
            padding: theme.spacing(1.2),
        },
        card: {
            boxShadow: "none",
            paddingTop: theme.spacing(0.1),
        },
        cardContent: {
            "&:last-child": {
                paddingBottom: theme.spacing(0.6),
                paddingTop: theme.spacing(0.1),
            },
        },
        cardMainHead: {
            borderBottom: `1px solid ${theme.palette.grey[100]}`,
            marginBottom: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
        connectionField: {
            display: "flex",
            flexGrow: 1,
            flexWrap: "wrap",
        },
        descriptionLabel: {
            color: theme.palette.primary.main,
            display: "flex",
            fontSize: theme.spacing(1.5),
            marginLeft: theme.spacing(1),
        },
        divider: {
            border: "1px solid #DEE0E7",
            marginBottom: theme.spacing(1),
        },
        docIcon: {
            marginLeft: theme.spacing(4.375),
        },
        formGroup: {
            marginBottom: theme.spacing(1),
        },
        formInputBox: {
            width: "100%",
        },
        heading: {
            fontSize: theme.typography.pxToRem(13),
            fontWeight: 500,
            margin: 0,
        },
        innerBoxCard: {
            marginBottom: theme.spacing(2),
        },
        innerBoxHead: {
            alignItems: "center",
            display: "flex",
            padding: theme.spacing(1, 1, 1, 2),
        },
        innerBoxTitle: {
            fontSize: theme.spacing(1.8),
        },
        itemText: {
            fontSize: theme.typography.pxToRem(13),
            fontWeight: 500,
        },
        labelCont: {},
        labelTag: {
            display: "flex",
        },
        mainLabel: {
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
        },
        mainLabelBorder: {
            border: "solid",
            borderColor: "#d5d5d5",
            borderWidth: theme.spacing(0.1),
            display: "flex",
            flexWrap: "wrap",
        },
        mainLabelText: {
            color: "#1D2028",
            fontSize: theme.spacing(1.6),
            marginRight: theme.spacing(1),
        },
        menuItem: {
            "&.Mui-selected": {
                backgroundColor: "#F0F1FB",
            },
            "&:hover": {
                backgroundColor: "#F0F1FB",
            },
            "border": "1px solid #d5d5d5",
            "borderTop": 0,
            "paddingLeft": theme.spacing(1),
            "paddingRight": theme.spacing(1),
        },
        popOver: {
            overflow: "auto",
            padding: theme.spacing(2),
            position: "relative",
            minWidth:theme.spacing(40)
        },
        textInputRoot: {
            "& .MuiInputBase-root": {
                backgroundColor: "#ffffff",
            },
            "marginBottom": theme.spacing(0),
        },
        unsupportedLabelText: {
            color: "#FF9494",
            fontSize: theme.spacing(1.4),
            marginBottom: theme.spacing(1),
        },
        valueInnerBoxHead: {
            alignItems: "center",
            display: "flex",
            padding: theme.spacing(0.4, 1, 0.4, 2),
        },
    }),
);
