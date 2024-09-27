
import fs from 'fs';
import { execSync } from 'child_process';


import { exportIrToRelations } from "graphir";
import { extractFromPath } from '../submodules/GraphIR-Backend/submodules/TS-Graph-Extractor/build/main.js';
import { generateCpp } from 'graphir-compiler';

import { getCliOptions } from "./options.js";
import { generateContext } from './context_manager.js';
import { hydrateTypesFromFiles } from './type_hydration.js';

const options = getCliOptions();

async function main() {
    const graph = extractFromPath(options['input-file']);
    await exportIrToRelations(graph, 'out');

    execSync(`souffle -D../../out -F../../out src/main.dl`, { cwd: "submodules/GraphIR-Static-Analysis" });
    hydrateTypesFromFiles(graph, 'out/full_type.csv');

    const cppFile = 'out/tmp.cpp';
    fs.writeFileSync(cppFile, '');

    const contextManager = generateContext(graph);
    contextManager.dump(cppFile);

    const code = generateCpp(graph);
    fs.appendFileSync(cppFile, code);

    execSync(`clang++ -std=c++17 -o ${options['output-file']} -Isubmodules/GraphIR-Backend/lib ${cppFile}`);
}

main();
