import * as assert from 'assert';
import * as TestEngine from '../../TestEngine';
//import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { parse, stringify } from 'yaml';
import { error } from 'console';




// suite('Test TestEngine', () => {
//     //let mock = new MockAdapter(axios);
//     let service = TestEngine.getService();

//     setup(() => {
//         //mock.reset();
//         TestEngine.reset();
//     });

//     test('Init Test engine', () => {
//         let state = TestEngine.getState();
//         assert.strictEqual(state, "init");
//     });

//     test('See if engine goes to ready state', (done) => {
//         service.onTransition((state) => {
//             if (state.matches('ready')) {
//                 done();
//             }
//         });
//         mock.onPost('/api').reply(200, { success: true });
//         TestEngine.setOpenAPI(loadPetstoreData());
//         assert.strictEqual(TestEngine.getState(), "loading");
//     });

//     test('See if engine goes to error state', (done) => {
//         service.onTransition((state) => {
//             if (state.matches('error')) {
//                 done();
//             }
//         });
//         mock.onPost('/api').reply(500, { error: "Something went wrong" });
//         TestEngine.setOpenAPI(loadPetstoreData());
//         assert.strictEqual(TestEngine.getState(), "loading");
//     });


//     test('Full flow', (done) => {
//         console.log("Current directory:", __dirname);
//         TestEngine.setOpenAPI(loadPetstoreData());
//         service.onTransition((state) => {
//             if (state.matches('ready')) {
//                 assert.notEqual(state.context.apiSpec, undefined);
//                 service.onTransition((state) => {
//                     if (state.matches('executing')) {
//                         assert.notEqual(state.context.nextRequest, undefined);
//                     }
//                 });
//                 TestEngine.runExecute("Get 1st pet");
//             }
//             done();
//         });
//     });
// });

// function loadPetstoreData() {
//     const petstoreYaml = '/home/jo/test-gpt/test-gpt/src/test/suite/resources/petstore.yaml';
//     const fs = require('fs');

//     let petstoreData = {};
//     try {
//         petstoreData = parse(fs.readFileSync(petstoreYaml, 'utf8'));
//     } catch (e) {
//         console.log(e);
//     }
//     return petstoreData;
// }