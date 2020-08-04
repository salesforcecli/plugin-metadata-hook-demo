import * as fs from 'fs';
import { Builder, parseString } from 'xml2js';
import { Command, Hook } from '@oclif/config';

type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class,
  argv: string[],
  commandId: string,
  result?: PreDeployResult
}

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

export const hook: HookFunction = async function (options) {
  console.log('Hook Running');

  // Run only on the push command, not the deploy command
  if (options.commandId === 'force:source:push') {
    if (options.result) {
      Object.keys(options.result).forEach(mdapiElementName => {
        console.log('Updating the ' + mdapiElementName + ' object');
        let mdapiElement = options.result![mdapiElementName]!;

        // Update the object in the org (the metadata that is being deployed)
        updateObjectDescription(mdapiElement.mdapiFilePath);

        // Update the object locally
        updateObjectDescription(mdapiElement.workspaceElements[0].sourcePath);
      });
    }
  }
};

export default hook;

function updateObjectDescription(objectPath: string) {
  fs.readFile(objectPath, 'utf-8', function (err, data) {
    if (err) throw err;

    if (data) {
      parseString(data, function (err, json) {
        if (err) throw err;

        // Replace the description of the object being pushed with the value of an environment variable
        json.CustomObject.description =
          process.env.SFDX_NEW_METADATA_VALUE || 'Default new description';

        let xml = new Builder().buildObject(json);

        fs.writeFile(objectPath, xml, function () { });
      });
    }
  });
}
