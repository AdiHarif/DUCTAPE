
import fs from "fs"
import { execSync } from "child_process"

beforeEach(() => {
    fs.rmSync("out", { recursive: true, force: true});
    fs.mkdirSync("out");
});

const results: any = {};

afterAll(() => {
    const outpath = "sort_benchmarks.csv";
    fs.writeFileSync(outpath, "File, TS Time(s), Native Time(s)\n");
    for (const file in results) {
        const [tsTime, nativeTime] = results[file];
        fs.appendFileSync(outpath, `${file},${tsTime},${nativeTime}\n`);
    }
});

function testCppFile(cppFile: string) {
    const outFile = 'out/a.out';
    execSync(`clang++ -O3 -std=c++17 -o ${outFile} ${cppFile} `);

    const startTime = process.hrtime();
    const outputBuffer = execSync(`${outFile}`);
    const endTime = process.hrtime(startTime);
    const time = endTime[0] + endTime[1] / 1e9;
    const output = outputBuffer.toString();
    expect(output).toEqual("");

    const cppFileBase = cppFile.split('/').pop()!;
    results[cppFileBase] = ['-', time];
}

function testTsFile(tsFile: string) {
    const outDir = 'out';

    execSync(`tsc --outDir ${outDir} --allowSyntheticDefaultImports --skipLibCheck ${tsFile} --target ESNext`);
    const startTime = process.hrtime();
    const expectedOutputBuffer = execSync(`node --max-old-space-size=8192 ${outDir}/*`);
    const endTime = process.hrtime(startTime);
    const time = endTime[0] + endTime[1] / 1e9;
    const output = expectedOutputBuffer.toString();
    expect(output).toEqual("");

    const tsFileBase = tsFile.split('/').pop()!;
    results[tsFileBase] = [time, '-'];
}

function testDuctapeFile(ductapeFile: string) {
    const outDir = 'out';
    execSync(`tsc --outDir ${outDir} --skipLibCheck ${ductapeFile} --target ESNext`);
    const tsStartTime = process.hrtime();
    const expectedOutputBuffer = execSync(`node ${outDir}/*`);
    const endTime = process.hrtime(tsStartTime);
    const tsTime = endTime[0] + endTime[1] / 1e9;
    const output = expectedOutputBuffer.toString();
    expect(output).toEqual("");

    const execFile = 'out/a.out';
    execSync(`npm start -- -i ${ductapeFile} -o ${execFile}`);
    const nativeStartTime = process.hrtime();
    const nativeOutputBuffer = execSync(`${execFile}`);
    const nativeEndTime = process.hrtime(nativeStartTime);
    const nativeTime = nativeEndTime[0] + nativeEndTime[1] / 1e9;
    const nativeOutput = nativeOutputBuffer.toString();
    expect(nativeOutput).toEqual("");

    const ductapeFileBase = ductapeFile.split('/').pop()!;
    results[ductapeFileBase] = [tsTime, nativeTime];
}


describe("Sort Benchmarks (based on LangBench", () => {
    const dir = "tests/sort_benchmarks";
    const files = fs.readdirSync(dir);
    const cppFiles = files.filter(f => f.endsWith('.cpp'));
    const tsFiles = files.filter(f => f.endsWith('.ts')).filter(f => !f.endsWith('.ductape.ts'));
    const ductapeFiles = files.filter(f => f.endsWith('.ductape.ts'));

    for (const file of cppFiles) {
        test(file, () => {
            testCppFile(`${dir}/${file}`);
        });
    }

    for (const file of tsFiles) {
        test(file, () => {
            testTsFile(`${dir}/${file}`);
        });
    }

    // for (const file of ductapeFiles) {
    //     test(file, () => {
    //         testDuctapeFile(`${dir}/${file}`);
    //     });
    // }
});
