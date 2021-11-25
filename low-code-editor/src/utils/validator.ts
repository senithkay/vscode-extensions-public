import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { Resource } from "../Diagram/components/LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/types";
import {
    convertReturnTypeStringToSegments,
    returnTypes
} from "../Diagram/components/LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/util";
import { keywords } from "../Diagram/components/Portals/utils/constants";


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
