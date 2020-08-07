import { promises as fs } from 'fs';
import * as path from 'path';
import { Builder, parseString } from 'xml2js';
import { Command, Hook } from '@oclif/config';

type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: PostRetrieveResult;
};

type PostRetrieveResult = {
  [aggregateName: string]: {
    mdapiFilePath: string;
  };
};

export const hook: HookFunction = async function (options) {
  console.log('PostRetrieve Hook Running');

  // Run only on the pull command, not the retrieve command
  // if (options.commandId === 'force:source:pull') {
  if (options.result) {
    for (const mdapiElementName of Object.keys(options.result)) {
      console.log('Updating the ' + mdapiElementName + ' object');
      let mdapiElement = options.result![mdapiElementName]!;

      // Update the object locally so that the pull does not overwrite the local description
      await retainObjectDescription(
        mdapiElementName,
        mdapiElement.mdapiFilePath
      );
    }
  }
};
// };

export default hook;

async function retainObjectDescription(objectName: string, objectPath: string) {
  // Find the current local description
  let localDescription: string | undefined;
  if (!process.env.SFDX_ORG_PATH) {
    console.log(
      'Error: set the SFDX_ORG_PATH environment variable to allow local descriptions to be read'
    );
    return;
  }
  const localFilePath = path.join(
    process.env.SFDX_ORG_PATH,
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
    localDescription = localJson.CustomObject.description;
  }

  // Update the incoming Metadata's description
  const incomingXml = await fs.readFile(objectPath, 'utf-8');
  const incomingJson = await new Promise<any>((resolve, reject) =>
    parseString(incomingXml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  );

  // Replace the description of the object being pulled with the value of the current description
  if (
    incomingJson.CustomObject &&
    incomingJson.CustomObject.description &&
    localDescription
  ) {
    incomingJson.CustomObject.description = localDescription;
  }

  const xml = new Builder().buildObject(incomingJson);

  await fs.writeFile(objectPath, xml, 'utf-8');
}
