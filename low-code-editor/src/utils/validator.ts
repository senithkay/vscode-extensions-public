import { FormField } from "../ConfigurationSpec/types";
import { Resource } from "../Diagram/components/LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/types";
import {
    convertReturnTypeStringToSegments,
    returnTypes
} from "../Diagram/components/LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/util";
import { keywords } from "../Diagram/components/Portals/utils/constants";

export function validatePath(text: string) {
    if (text !== "") {
        let isPathValid = true;
        const isQueryParamValid = true;

        if ((text.match(/\[/g)?.length !== text.match(/\]/g)?.length) ||
            (text.charAt(text.length - 1) === "/")) {
            return false;
        }

        const seperateQueryParams = text.split("?");
        if (seperateQueryParams.length > 2) {
            return false;
        }

        if (seperateQueryParams[0]) {
            let paths = seperateQueryParams[0];
            const splitPath = paths.split("/");
            for (const word of splitPath) {
                if (keywords.includes(word) && !word.includes("'")) {
                    return false;
                }
            }

            if (paths.includes("[") && paths.includes("]")) {
                if (paths.match(/\/\d/g)) return false;
                const paramArray = (paths.match(/\[([^\[\]]*)\]/g));
                const arrayLength = paramArray.length;
                for (let i = 0; i < arrayLength; i++) {
                    const splitString = paramArray[i].split(" ")
                    if (!keywords.includes(splitString[0].slice(1)) || keywords.includes(splitString[1].slice(0, -1)) || (splitString[1].slice(0, -1) === "")) {
                        return false;
                    }
                    paths = paths.replace(paramArray[i], "")
                }
                isPathValid = paths === "" ? true : ((/^['a-zA-Z0-9\/\[\].]+$/g.test(paths)) && (!/^\d/g.test(paths)));
            } else if (paths.includes("/") && paths.includes("{") && paths.includes("}")) {
                if (paths.match(/\/\d/g)) return false;
                const paramArray = (paths.match(/\{([^\[\]]*)\}/g));
                const arrayLength = paramArray.length;
                for (let i = 0; i < arrayLength; i++) {
                    const splitString = paramArray[i];
                    if (keywords.includes(splitString.slice(1)) || (splitString.slice(1) === "")) {
                        return false;
                    }
                    paths = paths.replace(paramArray[i], "")
                }
                isPathValid = ((/^[a-zA-Z0-9\/\{\}.]+$/g.test(paths)) && (!/^\d/g.test(paths)))
            } else if (!paths.includes("/") && ((paths.includes("[") && paths.includes("]")) || (paths.includes("{") && paths.includes("}")))) {
                return false;
            } else if (paths === "[]" || paths === "{}") {
                return false;
            } else if (paths.match(/\/\d/g)) {
                return false;
            } else {
                isPathValid = ((/^['a-zA-Z0-9\/\[\]\{\}]+$/g.test(paths)) && (!/^\d/g.test(paths)));
            }
        }

        if (seperateQueryParams[1]) {

            const queryParams: string = seperateQueryParams[1];
            const splitedQueryParams: string[] = queryParams.split("&");
            for (const queryParam of splitedQueryParams) {
                if (queryParam.includes("=")) {
                    const splittedQueryParam: string[] = queryParam.split("=");
                    if (keywords.includes(splittedQueryParam[0])) {
                        return false;
                    } else if (splittedQueryParam[0] === "") {
                        return false;
                    } else if (splittedQueryParam[0].match(/\/\d/g)) {
                        return false;
                    } else if (!(/^[a-zA-Z0-9]+$/g.test(splittedQueryParam[0]))) {
                        return false;
                    }

                    if (splittedQueryParam[1].startsWith("[") && splittedQueryParam[1].endsWith("]")) {
                        if (splittedQueryParam[1].match(/\/\d/g)) return false;
                        const splitString = splittedQueryParam[1].split(" ")
                        if (!keywords.includes(splitString[0].slice(1)) || keywords.includes(splitString[1].slice(0, -1)) || (splitString[1].slice(0, -1) === "")) {
                            return false;
                        }
                    } else if (splittedQueryParam[1].startsWith("{") && splittedQueryParam[1].endsWith("}")) {
                        if (splittedQueryParam[1].match(/\/\d/g)) return false;
                        const splitString = splittedQueryParam[1].replace("{", "").replace("}", "");
                        if (keywords.includes(splitString) || splitString === "" || splitString.includes(" ")) {
                            return false;
                        }
                    } else if (splittedQueryParam[1].startsWith("[") && !splitedQueryParams[1].endsWith("]")) {
                        return false;
                    } else if (!splittedQueryParam[1].startsWith("[") && splitedQueryParams[1].endsWith("]")) {
                        return false;
                    } else if (!splittedQueryParam[1].startsWith("[") && !splitedQueryParams[1].endsWith("]")) {
                        return false;
                    } else if (splittedQueryParam[1].startsWith("{") && !splitedQueryParams[1].endsWith("}")) {
                        return false;
                    } else if (!splittedQueryParam[1].startsWith("{") && splitedQueryParams[1].endsWith("}")) {
                        return false;
                    } else if (!splittedQueryParam[1].startsWith("{") && !splitedQueryParams[1].endsWith("}")) {
                        return false;
                    } else if (splittedQueryParam[1] === "" || splittedQueryParam[1] === "[]" || splittedQueryParam[1] === "{}") {
                        return false;
                    } else if (splittedQueryParam[1].match(/\/\d/g)) {
                        return false;
                    }
                } else if (keywords.includes(queryParam) || queryParam.match(/\/\d/g) || queryParam === "" || (/^[a-zA-Z0-9]+$/g.test(queryParam))) {
                    return false;
                }
            }
        }

        return isPathValid && isQueryParamValid;
    } else {
        return true;
    }
}

export function isPathDuplicated(resources: Resource[]): boolean {
    const resourceSignatures: string[] = [];
    let isDuplicated = false;
    resources.forEach((res: any) => {
        // Validate method signature
        if (res.method) {
            const signature: string = `${res.method.toLocaleLowerCase()}_${res.path}`;
            if (resourceSignatures.includes(signature)) {
                isDuplicated = true;
            } else {
                resourceSignatures.push(signature);
            }
        }
    });
    return isDuplicated;
}

export function isServicePathValid(servicePath: string): boolean {
    const servicePathRegex = /^\/?[\S\w-\/]+$/g;
    return servicePath === "" || servicePathRegex.test(servicePath);
}

export function isAllEmpty(emptyFields: Map<string, boolean>): boolean {
    let result = true
    emptyFields.forEach((isEmpty, key) => {
        if (!isEmpty) {
            result = false;
        }
    });
    return result;
}

export function isAllValid(validFields: Map<string, boolean>, emptyFields: Map<string, boolean>,
                           isAllChildrenOptional: boolean, isOptional: boolean, isRoot: boolean): boolean {
    let result = true;
    const allEmpty = isAllEmpty(emptyFields);
    if (!isRoot && isOptional && allEmpty) {
        result = true;
    } else {
        validFields.forEach((isValid, key) => {
            if (!isValid) {
                // TODO: fix inner optional fields validation
                // result = false;
            }
        });
        if (result && isAllChildrenOptional && !isOptional) {
            result = !allEmpty;
        }
    }
    return result;
}

export function isAllOptional(fields: FormField[]): boolean {
    let result = true;
    if (fields && fields.length > 0) {
        fields.map((field: any, index: any) => {
            if (!(field?.optional ?? false)) {
                result = false;
            }
        });
    }
    return result;
}

export function isKeywords(word: string): boolean {
    return keywords.includes(word);
}

export function isValidBallerinaIdentifier(word: string): boolean {
    if (word.startsWith("'")) {
        const splitedWord = word.split("'");
        if (splitedWord && splitedWord[splitedWord.length - 1]) {
            return (/^[a-zA-Z0-9]+$/g.test(word)) && !isKeywords(word);
        } else {
            return false;
        }
    } else {
        return (/^[a-zA-Z0-9]+$/g.test(word)) && !isKeywords(word);
    }
}

export function validateReturnType(text: string) {
    if (!text) {
        return true;
    } else {
        const returnSegments = convertReturnTypeStringToSegments(text);
        if (returnSegments.length === 0) {
            return false;
        }
        let allSegmentsValid = true;
        returnSegments.forEach(segment => {
            allSegmentsValid = returnTypes.includes(segment.type);
        })
        return allSegmentsValid;
    }
}

export function reCalculateDuplicatedResources(resources: Resource[]) {
    const resourceSignatures: string[] = [];
    resources.forEach((res: Resource) => {
        // Validate method signature
        const signature: string = `${res.method.toLowerCase()}_${res.path}`;
        if (resourceSignatures.includes(signature)) {
            res.isPathDuplicated = true;
        } else {
            res.isPathDuplicated = false;
            resourceSignatures.push(signature);
        }
    });
}
