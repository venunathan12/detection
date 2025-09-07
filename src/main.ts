#!/usr/bin/env node

import fs from 'fs/promises';

import Detector from './lib/Detector.js';

let [node, main, datajsonpath, typename, typespath] = process.argv;
if (datajsonpath == null || typename == null || typespath == null)
{
    console.log('Usage:');
    console.log('   node . <datajsonpath> <typename> <typespath>');
    process.exit();
}

let datajson = JSON.parse((await fs.readFile(datajsonpath)).toString());

let detector = new Detector();
await detector.LoadTypes(typespath);
let matchfound: boolean = detector.Assert(datajson, typename, null, true);

function exit()
{
    console.log(matchfound ? 'T' : 'F');
    console.log();
    console.log(`Info: ${ detector.info.length }\n`); for (let line of detector.info) console.log(line);
    console.log();
    console.log(`Warnings: ${ detector.warnings.length }\n`); for (let line of detector.warnings) console.log(line);
    console.log();
    console.log(`Errors: ${ detector.errors.length }\n`); for (let line of detector.errors) console.log(line);
    console.log();
    process.exit();
}
exit();
