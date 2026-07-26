import { buildProposal } from '../services/pricingStrategies';
import { detectPriceRisk } from '../services/pricingRules';

const proposal = buildProposal({ strategy: 'margin_floor', cost: 80, marginFloor: 0.2, competitorLow: 90, current: 110, target: 105, averageDailySales: 10, evaluationDays: 7 });
const risk = detectPriceRisk({ price: 90, previousPrice: 105, target: 105, mappingAgeDays: 0 });

export function PricingCommandCenter() {
  return <section id="pricing-command-center" className="page-section lead-radar-page">
    <div className="page-heading"><div><p className="eyebrow">运营自动化中心 · 价格决策辅助</p><h2>竞品价格监控与审批</h2><p>模拟或已授权快照数据用于价格风险研判；系统只生成建议，不自动改价。</p></div><span className="lead-source-label">模拟快照 · 2026-07-26 10:15</span></div>
    <div className="lead-kpis"><article><small>监控 SKU</small><b>128</b><span>含映射关系</span></article><article><small>高风险告警</small><b>3</b><span>24 小时内处理</span></article><article><small>待审批建议</small><b>5</b><span>主管审批后执行</span></article><article><small>潜在毛利影响</small><b>¥{proposal.incrementalMarginImpact.toLocaleString()}</b><span>模拟测算 · 7 天</span></article></div>
    <div className="dashboard-grid"><article className="panel"><h3>高优先级价格风险</h3><div className="lead-queue"><div><b>SKU-101 · 竞品最低价下降 14.3%</b><p>我方 ¥110 · 竞品 ¥90 · 目标 ¥105 · 来源：授权快照</p></div><button onClick={() => { window.location.hash = 'pricing-approval'; }}>查看审批建议</button></div><div className="formula"><b>当前规则结果</b><p>{risk.type} · {risk.severity} · 建议：价格复核并提交主管审批</p></div></article><article className="panel"><h3>建议价与毛利安全阀</h3><div className="formula"><b>毛利保底策略</b><p>成本 ¥80 · 最低毛利率 20% · 建议价 ¥{proposal.suggestedPrice}</p></div><div className="formula"><b>预计毛利率</b><p>{(proposal.marginRate * 100).toFixed(1)}% · {proposal.hardStop ? '穿透毛利红线' : '未触发熔断'}</p></div><p className="risk-text">建议价仅供人工审批；不自动改价、不写入任何平台。</p></article></div>
    <article className="panel funnel-panel"><h3>近 7 天价格趋势（模拟）</h3><div className="lead-funnel"><span>我方价格<b>¥110</b></span><span>竞品最低价<b>¥90</b></span><span>目标价格<b>¥105</b></span><span>建议价格<b>¥100</b></span><span>数据新鲜度<b>2h</b></span></div></article>
  </section>;
}
