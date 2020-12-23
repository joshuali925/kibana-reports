/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import ps from 'ps-node';

function psLookup(regex: RegExp) {
  return new Promise<number>((resolve) => {
    ps.lookup(
      {
        command: regex,
        psargs: 'ux',
      },
      function (err, resultList) {
        if (err) {
          throw new Error(err.message);
        }
        resolve(resultList.length);
      }
    );
  });
}

export async function getRunningChromiums(): Promise<number> {
  const result = await psLookup(/Chromium|headless_shell/);
  console.log('result', result);
  return result;
}
