import { DateRangeFilter } from './date-range-filter.interface';

export interface CompanySummaryFilter extends DateRangeFilter {
  companyId: string;
}
