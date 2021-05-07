import Dexie from "dexie";

let database: any = null;
let isBrowserSupport: boolean = false;
const defaultVersion: number = 1;

export const init = (version = defaultVersion) => {
    try {
        database = new Dexie("lowCodeEditor");
        database.version(version).stores({
            FormFields: 'id'
        });
        isBrowserSupport = true;
        return database;
    } catch (e) {
        isBrowserSupport = false;
        return null;
    }
};

export const put = async (id: string, doc: any) => {
    if (database) {
        return database.FormFields.put({ id, fields: JSON.stringify(doc) });
    }
    return null;
};

export const get = async (id: string) => {
    if (database) {
        const record = await database.FormFields.get(id);
        return record?.fields ? JSON.parse(record.fields) : null;
    }
    return null;
};

export const isAvailable = () => isBrowserSupport;
