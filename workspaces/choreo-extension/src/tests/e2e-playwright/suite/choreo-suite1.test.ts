import {before, describe, it, after } from 'mocha';

import { ElectronApplication, Page } from 'playwright';
import { startVSCode } from "../launch";
import { ChoreoActivity } from '../components/ActivityBar';
import { OpenExternalURLDialog } from '../components/OpenExternalURLDialog';


let vsode: ElectronApplication;
let vscodeWindow: Page;

//ignore
before(async () => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            vsode = await startVSCode();
            vscodeWindow = await vsode.firstWindow();
            resolve();
        } catch (err){reject(err);}
    });
});


describe('Create New Project Test Suite', async () => {
    it('Test Sign In', async () => {
        const activity = new ChoreoActivity(vscodeWindow);
        await activity.activate();
        await activity.signIn();
        const openExternalURLDialog = new OpenExternalURLDialog(vscodeWindow);
        await openExternalURLDialog.cancel();
    }); 
});

after(async () => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            await vsode.close();
            resolve();
        } catch (err){reject(err);}
    });
});
