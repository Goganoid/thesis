export const transformQueryParams = (
  params: Record<string, any> | undefined
): string => {
  if (!params) {
    return "";
  }
  const transformedParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value)) {
        return value.length
          ? {
              ...acc,
              [key]: `[${value.map((filter: string) => `"${filter}"`)}]`,
            }
          : acc;
      }
      if (!value) {
        return acc;
      }

      return {
        ...acc,
        [key]: value,
      };
    },
    {}
  );
  return new URLSearchParams(transformedParams).toString();
};
