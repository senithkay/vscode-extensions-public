/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { promises as fs, createReadStream } from "fs";
import { basename, dirname, join, relative, sep } from "path";
import type { Readable } from "stream";
import { ChoreoComponentType, GitProvider, parseGitURL } from "@wso2-enterprise/choreo-core";
import * as byline from "byline";
import { type Disposable, type Event, EventEmitter, type ExtensionContext } from "vscode";
import { getLogger } from "../logger/logger";
import type { Branch, Remote } from "./api/git";
import { initGit } from "./main";
import { readLocalEndpointsConfig, readLocalProxyConfig } from "../utils";

export const isMacintosh = process.platform === "darwin";
export const isWindows = process.platform === "win32";

export function log(...args: any[]): void {
	console.log.apply(console, ["git:", ...args]);
}

export interface IDisposable {
	dispose(): void;
}

export function dispose<T extends IDisposable>(disposables: T[]): T[] {
	disposables.forEach((d) => d.dispose());
	return [];
}

export function toDisposable(dispose: () => void): IDisposable {
	return { dispose };
}

export function combinedDisposable(disposables: IDisposable[]): IDisposable {
	return toDisposable(() => dispose(disposables));
}

export const EmptyDisposable = toDisposable(() => null);

export function fireEvent<T>(event: Event<T>): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => event((_) => (listener as any).call(thisArgs), null, disposables);
}

export function mapEvent<I, O>(event: Event<I>, map: (i: I) => O): Event<O> {
	return (listener: (e: O) => any, thisArgs?: any, disposables?: Disposable[]) => event((i) => listener.call(thisArgs, map(i)), null, disposables);
}

export function filterEvent<T>(event: Event<T>, filter: (e: T) => boolean): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) =>
		event((e) => filter(e) && listener.call(thisArgs, e), null, disposables);
}

export function anyEvent<T>(...events: Event<T>[]): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => {
		const result = combinedDisposable(events.map((event) => event((i) => listener.call(thisArgs, i))));

		disposables?.push(result);

		return result;
	};
}

export function done<T>(promise: Promise<T>): Promise<void> {
	return promise.then<void>(() => undefined);
}

export function onceEvent<T>(event: Event<T>): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => {
		const result = event(
			(e) => {
				result.dispose();
				return listener.call(thisArgs, e);
			},
			null,
			disposables,
		);

		return result;
	};
}

export function debounceEvent<T>(event: Event<T>, delay: number): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => {
		let timer: NodeJS.Timeout;
		return event(
			(e) => {
				clearTimeout(timer);
				timer = setTimeout(() => listener.call(thisArgs, e), delay);
			},
			null,
			disposables,
		);
	};
}

export function eventToPromise<T>(event: Event<T>): Promise<T> {
	return new Promise<T>((c) => onceEvent(event)(c));
}

export function once(fn: (...args: any[]) => any): (...args: any[]) => any {
	const didRun = false;

	return (...args) => {
		if (didRun) {
			return;
		}

		return fn(...args);
	};
}

export function assign<T>(destination: T, ...sources: any[]): T {
	for (const source of sources) {
		Object.keys(source).forEach((key) => ((destination as any)[key] = source[key]));
	}

	return destination;
}

export function uniqBy<T>(arr: T[], fn: (el: T) => string): T[] {
	const seen = Object.create(null);

	return arr.filter((el) => {
		const key = fn(el);

		if (seen[key]) {
			return false;
		}

		seen[key] = true;
		return true;
	});
}

export function groupBy<T>(arr: T[], fn: (el: T) => string): { [key: string]: T[] } {
	return arr.reduce((result, el) => {
		const key = fn(el);
		result[key] = [...(result[key] || []), el];
		return result;
	}, Object.create(null));
}

