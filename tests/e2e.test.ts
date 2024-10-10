
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

import { addMsg } from "jest-html-reporters/helper"

beforeEach(() => {
    fs.rmSync("out", { recursive: true, force: true});
    fs.mkdirSync("out");
});


function compileAndRunFile(tsFile: string) {
    const outFile = 'out/a.out';
    execSync(`npm start -- -i ${tsFile} -o ${outFile}`);

    const nativeStart = process.hrtime();
    const outputBuffer = execSync(outFile);
    const nativeEnd = process.hrtime(nativeStart);
    const nativeTime = nativeEnd[0] + nativeEnd[1] / 1e9;
    const output = outputBuffer.toString();


    execSync(`tsc --outfile tmp.js --skipLibCheck ${tsFile}`);
    const tsStart = process.hrtime();
    const expectedOutputBuffer = execSync(`node tmp.js`);
    const tsEnd = process.hrtime(tsStart);
    const tsTime = tsEnd[0] + tsEnd[1] / 1e9;
    const expectedOutput = expectedOutputBuffer.toString();
    expect(output).toEqual(expectedOutput);
    addMsg({ message: `${tsFile}: ${tsTime}s (TS) vs ${nativeTime}s (native)` });
}


describe("End to end tests on all samples", () => {
    const dir = "tests/e2e_samples";
    const files = fs.readdirSync(dir);
    for (const file of files) {
        test(file, () => {
            compileAndRunFile(`${dir}/${file}`);
        });
    }
});
