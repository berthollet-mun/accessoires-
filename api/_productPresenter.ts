import type { Product } from '@prisma/client';

export function toApiProduct(product: Product) {
  return {
    ...product,
    price: Number(product.price),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  };
}
