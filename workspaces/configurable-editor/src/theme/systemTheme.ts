/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { ThemeOptions } from '@material-ui/core';

import systemThemeJson from './theme.json';

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    custom: any;
    darkPalette: any;
  }
  interface ThemeOptions {
    custom?: any;
    darkPalette?: any;
  }
}

const systemTheme: ThemeOptions = systemThemeJson as ThemeOptions;

export default systemTheme;
