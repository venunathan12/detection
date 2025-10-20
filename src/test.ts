import assert from 'node:assert';
import fs from 'node:fs/promises';

import Detector from './lib/Detector.js';

let [node, main, tid] = process.argv;
let count = 0, successes = 0, failures = 0;

if (tid === undefined)
{
    let timestart = performance.now();

    count = 0; successes = 0; failures = 0;
    let tests = (await fs.readdir('./tests')).filter(x => /^[0-9]+\_[0-9a-zA-Z]+$/.test(x)).sort();
    for (let test of tests) await Test(`./tests/${test}`);
    let [testcount, testpass, testfail] = [count, successes, failures];

    count = 0; successes = 0; failures = 0;
    let examples = (await fs.readdir('./examples')).filter(x => /^[0-9]+\_[0-9a-zA-Z]+$/.test(x)).sort();
    for (let example of examples) await Test(`./examples/${example}`);
    let [excount, expass, exfail] = [count, successes, failures];

    console.log('\n\n');
    console.log(`${testpass}/${testcount} Testcases Passed.\n${testfail}/${testcount} Testcases Failed.\n`);
    console.log(`${expass}/${excount} Examples Passed.\n${exfail}/${excount} Examples Failed.\n\n`);

    let timeend = performance.now();
    console.log(`Completed in ${ timeend - timestart } ms.`);
}
else
{
    let timestart = performance.now();

    assert(tid != null && tid.length > 0, `Test Identifier, if present, cannot be empty !`);
    await Test(tid);

    console.log('\n\n'); console.log(`${successes}/${count} Testcases Passed.\n${failures}/${count} Testcases Failed.\n`);

    let timeend = performance.now();
    console.log(`Completed in ${ timeend - timestart } ms.`);
}

async function Test(tid: string)
{
    console.log(`Running Test ${tid}`);

    let detector = new Detector();
    await detector.LoadTypesFromFile(`${tid}/types.json`);

    let testcases = (await fs.readdir(tid)).filter(x => /^[0-9]+\-[0-9a-zA-Z]+\-[TF][0-9]+\.json$/.test(x)).sort();
    for (let testcase of testcases)
    {
        console.log(`Running Testcase ${testcase}`);

        let datajson = JSON.parse((await fs.readFile(`${tid}/${testcase}`)).toString());

        let expectedtype = testcase.split('.').at(0)?.split('-').at(-2) || 'Void';
        let expectedresult = testcase.split('.').at(0)?.split('-').at(-1)?.charAt(0) || 'T';
        let actualresult = null;
        try {
            actualresult = detector.Assert(datajson, expectedtype, null, true) ? 'T' : 'F';
        } catch (e) {}
        let teststatus = actualresult === expectedresult ? 'PASS' : 'FAIL';
        if (actualresult == null) teststatus += ' ' + '(Runtime Error)';
        count ++; if (teststatus == 'PASS') successes ++; else failures ++;

        console.log(teststatus);
    }
}
