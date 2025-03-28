import { ValueTransformer } from 'typeorm';

function isNullOrUndefined<T>(
  obj: T | null | undefined,
): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null;
}

export class ColumnNumericTransformer implements ValueTransformer {
  defaultValue: number | null = null;

  constructor(defaultValue?: number) {
    if (defaultValue) {
      this.defaultValue = defaultValue;
    }
  }

  to(data?: number | null): number | null {
    if (!isNullOrUndefined(data)) {
      return data;
    }
    return this.defaultValue;
  }

  from(data?: string | null): number | null {
    if (!isNullOrUndefined(data)) {
      const res = parseFloat(data);
      if (isNaN(res)) {
        return null;
      } else {
        return res;
      }
    }
    return null;
  }
}
