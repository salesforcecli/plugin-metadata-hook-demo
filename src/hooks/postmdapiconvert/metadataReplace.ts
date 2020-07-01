import { SourceHook } from 'salesforce-alm/dist/lib/source/sourceHooks';
import { JsonArray, JsonMap } from '@salesforce/ts-types';
import * as fs from 'fs';
import { parseString, Builder } from 'xml2js';

export const hook: SourceHook<'postmdapiconvert'> = async function (options) {

  if (options.commandId === 'force:source:push') {

    const aggregateSourceElements = <JsonArray>(<JsonArray>options.result)[0];

    if (aggregateSourceElements[0]) {

      (<JsonArray>(<JsonMap>aggregateSourceElements[0])['workspaceElements']).forEach(workspaceElement => {

        let filePath = <string>(<JsonMap>workspaceElement)['sourcePath'];

        if (filePath.includes('objects') && filePath.includes('object-meta.xml')) {

          fs.readFile(filePath, 'utf-8', function (err, data) {
            if (err) throw err;

            if (data) {
              parseString(data, function (err, json) {
                if (err) throw err;

                json.CustomObject.description = process.env.NEW_METADATA_VALUE || "Default new description";

                let xml = new Builder().buildObject(json);

                fs.writeFile(filePath, xml, function () { });

              });
            }

          });

        }

      });

    }

  }

};

export default hook;
