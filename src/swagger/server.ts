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
import { Server } from 'http';
import { getPortPromise } from 'portfinder';

const host = '127.0.0.1';
let port: number;
let server: Server;

export class PreviewServer {
  /**
   * Create proxy server.
   * 
   * @returns Server port
   */
  async initiateServer(): Promise<number> {
    if (server && server.listening && port) {
      return port;
    }

    server = cors_proxy.createServer({
      originWhitelist: [], // Allow all origins
      requireHeader: ['origin', 'x-requested-with'],
      // removeHeaders: ['cookie', 'cookie2']
      setHeaders: { "Access-Control-Allow-Headers": "*" }

    });

    port = await getPortPromise({ port: 18000, stopPort: 20000 });
    server.listen(port, host, function () { });
    return port;
  }
}
