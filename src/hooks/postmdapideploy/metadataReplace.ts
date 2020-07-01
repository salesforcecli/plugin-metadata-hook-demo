import { SourceHook } from 'salesforce-alm';

const hook: SourceHook<'postmdapideploy'> = async function(opts) {
  process.stdout.write(`example hook running ${opts.commandId}\n`);
};

export default hook;
