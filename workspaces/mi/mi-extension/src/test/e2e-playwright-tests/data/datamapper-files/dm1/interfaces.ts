import * as dmUtils from "./dm-utils";

/*
* title : "root",
* inputType : "JSON",
*/
interface Root {
name: string
age: number
city: string
}

/*
* title : "root",
* outputType : "JSON",
*/
interface OutputRoot {
name: string
age: number
home: string
}



/**
 * functionName : map_S_root_S_root
 * inputVariable : inputroot
*/
export function mapFunction(input: Root): OutputRoot {
	return {}
}

