import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

const safeParse = (
  value: any,
  key: string,
  parseFunction: (value: any) => any,
) => {
  try {
    const result = parseFunction(value);
    console.log('parse', value, result);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: any) {
    throw new BadRequestException(`Invalid value for query param ${key}`);
  }
};

export const QueryParamTransformArray = () => {
  return (target: object, key: string) =>
    Transform(({ value }) => safeParse(value, key, JSON.parse))(target, key);
};

// export const QueryParamTransformArray = (target: object, key: string) =>
//   Transform(({ value }) => safeParse(value, key, JSON.parse))(target, key);