export async function mkdirp(path: string, mode?: number): Promise<boolean> {
	const mkdir = async () => {
		try {
			await fs.mkdir(path, mode);
		} catch (err: any) {
			if (err.code === "EEXIST") {
				const stat = await fs.stat(path);

				if (stat.isDirectory()) {
					return;
				}

				throw new Error(`'${path}' exists and is not a directory.`);
			}

			throw err;
		}
	};

	// is root?
	if (path === dirname(path)) {
		return true;
	}

	try {
		await mkdir();
	} catch (err: any) {
		if (err.code !== "ENOENT") {
			throw err;
		}

		await mkdirp(dirname(path), mode);
		await mkdir();
	}

	return true;
}

export function uniqueFilter<T>(keyFn: (t: T) => string): (t: T) => boolean {
	const seen: { [key: string]: boolean } = Object.create(null);

	return (element) => {
		const key = keyFn(element);

		if (seen[key]) {
			return false;
		}

		seen[key] = true;
		return true;
	};
}

export function find<T>(array: T[], fn: (t: T) => boolean): T | undefined {
	let result: T | undefined = undefined;

	array.some((e) => {
		if (fn(e)) {
			result = e;
			return true;
		}

		return false;
	});

	return result;
}

export async function grep(filename: string, pattern: RegExp): Promise<boolean> {
	return new Promise<boolean>((c, e) => {
		const fileStream = createReadStream(filename, { encoding: "utf8" });
		const stream = byline(fileStream);
		stream.on("data", (line: string) => {
			if (pattern.test(line)) {
				fileStream.close();
				c(true);
			}
		});

		stream.on("error", e);
		stream.on("end", () => c(false));
	});
}

export function readBytes(stream: Readable, bytes: number): Promise<Buffer> {
	return new Promise<Buffer>((complete, error) => {
		let done = false;
		const buffer = Buffer.allocUnsafe(bytes);
		let bytesRead = 0;

		stream.on("data", (data: Buffer) => {
			const bytesToRead = Math.min(bytes - bytesRead, data.length);
			data.copy(buffer, bytesRead, 0, bytesToRead);
			bytesRead += bytesToRead;

			if (bytesRead === bytes) {
				(stream as any).destroy(); // Will trigger the close event eventually
			}
		});

		stream.on("error", (e: Error) => {
			if (!done) {
				done = true;
				error(e);
			}
		});

		stream.on("close", () => {
			if (!done) {
				done = true;
				complete(buffer.slice(0, bytesRead));
			}
		});
	});
}

export enum Encoding {
	UTF8 = "utf8",
	UTF16be = "utf16be",
	UTF16le = "utf16le",
}

export function detectUnicodeEncoding(buffer: Buffer): Encoding | null {
	if (buffer.length < 2) {
		return null;
	}

	const b0 = buffer.readUInt8(0);
	const b1 = buffer.readUInt8(1);

	if (b0 === 0xfe && b1 === 0xff) {
		return Encoding.UTF16be;
	}

	if (b0 === 0xff && b1 === 0xfe) {
		return Encoding.UTF16le;
	}

	if (buffer.length < 3) {
		return null;
	}

	const b2 = buffer.readUInt8(2);

	if (b0 === 0xef && b1 === 0xbb && b2 === 0xbf) {
		return Encoding.UTF8;
	}

	return null;
}

function normalizePath(path: string): string {
	// Windows & Mac are currently being handled
	// as case insensitive file systems in VS Code.
	if (isWindows || isMacintosh) {
		return path.toLowerCase();
	}

	return path;
}

export function isDescendant(parent: string, descendant: string): boolean {
	if (parent === descendant) {
		return true;
	}

	if (parent.charAt(parent.length - 1) !== sep) {
		parent += sep;
	}

	return normalizePath(descendant).startsWith(normalizePath(parent));
}

export function pathEquals(a: string, b: string): boolean {
	return normalizePath(a) === normalizePath(b);
}

/**
 * Given the `repository.root` compute the relative path while trying to preserve
 * the casing of the resource URI. The `repository.root` segment of the path can
 * have a casing mismatch if the folder/workspace is being opened with incorrect
 * casing.
 */
