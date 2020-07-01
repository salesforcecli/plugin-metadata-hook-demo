import { SourceHook } from 'salesforce-alm/dist/lib/source/sourceHooks';

export const hook: SourceHook<'postmdapiconvert'> = async function(options) {
  console.log(
    `example postmdapiconvert hook running on command ${options.commandId}`
  );

  process.stdout.write(
    `${process.env.NEW_METADATA_VALUE} is the new description\n`
  );

  process.stdout.write(`${options.result} is the result variable\n`);
};

export default hook;
