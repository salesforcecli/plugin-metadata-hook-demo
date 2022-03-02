import { Command, Hook } from '@oclif/config';
import { writeFileSync } from 'fs';
import { Builder } from 'xml2js';
import { SourceComponent } from '@salesforce/source-deploy-retrieve';

// tslint:disable-next-line:no-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: SourceComponent[];
};

// Overly simple type for this basic example
type CustomObjectXml = {
  CustomObject: {
    description: string;
  }
}

export const hook: HookFunction = async (options) => {
  console.log('PreDepoy Hook Running');

  if (options.result) {
    const srcComponents = options.result;
    for (const srcComponent of srcComponents) {
      if (srcComponent.type.name === 'CustomObject' && srcComponent.xml) {
        const desc = process.env.SFDX_NEW_METADATA_VALUE || 'Default new description';
        console.log(`Updating the description for object: ${srcComponent.name} to: ${desc}`);
        const customObjectXml = srcComponent.parseXmlSync() as CustomObjectXml;
        if (customObjectXml) {
          customObjectXml.CustomObject.description = desc;

          // Update the object file locally
          const xml = new Builder({ attrkey: '@_xmlns' }).buildObject(customObjectXml);
          writeFileSync(srcComponent.xml, xml);
        }
      }
    }
  }
};
