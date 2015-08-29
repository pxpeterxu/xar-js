/// <reference path="../typings/tsd.d.ts" />

import * as commander from 'commander';
import * as fs from 'fs';

import {XarArchive} from '../src/lib';
import {walk, FileReader, FileWriter} from '../src/util';

interface GenerateOptions {
  certs?: string[],
  privateKey?: string
}

function generateArchive(archivePath: string, files: string[], opts: GenerateOptions) {
  let writer = new FileWriter(archivePath);
  let archive = new XarArchive();
  for (let file of files) {
    archive.addFile(walk(file));
  }
  if (opts.privateKey) {
    let privateKey = fs.readFileSync(opts.privateKey, 'utf-8');
    let certs = opts.certs.map(certPath => fs.readFileSync(certPath, 'utf-8'));
    archive.setCertificates({
      cert: certs[0],
      privateKey: privateKey,
      additionalCerts: certs.slice(1)
    })
  }
  archive.generate(writer, path => new FileReader(path));
}

function collect(arg: string, ary: string[]) {
  ary.push(arg);
  return ary;
}

interface CmdOptions {
  [index: string]: any;
}

commander
  .command('create <archive> [files...]')
  .description('Create a xar archive')
  .option('-c, --cert [path]', 'Path to a certificate to include', collect, [])
  .option('-p, --private-key [file]', 'Path to private key to sign archive with')
  .action((archive: string, files: string[], opts: CmdOptions) => {
    generateArchive(archive, files, {
      certs: opts['cert'],
      privateKey: opts['privateKey']
    });
  });
commander.parse(process.argv);