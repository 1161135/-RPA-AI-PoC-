import { useCockpitData } from '../hooks/useCockpitData';

const channelNames = { tmall: '淘宝/天猫', jd: '京东', douyin: '抖音' };
export function DailyReportPage() {
  const { metrics, channelMetrics } = useCockpitData();
  const leader = [...channelMetrics].sort((a, b) => b.gmv - a.gmv)[0];
  const conversion = (metrics.conversionRate * 100).toFixed(2);
  return <section id="daily-report" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">结论式日报 · 模拟数据</p><h2>每日经营日报</h2><p>将数据转化为可执行的今日工作清单。</p></div></div>
    <div className="report-grid">
      <article className="panel report-card"><span className="report-index">01</span><h3>昨天发生什么</h3><p><b>GMV ¥{metrics.gmv.toLocaleString()}</b>，产生 {metrics.paidOrders.toLocaleString()} 笔支付订单，支付转化率 {conversion}% 。</p><p>贡献最高渠道：<b>{leader ? channelNames[leader.channel] : '无数据'}</b>。</p></article>
      <article className="panel report-card"><span className="report-index">02</span><h3>为什么需要关注</h3><p>当前数据由三渠道的统一口径汇总；需优先检查库存风险、转化变化和采集失败，避免将缺失数据误判为业务下降。</p></article>
      <article className="panel report-card"><span className="report-index">03</span><h3>今天建议做什么</h3><ol data-testid="recommended-actions"><li>处理高优先级库存异常，确认补货或限售安排。</li><li>查看转化异常的 SKU 与渠道明细。</li><li>复核失败采集任务后再导出经营报表。</li></ol></article>
    </div>
  </section>;
}
