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

}

/*
* title : "root",
* outputType : "JSON",
*/
interface OutputRoot {
    d1O: number[]
    m1O: number[]
    m1objO: {
        q1: string
        q2: string[]
    }[]
}



/**
 * functionName : map_S_root_S_root
 * inputVariable : inputroot
*/
export function mapFunction(input: Root): OutputRoot {
    return {
      
    }
}

