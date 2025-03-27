// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from "fs";
import * as http from "http";

function fatal(err: any): void {
	console.error("Missing or invalid credentials.");
	console.error(err);
	process.exit(1);
}


export class IPCClient {
	private ipcHandlePath: string;

	constructor(private handlerName: string) {
		const ipcHandlePath = process.env.VSCODE_GIT_IPC_HANDLE;

		if (!ipcHandlePath) {
			throw new Error("Missing VSCODE_GIT_IPC_HANDLE");
		}

		this.ipcHandlePath = ipcHandlePath;
	}

	call(request: any): Promise<any> {
		const opts: http.RequestOptions = {
			socketPath: this.ipcHandlePath,
			path: `/${this.handlerName}`,
			method: "POST",
		};

		return new Promise((c, e) => {
			const req = http.request(opts, (res) => {
				if (res.statusCode !== 200) {
					return e(new Error(`Bad status code: ${res.statusCode}`));
				}

				const chunks: Buffer[] = [];
				res.on("data", (d) => chunks.push(d));
				res.on("end", () => c(JSON.parse(Buffer.concat(chunks).toString("utf8"))));
			});

			req.on("error", (err) => e(err));
			req.write(JSON.stringify(request));
			req.end();
		});
	}
}


function main(argv: string[]): void {
	if (!process.env.VSCODE_GIT_ASKPASS_PIPE) {
		return fatal("Missing pipe");
	}

	if (!process.env.VSCODE_GIT_ASKPASS_TYPE) {
		return fatal("Missing type");
	}

	if (process.env.VSCODE_GIT_ASKPASS_TYPE !== "https" && process.env.VSCODE_GIT_ASKPASS_TYPE !== "ssh") {
		return fatal(`Invalid type: ${process.env.VSCODE_GIT_ASKPASS_TYPE}`);
	}

	if (process.env.VSCODE_GIT_COMMAND === "fetch" && !!process.env.VSCODE_GIT_FETCH_SILENT) {
		return fatal("Skip silent fetch commands");
	}

	const output = process.env.VSCODE_GIT_ASKPASS_PIPE as string;
	const askpassType = process.env.VSCODE_GIT_ASKPASS_TYPE as "https" | "ssh";

	// HTTPS (username | password), SSH (passphrase | authenticity)
	const request = askpassType === "https" ? argv[2] : argv[3];

	let host: string | undefined;
	let file: string | undefined;
	let fingerprint: string | undefined;

	if (askpassType === "https") {
		host = argv[4].replace(/^["']+|["':]+$/g, "");
	}

	if (askpassType === "ssh") {
		if (/passphrase/i.test(request)) {
			// passphrase
			file = argv[6].replace(/^["']+|["':]+$/g, "");
		} else {
			// authenticity
			host = argv[6].replace(/^["']+|["':]+$/g, "");
			fingerprint = argv[15];
		}
	}

	const ipcClient = new IPCClient("askpass");
	ipcClient
		.call({ askpassType, request, host, file, fingerprint })
		.then((res) => {
			fs.writeFileSync(output, `${res}\n`);
			setTimeout(() => process.exit(0), 0);
		})
		.catch((err) => fatal(err));
}

main(process.argv);
