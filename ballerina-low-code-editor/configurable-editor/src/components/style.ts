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
        accordian: {
            backgroundColor: "#e8e8e9",
            border: "solid",
            borderColor: "#d5d5d5",
            borderWidth: theme.spacing(0.1),
        },
        buttonBorder: {
            border: theme.spacing(1),
            borderColor: "#FF9494",
        },
        buttonConnections: {
            backgroundColor: "#f0f0f0",
            border: "solid",
            borderColor: "#e8e8e9",
            borderRadius: theme.spacing(0.3),
            borderWidth: theme.spacing(0.3),
            fill: "#5567D5",
            padding: theme.spacing(0.8),
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
        connectionField: {
            display: "flex",
            flexWrap: "wrap",
        },
        descriptionLabel: {
            display: "flex",
            marginBottom: theme.spacing(0.5),
            marginTop: theme.spacing(0.5),
        },
        descriptionLabelText: {
            color: "#3f51b5",
            fontSize: theme.spacing(1.4),
        },
        divider: {
            border: "0.1px solid #DEE0E7",
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
            fontSize: theme.typography.pxToRem(15),
            fontWeight: "bold",
        },
        innerBoxCard: {
            marginTop: theme.spacing(1),
        },
        innerBoxHead: {
            alignItems: "center",
            display: "flex",
            marginBottom: theme.spacing(1),
        },
        innerBoxTitle: {
            fontSize: theme.spacing(1.8),
        },
        labelCont: {
            marginTop: theme.spacing(0.5),
            width: "90%",
        },
        labelTag: {
            display: "flex",
        },
        mainLabel: {
            display: "flex",
            flexWrap: "wrap",
            marginBottom: theme.spacing(0.5),
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
            marginTop: theme.spacing(0.4),
        },
        menuItemStyle: {
            border: "solid",
            borderColor: "#d5d5d5",
            borderWidth: theme.spacing(0.1),
            paddingLeft: theme.spacing(2),
        },
        popOver: {
            overflow: "auto",
            padding: theme.spacing(3),
            position: "relative",
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
    }),
);
