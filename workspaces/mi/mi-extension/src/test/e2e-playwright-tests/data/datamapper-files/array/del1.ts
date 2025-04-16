import * as dmUtils from "./dm-utils";

/*
* title : "root",
* inputType : "JSON",
*/
interface Root {
    d1I: number[]
    m1I: number[]
    m1objI: {
        p1: string
        p2: string[]
    }[]
    i1I: string
    iobjI: {
        p1: string
        p2: string[]
    }
    d2I: number[][]
    m2I: number[][]
    s10O: string[]
    s21I: string[][]
}

/*
* outputType : "JSON",
*/
interface OutputRoot {
    iobjO: {
        p1: string
        p2: string[]
    }[]
    m2O: number[][]
    s10O: string
}



/**
 * functionName : map_S_root_S_Root
 * inputVariable : inputroot
*/
export function mapFunction(input: Root): OutputRoot {
    return {
        iobjO: [{
            p2: [""]
        }
        ]
    }
}

