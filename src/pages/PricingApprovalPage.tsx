import { useState } from 'react';
import type { Role } from '../domain/types';

type ApprovalStatus = '待审批' | '已批准' | '待外部执行' | '外部执行已打卡';

export function PricingApprovalPage({ role = 'manager' }: { role?: Role }) {
  const [status, setStatus] = useState<ApprovalStatus>('待审批');
  const [history, setHistory] = useState<string[]>([]);
  const [platform, setPlatform] = useState('抖音');
  const [actualPrice, setActualPrice] = useState('100');
  const [evidenceRef, setEvidenceRef] = useState('ticket-101');
  const canApprove = role === 'manager';
  const canExecute = role !== 'executive';
  return <section id="pricing-approval" className="page-section"><div className="page-heading"><div><p className="eyebrow">人工审批 · 价格安全阀</p><h2>调价建议审批工作台</h2><p>建议价必须经主管审批与人工外部执行；系统不自动改价，也不写入任何平台。</p></div></div><div className="review-grid"><article className="panel"><h3>待审批建议</h3><p><b>SKU-101 · 抖音</b></p><p>竞品降价 14.3% · 高风险 · SLA 24 小时</p><div className="formula"><b>建议价</b><p>¥100 · 毛利保底策略 · 预计毛利率 20%</p></div></article><article className="panel"><h3>趋势与影响</h3><div className="lead-funnel"><span>当前价<b>¥110</b></span><span>竞品低价<b>¥90</b></span><span>目标价<b>¥105</b></span><span>建议价<b>¥100</b></span></div><p className="risk-text">静态增量毛利影响：-¥700 / 7 天（模拟测算）；未建模销量弹性。</p><p data-testid="pricing-status" className="status-tag">{status}</p><div className="formula"><b>审计历史</b>{history.length ? history.map((item) => <p key={item}>{item}</p>) : <p>尚未审批</p>}</div></article><article className="panel"><h3>审批与执行</h3>{canApprove && <button disabled={status !== '待审批'} onClick={() => { setStatus('已批准'); setHistory((value) => [...value, 'manager_approved: 毛利安全阀通过']); }}>主管批准</button>}{canExecute && <button className="secondary-button" disabled={status !== '已批准'} onClick={() => { setStatus('待外部执行'); setHistory((value) => [...value, 'ready_for_external_execution']); }}>提交外部执行</button>}{canExecute && <><label className="field-label">执行平台<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option>抖音</option><option>淘宝/天猫</option><option>京东</option></select></label><label className="field-label">实际执行价<input aria-label="实际执行价格" value={actualPrice} onChange={(event) => setActualPrice(event.target.value)} /></label><label className="field-label">凭证编号<input aria-label="调价凭证编号" value={evidenceRef} onChange={(event) => setEvidenceRef(event.target.value)} /></label><button className="secondary-button" disabled={status !== '待外部执行'} onClick={() => { setStatus('外部执行已打卡'); setHistory((value) => [...value, `external_price_execution:${platform}:${actualPrice}:${evidenceRef}`]); }}>外部执行打卡</button></>}<p className="audit-history">打卡记录执行平台、实际价格和凭证编号；PoC 不上传截图文件、不调用平台改价接口。</p></article></div></section>;
}
