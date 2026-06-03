import type { VercelRequest, VercelResponse } from '@vercel/node';

import { prisma } from './_prisma.js';
import { toApiProduct } from './_productPresenter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.status(200).json({ data: products.map(toApiProduct) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch products' });
  }
}
