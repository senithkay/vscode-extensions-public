import { FormField } from "../ConfigurationSpec/types";
import {
    convertReturnTypeStringToSegments,
    returnTypes
} from "../Diagram/components/Portals/Overlay/Elements/DropDown/ApiConfigureWizard/util";
import { keywords } from "../Diagram/components/Portals/utils/constants";

export function validatePath(text: string) {
    if (text !== "") {
        let isPathValid = true;
        const isQueryParamValid = true;

        if ((text.match(/\[/g)?.length !== text.match(/\]/g)?.length) ||
            (text.charAt(text.length - 1) === "/") || (text.charAt(0) === "/")) {
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
                if (keywords.includes(word)) {
                    return false;
                }
            }

            if (paths.includes("/") && paths.includes("[") && paths.includes("]")) {
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
                isPathValid = ((/^[a-zA-Z0-9\/\[\].]+$/g.test(paths)) && (!/^\d/g.test(paths)))
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
                isPathValid = ((/^[a-zA-Z0-9\/\[\]\{\}]+$/g.test(paths)) && (!/^\d/g.test(paths)));
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

export function validateFormFields(field: FormField, emptyFieldChecker: Map<string, boolean>): boolean {
    let allFieldsValid = true;
    if (field.type === "record" && !field.optional) {
        for (const recordField of field.fields) {
            allFieldsValid = validateFormFields(recordField, emptyFieldChecker);
            if (!allFieldsValid) {
                break;
            }
        }
    } else if (field.type === "union" && !field.optional) {
        const isFieldValueInValid: boolean = emptyFieldChecker.get(field.name);
        // breaks the loop if one field is empty
        if (isFieldValueInValid !== undefined && isFieldValueInValid) {
            allFieldsValid = !isFieldValueInValid;
        }
    } else if (!field.optional) {
        const isFieldValueInValid: boolean = emptyFieldChecker.get(field.name);
        // breaks the loop if one field is empty
        if (isFieldValueInValid !== undefined && isFieldValueInValid) {
            allFieldsValid = !isFieldValueInValid;
        }
    }
    return allFieldsValid;
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
