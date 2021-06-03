import { Command, Hook } from '@oclif/config';
import * as fs from 'fs';
import { Builder, parseString } from 'xml2js';

// tslint:disable-next-line:no-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: PreDeployResult;
};

type PreDeployResult = {
  [aggregateName: string]: {
    mdapiFilePath: string;
    workspaceElements: {
      fullName: string;
      metadataName: string;
      sourcePath: string;
      state: string;
      deleteSupported: boolean;
    }[];
  };
};

export const hook: HookFunction = async (options) => {
  console.log('PreDepoy Hook Running');

  if (options.result) {
    Object.keys(options.result).forEach((mdapiElementName) => {
      console.log('Updating the ' + mdapiElementName + ' object');
      const mdapiElement = options.result![mdapiElementName]!;

      // Update the object in the org (the metadata that is being deployed)
      updateObjectDescription(mdapiElement.mdapiFilePath);

      // Update the object locally
      updateObjectDescription(mdapiElement.workspaceElements[0].sourcePath);
    });
  }
};

function updateObjectDescription(objectPath: string) {
  fs.readFile(objectPath, 'utf-8', (err, data) => {
    if (err) throw err;

    if (data) {
      parseString(data, (error, json) => {
        if (error) throw error;

        // Replace the description of the object being pushed with the value of an environment variable
        if (json.CustomObject) {
          json.CustomObject.description =
            process.env.SFDX_NEW_METADATA_VALUE || 'Default new description';
        }

        const xml = new Builder().buildObject(json);

        fs.writeFile(objectPath, xml, () => {});
      });
    }
  });
}
