import { useState } from 'react';
import { useLeadRadar } from '../hooks/useLeadRadar';

const draftText = '可先关注日常用眼习惯与产品说明信息；本文仅为健康科普信息，不构成医疗建议，如有不适请咨询专业人士。';

export function LeadReviewWorkbenchPage() {
  const { leads, selectedId, setSelectedId } = useLeadRadar();
  const [status, setStatus] = useState<'待审核' | '待外部执行' | '外部执行已打卡'>('待审核');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0];
  const copyDraft = () => { setCopied(true); setHistory((items) => [...items, 'draft_copy_prepared: 已准备人工外部发送草稿']); };
  return <section id="lead-review" className="page-section"><div className="page-heading"><div><p className="eyebrow">人工终审 · 全程留痕</p><h2>合规审核工作台</h2><p>AI 仅生成脱敏科普草稿；系统不自动发布、不保存平台账号信息。</p></div></div><div className="review-grid"><article className="panel review-queue"><h3>线索队列</h3>{leads.map((lead) => <button className={lead.id === selected.id ? 'selected' : ''} key={lead.id} onClick={() => { setSelectedId(lead.id); setCopied(false); }}><b>{lead.channel}</b><span>{lead.comment}</span><small>{lead.riskLevel === 'strong_block' ? '强拦截' : lead.priority === 'high' ? '高意向' : '待审核'}</small></button>)}</article><article className="panel"><h3>线索上下文</h3><p data-testid={`lead-status-${selected.id}`} className="status-tag">{status}</p><p className="review-comment">“{selected.comment}”</p><div className="formula"><b>命中词</b><p>{selected.matchedTerms.join('、') || '相关主题'}</p></div><div className="formula"><b>模型匹配度</b><p>89% · 仅用于运营排序，不构成医学判断</p></div><div className="formula"><b>操作历史</b>{history.length ? history.map((item) => <p key={item}>{item}</p>) : <p>尚未发生状态流转</p>}</div></article><article className="panel"><h3>AI 科普草稿与审核</h3><textarea aria-label="AI 科普草稿" value={draftText} readOnly /><p className="risk-text">{selected.riskLevel === 'strong_block' ? '命中强拦截：禁止确认发送，需药师/法务改写。' : '预警提示：草稿须经人工审核后由获授权人员在外部平台执行。'}</p><button disabled={selected.riskLevel === 'strong_block'} onClick={() => { setStatus('待外部执行'); setHistory((items) => [...items, 'approved: 人工确认完成']); }}>人工确认</button><button className="secondary-button" onClick={copyDraft}>复制草稿</button>{copied && <p className="audit-history">已准备复制内容，请由人工在获授权的外部客户端完成发送。</p>}<button className="secondary-button" disabled={status !== '待外部执行'} onClick={() => { setStatus('外部执行已打卡'); setHistory((items) => [...items, 'external_action_logged: 已由运营人工执行']); }}>外部动作打卡</button></article></div></section>;
}
