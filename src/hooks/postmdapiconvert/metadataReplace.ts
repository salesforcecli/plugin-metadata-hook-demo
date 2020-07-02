import { SourceHook } from 'salesforce-alm/dist/lib/source/sourceHooks';
import { JsonArray, JsonMap } from '@salesforce/ts-types';
import * as fs from 'fs';
import { Builder, parseString } from 'xml2js';

export const hook: SourceHook<'postmdapiconvert'> = async function (options) {
  // Run only on the push command, not the deploy command
  if (options.commandId === 'force:source:push') {
    const aggregateSourceElements = <JsonArray>(<JsonArray>options.result)[0];
    const deployDirectory = <string>(<JsonMap>(<JsonArray>options.result)[2]).deploydir;

    if (aggregateSourceElements[0]) {
      (<JsonArray>(
        (<JsonMap>aggregateSourceElements[0])['workspaceElements']
      )).forEach(workspaceElement => {
        let filePath = <string>(<JsonMap>workspaceElement)['sourcePath'];

        if (
          filePath.includes('objects') &&
          filePath.includes('object-meta.xml')
        ) {
          const objectName = <string>(<JsonMap>workspaceElement)['fullName'];

          //Update the description of the object as it is being deployed to the org
          updateObjectDescription(deployDirectory + '/objects/' + objectName + '.object');

          //Update the description of the object locally
          updateObjectDescription(filePath);

        }
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

        // Replace the description of the objects being pushed with the value of an environment variable
        json.CustomObject.description =
          process.env.NEW_METADATA_VALUE || 'Default new description';

        let xml = new Builder().buildObject(json);

        fs.writeFile(objectPath, xml, function () { });
      });
    }
  });
}