export function relativePath(from: string, to: string): string {
	// On Windows, there are cases in which `from` is a path that contains a trailing `\` character
	// (ex: C:\, \\server\folder\) due to the implementation of `path.normalize()`. This behavior is
	// by design as documented in https://github.com/nodejs/node/issues/1765.
	if (isWindows) {
		from = from.replace(/\\$/, "");
	}

	if (isDescendant(from, to) && from.length < to.length) {
		return to.substring(from.length + 1);
	}

	// Fallback to `path.relative`
	return relative(from, to);
}

export function* splitInChunks(array: string[], maxChunkLength: number): IterableIterator<string[]> {
	let current: string[] = [];
	let length = 0;

	for (const value of array) {
		let newLength = length + value.length;

		if (newLength > maxChunkLength && current.length > 0) {
			yield current;
			current = [];
			newLength = value.length;
		}

		current.push(value);
		length = newLength;
	}

	if (current.length > 0) {
		yield current;
	}
}

interface ILimitedTaskFactory<T> {
	factory: () => Promise<T>;
	c: (value: T | Promise<T>) => void;
	e: (error?: any) => void;
}

export class Limiter<T> {
	private runningPromises: number;
	private maxDegreeOfParalellism: number;
	private outstandingPromises: ILimitedTaskFactory<T>[];

	constructor(maxDegreeOfParalellism: number) {
		this.maxDegreeOfParalellism = maxDegreeOfParalellism;
		this.outstandingPromises = [];
		this.runningPromises = 0;
	}

	queue(factory: () => Promise<T>): Promise<T> {
		return new Promise<T>((c, e) => {
			this.outstandingPromises.push({ factory, c, e });
			this.consume();
		});
	}

	private consume(): void {
		while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
			const iLimitedTask = this.outstandingPromises.shift()!;
			this.runningPromises++;

			const promise = iLimitedTask.factory();
			promise.then(iLimitedTask.c, iLimitedTask.e);
			promise.then(
				() => this.consumed(),
				() => this.consumed(),
			);
		}
	}

	private consumed(): void {
		this.runningPromises--;

		if (this.outstandingPromises.length > 0) {
			this.consume();
		}
	}
}

type Completion<T> = { success: true; value: T } | { success: false; err: any };

export class PromiseSource<T> {
	private _onDidComplete = new EventEmitter<Completion<T>>();

	private _promise: Promise<T> | undefined;
	get promise(): Promise<T> {
		if (this._promise) {
			return this._promise;
		}

		return eventToPromise(this._onDidComplete.event).then((completion) => {
			if (completion.success) {
				return completion.value;
			}
			throw completion.err;
		});
	}

	resolve(value: T): void {
		if (!this._promise) {
			this._promise = Promise.resolve(value);
			this._onDidComplete.fire({ success: true, value });
		}
	}

	reject(err: any): void {
		if (!this._promise) {
			this._promise = Promise.reject(err);
			this._onDidComplete.fire({ success: false, err });
		}
	}
}

export namespace Versions {
	declare type VersionComparisonResult = -1 | 0 | 1;

	export interface Version {
		major: number;
		minor: number;
		patch: number;
		pre?: string;
	}

	export function compare(v1: string | Version, v2: string | Version): VersionComparisonResult {
		if (typeof v1 === "string") {
			v1 = fromString(v1);
		}
		if (typeof v2 === "string") {
			v2 = fromString(v2);
		}

		if (v1.major > v2.major) {
			return 1;
		}
		if (v1.major < v2.major) {
			return -1;
		}

		if (v1.minor > v2.minor) {
			return 1;
		}
		if (v1.minor < v2.minor) {
			return -1;
		}

		if (v1.patch > v2.patch) {
			return 1;
		}
		if (v1.patch < v2.patch) {
			return -1;
		}

		if (v1.pre === undefined && v2.pre !== undefined) {
			return 1;
		}
		if (v1.pre !== undefined && v2.pre === undefined) {
			return -1;
		}

		if (v1.pre !== undefined && v2.pre !== undefined) {
			return v1.pre.localeCompare(v2.pre) as VersionComparisonResult;
		}

		return 0;
	}

