#!/usr/bin/env node

const Sort = require('../lib')
const cli = require('commander')

cli
  .version('1.0.1')
  .option('-c, --config [file]', 'configuration to sort by')
  .arguments('<path...>')
  .action(path => {
    let sort = new Sort(cli.config || 'zen')
    path.forEach(path => {
      process.stdout.write(`Sorting ${path}...\t`)
      sort.processPath(path)
      process.stdout.write('done\n')
    })
  })
  .parse(process.argv)
