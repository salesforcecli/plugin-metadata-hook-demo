# plugin-metadata-hook-demo

[![NPM](https://img.shields.io/npm/v/plugin-metadata-hook-demo.svg?label=plugin-metadata-hook-demo)](https://www.npmjs.com/package/plugin-metadata-hook-demo) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-metadata-hook-demo/tree/master.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-metadata-hook-demo/tree/master) [![Downloads/week](https://img.shields.io/npm/dw/plugin-metadata-hook-demo.svg)](https://npmjs.org/package/plugin-metadata-hook-demo) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-metadata-hook-demo/master/LICENSE.txt)

Demo using Salesforce CLI hooks to replace metadata values with an environment variable before a deploy and after a retrieve.

See [metadataReplaceDeploy.ts](./src/hooks/predeploy/metadataReplaceDeploy.ts) for the sample predeploy hook code.
See [metadataReplaceRetrieve.ts](./src/hooks/postretrieve/metadataReplaceRetrieve.ts) for the sample postretrieve hook code.

To use this demo: build and link the plugin and then deploy/push or retrieve/pull custom object metadata files. Their description fields will be updated to maintain a different description between local and remote obejcts.

## Getting Started

To use, install the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) and run the following commands.

```
Verify the CLI is installed
  $ sfdx (-v | --version)
Install the metadata-hook-demo plugin
  $ sfdx plugins:install metadata-hook-demo
To run a command
  $ sfdx [command]
```

To build the plugin locally, make sure to have yarn installed and run the following commands:

```
Clone the repository
  $ git clone git@github.com:salesforcecli/plugin-metadata-hook-demo
Install the dependencies and compile
  $ yarn install
  $ yarn prepack
Link your plugin to the sfdx cli
  $ sfdx plugins:link
To verify
  $ sfdx plugins
```

## About the Predeploy Hook TypeScript Code

The example for creating a `predeploy` Salesforce CLI hook shows how to replace the description of a CustomObject with the value of an environment variable. The hook runs only when deploying files to an org with `force:source:deploy`, `force:source:push`, or `force:source:delete` commands. See the [metadataReplaceDeploy.ts](./src/hooks/predeploy/metadataReplaceDeploy.ts) TypeScript file for the code described in this section so you can follow along. The process to create a hook is similar to the [oclif](https://oclif.io/docs/hooks) process.

## Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
