import type { ChannelId } from '../domain/types';

export type SourceRow = {
  date: string;
  channel: ChannelId;
  sku: string;
  visits: number;
  paidOrders: number;
  paidAmount: number;
  refundedAmount: number;
  stock: number;
  averageDailySales: number;
};

const dates = [
  '2026-07-17',
  '2026-07-18',
  '2026-07-19',
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
] as const;

const channelFixtures: Array<{
  channel: ChannelId;
  products: Array<Omit<SourceRow, 'date' | 'channel'>>;
}> = [
  {
    channel: 'tmall',
    products: [
      { sku: 'SKU-101', visits: 1400, paidOrders: 84, paidAmount: 12480, refundedAmount: 420, stock: 320, averageDailySales: 18 },
      { sku: 'SKU-102', visits: 960, paidOrders: 42, paidAmount: 5880, refundedAmount: 0, stock: 175, averageDailySales: 10 },
    ],
  },
  {
    channel: 'jd',
    products: [
      { sku: 'SKU-203', visits: 760, paidOrders: 29, paidAmount: 4350, refundedAmount: 0, stock: 8, averageDailySales: 3 },
      { sku: 'SKU-204', visits: 520, paidOrders: 24, paidAmount: 3120, refundedAmount: 80, stock: 96, averageDailySales: 6 },
    ],
  },
  {
    channel: 'douyin',
    products: [
      { sku: 'SKU-305', visits: 1100, paidOrders: 31, paidAmount: 3720, refundedAmount: 120, stock: 160, averageDailySales: 7 },
      { sku: 'SKU-306', visits: 820, paidOrders: 38, paidAmount: 4560, refundedAmount: 0, stock: 140, averageDailySales: 8 },
    ],
  },
];

/** Deterministic, de-identified daily source rows for PoC demonstrations. */
export const sourceRows: SourceRow[] = dates.flatMap((date, dateIndex) =>
  channelFixtures.flatMap(({ channel, products }) =>
    products.map((product, productIndex) => {
      const variation = dateIndex * 3 + productIndex;
      return {
        ...product,
        date,
        channel,
        visits: product.visits + variation * 11,
        paidOrders: product.paidOrders + (variation % 4),
        paidAmount: product.paidAmount + variation * 120,
        refundedAmount: dateIndex === 6 ? product.refundedAmount : 0,
      };
    }),
  ),
);

export const lastSuccessfulAt = '2026-07-24T08:25:00+08:00';
