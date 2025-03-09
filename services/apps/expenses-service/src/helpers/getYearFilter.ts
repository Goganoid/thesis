import { addYears } from 'date-fns';
import { Between } from 'typeorm';

export const getYearFilter = (year: number) => {
  const startDate = new Date(year, 0, 1);
  return Between(startDate, addYears(startDate, 1));
};
