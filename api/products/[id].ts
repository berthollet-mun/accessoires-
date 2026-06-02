import type { VercelRequest, VercelResponse } from '@vercel/node';

import { prisma } from '../_prisma';
import { toApiProduct } from '../_productPresenter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) {
    res.status(400).json({ error: 'Missing product id' });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ data: toApiProduct(product) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch product' });
  }
}
