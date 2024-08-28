import { ExtensionContext } from "vscode";
interface FileObject {
    fileName: string;
    fileContent: string;
}
interface ImageObject {
    imageName: string;
    imageBase64: string;
}
interface PromptObject {
    aiPrompt: string;
    files: FileObject[];
    images: ImageObject[];
}
export declare class MIExtensionContext {
    context: ExtensionContext;
    webviewReveal: boolean;
    initialPrompt?: PromptObject;
    preserveActivity: boolean;
    isServerStarted: boolean;
}
export declare const extension: MIExtensionContext;
export {};
