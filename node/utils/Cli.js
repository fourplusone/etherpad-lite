/**
 * The Cli module handles command line parameters
 */

/*
 * 2012 Matthias Bartelmeß
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an
  "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var optimist = require('optimist');

var argv = optimist.usage('$0 [options]', {
  'help': {
    description: 'Displays this message',
    alias: 'h'
  },
  'settings' : {
    description: 'Specifies the settings file',
    default: 'settings.json',
    alias: 's',
  }
}).argv;

if(argv['help'] === true) {
	optimist.showHelp(console.info);
	process.exit(0);
}



exports.argv = argv;
