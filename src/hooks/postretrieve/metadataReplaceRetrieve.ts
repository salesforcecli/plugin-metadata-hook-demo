import { RetrieveResult } from '@salesforce/source-deploy-retrieve';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Builder, parseString } from 'xml2js';
import { Command, Hook } from '@oclif/config';

type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result: RetrieveResult;
};

export const hook: HookFunction = async function (options) {
  console.log('PostRetrieve Hook Running');

  if (options.result) {
    // @ts-ignore
    for (const component of options.result.fileProperties) {
      if (!component.fullName.includes('package.xml')) {
        console.log('Updating the ' + component.fullName + ' object');

        // Update the object locally so that the pull does not overwrite the local description
        await retainObjectDescription(
          component.fullName
        );
      } else {
      }
    }
  }
};

export default hook;

async function retainObjectDescription(objectName: string) {
  if (! process.env.SFDX_NEW_DESCRIPTION) {
    console.log(
      'Error: set the SFDX_NEW_DESCRIPTION environment variable to allow local descriptions to be updated'
    );
    return;
  }
  const localFilePath = path.join(
    process.cwd(),
    'force-app',
    'main',
    'default',
    'objects',
    objectName,
    objectName + '.object-meta.xml'
  );
  const localXml = await fs.readFile(localFilePath, 'utf-8');

  const localJson = await new Promise<any>((resolve, reject) =>
    parseString(localXml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );

  // Grab the current description
  if (localJson.CustomObject && localJson.CustomObject.description) {
    localJson.CustomObject.description = process.env.SFDX_NEW_DESCRIPTION || 'Default new description';
  }

  const xml = new Builder().buildObject(localJson);
  await fs.writeFile(localFilePath, xml, 'utf-8');
}
