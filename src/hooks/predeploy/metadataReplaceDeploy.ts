import { Command, Hook } from '@oclif/config';
import * as fs from 'fs';
import { Builder, parseString } from 'xml2js';
import {SourceComponent} from '@salesforce/source-deploy-retrieve';

// tslint:disable-next-line:no-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result: SourceComponent[];
};

export const hook: HookFunction = async options => {
  console.log('PreDepoy Hook Running');

  if (options.result) {
    options.result.forEach(component => {
      console.log('Updating the ' + component.name + ' object');

      // Update the object in the org (the metadata that is being deployed)
      updateObjectDescription(component.xml!);
    });
  }
};


function updateObjectDescription(objectPath: string) {
  const data = fs.readFileSync(objectPath).toString('utf-8');

    if (data) {
      parseString(data, (error, json) => {
        if (error) throw error;

        // Replace the description of the object being pushed with the value of an environment variable
        if (json.CustomObject) {
          json.CustomObject.description =
            process.env.SFDX_NEW_METADATA_VALUE || 'Default new description';
        }

        const xml = new Builder().buildObject(json);

        fs.writeFileSync(objectPath, xml);
      });
    }
}
