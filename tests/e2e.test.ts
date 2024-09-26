
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

beforeEach(() => {
    fs.rmSync("out", { recursive: true, force: true});
    fs.mkdirSync("out");
});


function compileAndRunFile(tsFile: string) {
    const outFile = 'out/a.out';
    execSync(`npm start -- -i ${tsFile} -o ${outFile}`);

    const output = execSync(outFile).toString();
    const expectedOutput = execSync(`npx tsx ${tsFile}`).toString();
    expect(output).toEqual(expectedOutput);
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
