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

import { ReportSchemaType } from 'server/model';
import {
  EntityType,
  CountersNameType,
  CountersType,
  ActionType,
} from './types';
import _ from 'lodash';
import {
  CAPACITY,
  DEFAULT_ROLLING_COUNTER,
  GLOBAL_BASIC_COUNTER,
  INTERVAL,
  WINDOW,
} from './constants';

export const time2CountWin: Map<number, CountersType> = new Map();

export const addToMetric = (
  entity: EntityType,
  action: ActionType,
  counter: CountersNameType,
  reportMetadata?: ReportSchemaType
) => {
  const count = 1;
  // remove outdated key-value pairs
  trim();

  const timeKey = getKey(Date.now());
  const rollingCounters = time2CountWin.get(timeKey);

  time2CountWin.set(
    timeKey,
    updateCounters(
      entity,
      action,
      counter,
      rollingCounters || _.cloneDeep(DEFAULT_ROLLING_COUNTER),
      count,
      reportMetadata
    )
  );
};

export const getMetrics = () => {
  const preTimeKey = getPreKey(Date.now());
  const rollingCounters = time2CountWin.get(preTimeKey);
  const metrics = buildMetrics(rollingCounters);
  return metrics;
};

const trim = () => {
  if (time2CountWin.size > CAPACITY) {
    const currentKey = getKey(Date.now() - WINDOW * 1000);
    time2CountWin.forEach((_value, key, map) => {
      if (key < currentKey) {
        map.delete(key);
      }
    });
  }
};

const getKey = (milliseconds: number) => {
  return Math.floor(milliseconds / 1000 / INTERVAL);
};

const getPreKey = (milliseconds: number) => {
  return getKey(milliseconds) - 1;
};

const buildMetrics = (rollingCounters: CountersType | undefined) => {
  if (!rollingCounters) {
    rollingCounters = DEFAULT_ROLLING_COUNTER;
  }
  return _.merge(rollingCounters, GLOBAL_BASIC_COUNTER);
};

const updateCounters = (
  entity: EntityType,
  action: ActionType,
  counter: CountersNameType,
  rollingCounter: CountersType,
  count: number,
  reportMetadata?: ReportSchemaType
) => {
  // update usage metrics
  if (reportMetadata) {
    const {
      report_definition: {
        report_params: {
          report_source: source,
          core_params: { report_format: format },
        },
      },
    } = reportMetadata;

    // @ts-ignore
    rollingCounter[source.toLowerCase().replace(' ', '_')][format]['download'][
      counter
    ] += count;
    // update basic counter for total request count
    if (counter === 'count') {
      //@ts-ignore
      GLOBAL_BASIC_COUNTER[source.toLowerCase().replace(' ', '_')][format][
        'download'
      ]['total']++;
    }
  }
  // update action metric per API
  // @ts-ignore
  rollingCounter[entity][action][counter] += count;
  if (counter === 'count') {
    // @ts-ignore
    GLOBAL_BASIC_COUNTER[entity][action]['total']++;
  }

  return rollingCounter;
};
