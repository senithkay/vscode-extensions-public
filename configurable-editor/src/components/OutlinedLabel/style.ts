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
         chipRoot: {
             fontSize: theme.spacing(1.3),
             height: "auto",
             padding: theme.spacing(0.5),
             paddingBottom: theme.spacing(0.25),
             paddingTop: theme.spacing(0.25),
         },
         chiplabel: {
            lineHeight: "1.2em",
            paddingLeft: theme.spacing(0.25),
            paddingRight: theme.spacing(0.25),
        },
     }),
 );
