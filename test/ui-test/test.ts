// import { EditorView, VSBrowser } from 'vscode-extension-tester';
// import { join } from 'path';

// describe('Hello World Example UI Tests', () => {
//     // let driver: WebDriver;
//     // let workbench: Workbench;
//     const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');

//     before(() => {
//         // driver = VSBrowser.instance.driver;
//         // workbench = new Workbench();
//     });

//     // it.skip('Command shows a notification with the correct text', async () => {
//     //     await workbench.executeCommand('Hello World');
//     //     const notification = await driver.wait(() => { return notificationExists('Hello'); }, 20000) as Notification;

//     //     expect(await notification.getMessage()).equals('Hello World!');
//     //     expect(await notification.getType()).equals(NotificationType.Info);
//     // });

//     it('Test Title bar', async () => {
//         await VSBrowser.instance.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/hello_world.bal`);
//         const editorView = new EditorView();
        
//         const buttons = await (await editorView.getActions()).entries;
//         const button1 = await editorView.getAction("Show Diagram")[Symbol];
//         console.log(buttons);
//         console.log(button1);
//     });
// });

// // async function notificationExists(text: string): Promise<Notification | undefined> {
// //     const notifications = await new Workbench().getNotifications();
// //     for (const notification of notifications) {
// //         const message = await notification.getMessage();
// //         if (message.indexOf(text) >= 0) {
// //             return notification;
// //         }
// //     }
// // }