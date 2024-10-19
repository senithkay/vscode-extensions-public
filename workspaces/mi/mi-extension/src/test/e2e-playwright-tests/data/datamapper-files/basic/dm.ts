import * as dmUtils from "./dm-utils";

/*
* title : "root",
* inputType : "JSON",
*/
interface Root {
    dmI: string
    dmeI: string
    mo1I: string
    mo2I: string
    mo3I: string
    moeI: boolean
    odmI: {
        dm1: string
        dm2: number
    }
    opmI: {
        op1: string
        op2: string
    }


}

/*
* title : "root",1
* outputType : "JSON",
*/
interface OutputRoot {
    dmO: string
    dmeO: number
    moO: string
    moeO: number
    odmO: {
        dm1: string
        dm2: number
    }
    odmeO: {
        dm1: string
        dm2: string
    }
    ompO: {
        p1: string
        p2: number
    }
}


/**
 * functionName : map_S_root_S_root
 * inputVariable : inputroot
*/
export function mapFunction(input: Root): OutputRoot {
    return {
        dmO: input.dmI,
        dmeO: input.dmeI,
        moO: input.mo1I + input.mo2I + input.mo3I,
        moeO: input.mo2I + input.moeI + input.mo3I,
        odmO: input.odmI,
        odmeO: input.odmI,
        ompO: {
            p1: input.odmI.dm1,
            p2: input.opmI.op2
        }
    }
}

