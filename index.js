#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const escodegen = require('escodegen');
const { program } = require('commander');

function prettifyCode(code, options) {
    const ast = esprima.parseScript(code, { range: true, tokens: true, comment: true });

    const prettifiedCode = escodegen.generate(ast, {
        format: {
            indent: {
                style: options.useTabs ? '\t' : ' '.repeat(options.indentSize),
            },
            newline: '\n',
            space: ' ',
            quotes: options.singleQuotes ? 'single' : 'double',
            semicolons: options.semicolons,
        },
        comment: true,
    });

    return prettifiedCode;
}

function processFile(filePath, options) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const prettifiedCode = prettifyCode(code, options);

    if (options.write) {
        fs.writeFileSync(filePath, prettifiedCode, 'utf-8');
        console.log(`Prettified and saved: ${filePath}`);
    } else {
        console.log(prettifiedCode);
    }
}

program
    .version('1.0.0')
    .description('A tool to prettify JavaScript code')
    .option('-w, --write', 'Write the output to the file instead of stdout')
    .option('-t, --use-tabs', 'Use tabs for indentation')
    .option('-s, --indent-size <size>', 'Number of spaces for indentation', '2')
    .option('-q, --single-quotes', 'Use single quotes instead of double quotes')
    .option('--no-semicolons', 'Remove semicolons')
    .arguments('<file...>')
    .action((files, options) => {
        const prettifyOptions = {
            useTabs: options.useTabs,
            indentSize: parseInt(options.indentSize, 10),
            singleQuotes: options.singleQuotes,
            semicolons: options.semicolons,
            write: options.write,
        };

        files.forEach(file => {
            const filePath = path.resolve(file);
            processFile(filePath, prettifyOptions);
        });
    });

program.parse(process.argv);