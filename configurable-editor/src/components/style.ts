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
        formGroup: {
            marginBottom: theme.spacing(2),
        },
        formInputBox: {
            width: "100%",
        },
        innerBoxCard: {
            marginTop: theme.spacing(2),
        },
        innerBoxHead: {
            marginBottom: theme.spacing(1),
        },
        innerBoxTitle: {
            fontSize: theme.spacing(1.8),
        },
        labelCont: {
            marginBottom: theme.spacing(1),
        },
        labelTag: {
            display: "flex",
        },
        mainLabel: {
            display: "flex",
            marginBottom: theme.spacing(0.5),
        },
        mainLabelText: {
            color: "#1D2028",
            fontSize: theme.spacing(1.6),
        },
        descriptionLabel: {
            display: "flex",
            marginBottom: theme.spacing(0.5),
            marginTop: theme.spacing(0.5),
        },
        descriptionLabelText: {
            color: "#1D2028",
            fontSize: theme.spacing(1.4),
        },
        textInputRoot: {
            "& .MuiInputBase-root": {
                backgroundColor: "#ffffff",
            },
            "marginBottom": theme.spacing(2),
        },
    }),
);
