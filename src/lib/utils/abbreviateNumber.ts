export function abbreviateNumber(num: number): string {
  const str = num.toLocaleString();
  const splitted = str.split(',');

  let result =
    splitted.length > 1 && splitted[1][0] !== '0'
      ? `${splitted[0]}.${splitted[1][0]}`
      : splitted[0];

  if (num >= 1000 && num < 999999) result += 'K';
  else if (num >= 1000000) result += 'M';

  return result;
}
