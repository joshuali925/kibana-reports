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

function psCount(pattern: RegExp | string) {
  return new Promise<number>((resolve, reject) => {
    ps.lookup(
      {
        command: pattern,
        psargs: 'ux',
      },
      function (err, resultList) {
        if (err) reject(err.message);
        resolve(resultList.length);
      }
    );
  });
}

export async function getNumberOfRunningChromiums(): Promise<number> {
  return await psCount('headless_shell');
}
