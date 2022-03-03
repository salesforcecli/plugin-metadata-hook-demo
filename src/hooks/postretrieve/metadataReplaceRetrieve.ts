import { readFileSync, writeFileSync } from 'fs';
import { Builder, parseStringPromise } from 'xml2js';
import { Command, Hook } from '@oclif/config';
import { FileResponse } from '@salesforce/source-deploy-retrieve';

type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: FileResponse[];
};

export const hook: HookFunction = async function (options) {
  console.log('PostRetrieve Hook Running');

  if (options.result) {
    for (const fileResponse of options.result) {
      const { type, filePath } = fileResponse;
      if (type === 'CustomObject' && filePath) {
        console.log(`Updating the description for object: ${filePath}`);
        const objFileContents = readFileSync(filePath, 'utf-8');
        const objJson = await parseStringPromise(objFileContents);
        objJson.CustomObject.description = 'PostRetrieve description';
        const xml = new Builder().buildObject(objJson);
        writeFileSync(filePath, xml);
      }
    }
  }
};
