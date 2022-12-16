import { Dayjs } from "dayjs";

export const formatDateToSql = (date: Dayjs): string => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};
