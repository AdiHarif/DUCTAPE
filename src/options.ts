
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function getCliOptions() {
    return yargs(hideBin(process.argv))
        .option('input-file', { alias: 'i', type: 'string', description: 'Input file', demandOption: true })
        .option('output-file', { alias: 'o', type: 'string', description: 'Output file', default: 'a.out'})
        .option('compilation-mode', { alias: 'm', type: 'string', description: 'Compilation mode', default: 'full', choices: ['full', 'gradual',]})
        .parseSync();
}
