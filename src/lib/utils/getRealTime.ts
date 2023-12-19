import { getTimeObject } from 'quick-ms/lib';

export function getRealTime(ms: number): string {
  const data = getTimeObject(ms);
  data.milliseconds = 0;

  const keys = Object.keys(data).filter((k) => data[k] !== 0);

  let result = '';
  keys.forEach((key) => {
    if (keys.indexOf(key) !== 0 && keys[keys.length - 1] === key) {
      result += ' and ';
    } else if (keys.indexOf(key) !== 0) {
      result += ', ';
    }

    result += `${data[key]} ${key}`;
  });

  return result;
}
