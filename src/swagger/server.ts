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
import cors_proxy from 'cors-anywhere';

// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '127.0.0.1';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 18512;

export class PreviewServer {
  initiateServer() {
    cors_proxy.createServer({
      originWhitelist: [], // Allow all origins
      requireHeader: ['origin', 'x-requested-with'],
      // removeHeaders: ['cookie', 'cookie2']
      setHeaders: { "Access-Control-Allow-Headers": "*" }

    }).listen(port, host, function () { });
  }
}
