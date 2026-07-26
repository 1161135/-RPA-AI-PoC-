import { useState } from 'react';
import { useLeadRadar } from '../hooks/useLeadRadar';

export function LeadReviewWorkbenchPage() {
  const { leads, selectedId, setSelectedId } = useLeadRadar();
  const [checkedIn, setCheckedIn] = useState(false);
  const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0];
  return <section id="lead-review" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">人工终审 · 全程留痕</p><h2>合规审核工作台</h2><p>AI 仅生成脱敏科普草稿；系统不自动发布、不保存平台账号信息。</p></div></div>
    <div className="review-grid"><article className="panel review-queue"><h3>线索队列</h3>{leads.map((lead) => <button className={lead.id === selected.id ? 'selected' : ''} key={lead.id} onClick={() => setSelectedId(lead.id)}><b>{lead.channel}</b><span>{lead.comment}</span><small>{lead.riskLevel === 'strong_block' ? '强拦截' : lead.priority === 'high' ? '高意向' : '待审核'}</small></button>)}</article>
      <article className="panel"><h3>线索上下文</h3><p className="review-comment">“{selected.comment}”</p><div className="formula"><b>命中词</b><p>{selected.matchedTerms.join('、') || '相关主题'}</p></div><div className="formula"><b>模型匹配度</b><p>89% · 仅用于运营排序，不构成医学判断</p></div><div className="formula"><b>相似内容提示</b><p>仅提示人工核查，不跨平台关联身份或自动合并。</p></div></article>
      <article className="panel"><h3>AI 科普草稿与审核</h3><textarea aria-label="AI 科普草稿" defaultValue="可先关注日常用眼习惯与产品说明信息；本文仅为健康科普信息，不构成医疗建议，如有不适请咨询专业人士。" /><p className="risk-text">{selected.riskLevel === 'strong_block' ? '命中强拦截：禁止确认发送，需药师/法务改写。' : '预警提示：草稿须经人工审核后由获授权人员在外部平台执行。'}</p><button disabled={selected.riskLevel === 'strong_block'}>人工确认</button><button className="secondary-button">复制草稿</button><button className="secondary-button" onClick={() => setCheckedIn(true)}>外部动作打卡</button>{checkedIn && <div className="formula"><b>外部执行已打卡</b><p>请填写执行渠道、人工动作和说明后留痕；本 PoC 不连接真实发送能力。</p></div>}</article></div>
  </section>;
}
