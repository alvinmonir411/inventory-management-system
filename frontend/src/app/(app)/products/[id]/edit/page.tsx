import { ProductEditPage } from '@/components/products/product-edit-page';

type EditProductRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductRoutePage({
  params,
}: EditProductRoutePageProps) {
  const { id } = await params;

  return <ProductEditPage productId={id} />;
}
