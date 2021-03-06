'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var babel = require('./babel.js');
var babel$1 = _interopDefault(require('rollup-plugin-babel'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

var babel$2 = babel$1.custom(core => {
  const presetItem = core.createConfigItem(babel, {
    type: 'preset'
  });
  return {
    // Passed the plugin options.
    options(_a) {
      var {
        presetOptions
      } = _a,
          pluginOptions = __rest(_a, ["presetOptions"]);

      return {
        // Pull out any custom options that the plugin might have.
        customOptions: {
          presetOptions
        },
        // Pass the options back with the two custom options removed.
        pluginOptions
      };
    },

    config(cfg, data) {
      if (cfg.hasFilesystemConfig()) {
        // Use the normal config
        return cfg.options;
      }

      const presetOptions = data.customOptions.presetOptions; // We set the options for default preset using env vars
      // So that you can use our default preset in your own babel.config.js
      // And our options will still work

      if (presetOptions.asyncToPromises) {
        process.env.BILI_ASYNC_TO_PROMISES = 'enabled';
      }

      if (presetOptions.jsx) {
        process.env.BILI_JSX = presetOptions.jsx;
      }

      if (presetOptions.objectAssign) {
        process.env.BILI_OBJECT_ASSIGN = presetOptions.objectAssign;
      }

      if (presetOptions.minimal) {
        process.env.BILI_MINIMAL = 'enabled';
      }

      return Object.assign({}, cfg.options, {
        presets: [...(cfg.options.presets || []), // Include a custom preset in the options.
        presetItem]
      });
    }

  };
});

exports.default = babel$2;
