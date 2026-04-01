import { SaleDetailsPage } from '@/components/sales/sale-details-page';

export default async function SaleDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SaleDetailsPage saleId={Number(id)} />;
}