	export function from(major: string | number, minor: string | number, patch?: string | number, pre?: string): Version {
		return {
			major: typeof major === "string" ? Number.parseInt(major, 10) : major,
			minor: typeof minor === "string" ? Number.parseInt(minor, 10) : minor,
			patch: patch === undefined || patch === null ? 0 : typeof patch === "string" ? Number.parseInt(patch, 10) : patch,
			pre: pre,
		};
	}

	export function fromString(version: string): Version {
		const [ver, pre] = version.split("-");
		const [major, minor, patch] = ver.split(".");
		return from(major, minor, patch, pre);
	}
}

export const removeCredentialsFromGitURL = (gitURL: string): string => {
	if (gitURL.startsWith("git@")) {
		// ssh url
		const urlParts = gitURL.replace('git@', '').split(':');
		if (urlParts.length === 2) {
			const host = urlParts[0];
			const path = urlParts[1].replace(/\.git$/, '');
			const httpsUrl = new URL(`https://${host}/${path}`);
			return httpsUrl.toString();
		}
	} else {
		// http/https url
		try {
			const parsedUrl = new URL(gitURL);
			// If user info is present, remove it
			if (parsedUrl.username) {
				// Remove only the user info, keep the hostname
				parsedUrl.username = "";
				parsedUrl.password = "";
			}

			// Remove the .git suffix
			const redactedUrl = parsedUrl.toString().replace(/\.git$/, '');

			return redactedUrl;
		} catch (err) {
			throw err;
		}
	}
	throw new Error(`failed to parse git repository url:${gitURL}`);
};

export const getGitRemotes = async (context: ExtensionContext, directoryPath: string): Promise<Remote[]> => {
	const newGit = await initGit(context);
	const repoRootPath = await newGit?.getRepositoryRoot(directoryPath);
	const dotGit = await newGit?.getRepositoryDotGit(directoryPath);

	if (!repoRootPath || !dotGit) {
		return [];
	}

	const repo = newGit?.open(repoRootPath!, dotGit);
	const remotes = await repo?.getRemotes();
	return remotes!;
};

export const getGitHead = async (context: ExtensionContext, directoryPath: string): Promise<Branch | undefined> => {
	const newGit = await initGit(context);
	const repoRootPath = await newGit?.getRepositoryRoot(directoryPath);
	const dotGit = await newGit?.getRepositoryDotGit(directoryPath);

	if (!repoRootPath || !dotGit) {
		return undefined;
	}

	const repo = newGit?.open(repoRootPath!, dotGit);
	const head = await repo?.getHEADRef()
	return head;
};

export const getGitRoot = async (context: ExtensionContext, directoryPath: string): Promise<string | undefined> => {
	try {
		const newGit = await initGit(context);
		const repoRootPath = await newGit?.getRepositoryRoot(directoryPath);
		return repoRootPath;
	} catch (err) {
		getLogger().error("Invalid Git Directory", err);
		throw new Error("Not a Git directory");
	}
};

export const hasDirtyRepo = async (directoryPath: string, context: ExtensionContext): Promise<boolean> => {
	try{
		const git = await initGit(context);
		const repoRoot = await git?.getRepositoryRoot(directoryPath)
		if(repoRoot){
			const subPath = relative(repoRoot, directoryPath)
			if (git) {
				const gitRepo = git.open(repoRoot, { path: repoRoot });
				const status = await gitRepo.getStatus({ untrackedChanges: 'separate', subDirectory: subPath });
				const hasLocalChanges =  status.status.filter(item=>!item.path.endsWith('context.yaml')).length > 0;
				if(hasLocalChanges){
					return hasLocalChanges
				}

				const localCommits = await git.getUnPushedCommits(repoRoot, subPath || ".");
				return localCommits.length > 0;
			}
		}
		return false
	}catch{
		return false
	}
};

