export type DashboardStat = {
  label: string;
  value: number;
};

export type RouteSummary = {
  routeId: string;
  routeName: string;
  salesTotal: number;
  collectionTotal?: number;
  dueTotal?: number;
};
