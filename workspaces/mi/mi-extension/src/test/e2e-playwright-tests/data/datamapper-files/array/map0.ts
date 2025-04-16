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
    d1O: number[]
    m1O: number[]
    m1objO: {
        q1: string
        q2: string[]
    }[]
    i1O: string[]
    i2O: string[][]
}



/**
 * functionName : map_S_root_S_Root
 * inputVariable : inputroot
*/
export function mapFunction(input: Root): OutputRoot {
    return {
        d1O: input.d1I,
        m1O: input.m1I
            .map((m1IItem) => { return m1IItem }),
        m1objO: input.m1objI
            .map((m1objIItem) => {
                return {
                    q1: m1objIItem.p1,
                    q2: m1objIItem.p2
                        .map((p2Item) => { return p2Item })
                }
            }),
        i1O: [input.i1I],
        i2O: [[], [input.i1I]]
    }
}