export const getConfigFileDrifts = async (type: string, gitUrl: string, branch: string, directoryPath: string, context: ExtensionContext): Promise<string[]> => {
	try{
		const fileNames = new Set<string>()
		const git = await initGit(context);
		const repoRoot = await git?.getRepositoryRoot(directoryPath)
		if(repoRoot){
			const subPath = relative(repoRoot, directoryPath)


			if(git){
				const gitRepo = git.open(repoRoot, { path: repoRoot });
				const status = await gitRepo.getStatus({ untrackedChanges: 'separate', subDirectory: subPath });

				status.status.forEach(item=>{
					if(item.path.endsWith('endpoints.yaml')){
						fileNames.add("endpoints.yaml")
					}else if(item.path.endsWith('component-config.yaml')){
						fileNames.add("component-config.yaml")
					}else if(item.path.endsWith('component.yaml')){
						fileNames.add("component.yaml")
					}

					if(type === ChoreoComponentType.Service){
						const eps = readLocalEndpointsConfig(directoryPath)
						eps.endpoints?.forEach(epItem=>{
							if(epItem.schemaFilePath && item.path.endsWith(epItem.schemaFilePath)){
								fileNames.add(epItem.schemaFilePath)
							}
						})
					}else if(type === ChoreoComponentType.ApiProxy){
						const proxyConfig = readLocalProxyConfig(directoryPath);
						if(proxyConfig?.proxy?.schemaFilePath && item.path.endsWith(proxyConfig?.proxy?.schemaFilePath)){
							fileNames.add(proxyConfig?.proxy?.schemaFilePath)
						}
						if(proxyConfig?.proxy?.docPath && item.path.endsWith(proxyConfig?.proxy?.docPath)){
							fileNames.add(proxyConfig?.proxy?.docPath)
						}
						if(proxyConfig?.proxy?.thumbnailPath && item.path.endsWith(proxyConfig?.proxy?.thumbnailPath)){
							fileNames.add(proxyConfig?.proxy?.thumbnailPath)
						}
					}	
				})
				if(fileNames.size){
					return Array.from(fileNames)
				}

				const remotes = await getGitRemotes(context, repoRoot)
				const matchingRemoteName = remotes.find(item=>{
					const parsed1 = parseGitURL(item.fetchUrl)
					const parsed2 = parseGitURL(gitUrl)
					if(parsed1 && parsed2){
						const [org, repoName] = parsed1;
						const [componentRepoOrg, componentRepoName] = parsed2
						return org === componentRepoOrg && repoName === componentRepoName
					}
				})?.name

				if (matchingRemoteName) {
					try{
						await gitRepo.fetch({ silent: true, remote: matchingRemoteName })
					}catch{
						// ignore error
					}
					const changes = await gitRepo.diffWith(`${matchingRemoteName}/${branch}`)
					const componentConfigYamlPath = join(directoryPath, '.choreo', 'component-config.yaml')
					const endpointsYamlPath = join(directoryPath, '.choreo', 'endpoints.yaml')
					const componentYamlPath = join(directoryPath, '.choreo', 'component.yaml')
					const configPaths = [componentYamlPath, componentConfigYamlPath, endpointsYamlPath];

					if(type === ChoreoComponentType.Service){
						const eps = readLocalEndpointsConfig(directoryPath)
						eps.endpoints?.forEach(epItem=>{
							if(epItem.schemaFilePath){
								configPaths.push(join(directoryPath, epItem.schemaFilePath))
							}
						})
					}else if(type === ChoreoComponentType.ApiProxy){
						const proxyConfig = readLocalProxyConfig(directoryPath);
						if(proxyConfig?.proxy?.schemaFilePath){
							configPaths.push(join(directoryPath, proxyConfig?.proxy?.schemaFilePath))
						}
						if(proxyConfig?.proxy?.docPath){
							configPaths.push(join(directoryPath, proxyConfig?.proxy?.docPath))
						}
						if(proxyConfig?.proxy?.thumbnailPath){
							configPaths.push(join(directoryPath, proxyConfig?.proxy?.thumbnailPath))
						}
					}	

					changes.forEach(item=>{
						if(configPaths.includes(item.uri.path)){
							fileNames.add(basename(item.uri.path))
						}
					})
					if(fileNames.size){
						return Array.from(fileNames)
					}
				}
			}
		}
		return Array.from(fileNames)
	}catch{
		return []
	}
};