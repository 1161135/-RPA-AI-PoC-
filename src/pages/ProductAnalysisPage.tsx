import { useCockpitData } from '../hooks/useCockpitData';

export function ProductAnalysisPage() {
  const { skuMetrics } = useCockpitData();
  return <section id="sku-analysis" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">SKU · 当前筛选条件</p><h2>商品分析</h2><p>销售、转化和库存风险均由同一份源数据计算。</p></div></div>
    <article className="panel table-panel"><table><thead><tr><th>SKU</th><th>GMV</th><th>支付订单</th><th>支付转化率</th><th>库存</th><th>可售天数</th></tr></thead><tbody>{skuMetrics.map((item) => {
      const days = item.averageDailySales === 0 ? '—' : (item.stock / item.averageDailySales).toFixed(1);
      return <tr key={item.sku}><td><b>{item.sku}</b></td><td>¥{item.gmv.toLocaleString()}</td><td>{item.paidOrders}</td><td>{(item.conversionRate * 100).toFixed(2)}%</td><td>{item.stock}</td><td className={Number(days) < 3 ? 'risk-text' : ''}>{days}</td></tr>;
    })}</tbody></table></article>
  </section>;
}
