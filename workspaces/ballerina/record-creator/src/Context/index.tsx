import { createContext } from "react"
import { RecordCreatorContext } from "../types"

const defaultContext: any = {}

export const Context = createContext<RecordCreatorContext>(defaultContext);