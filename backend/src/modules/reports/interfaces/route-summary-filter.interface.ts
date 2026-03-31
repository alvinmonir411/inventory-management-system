import { DateRangeFilter } from './date-range-filter.interface';

export interface RouteSummaryFilter extends DateRangeFilter {
  routeId: string;
}
