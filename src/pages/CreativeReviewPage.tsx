import { useState } from 'react';
import { creativeDraftFixtures, creativeTemplateFixtures } from '../data/creativeFixtures';
import { useCockpitContext } from '../hooks/useCockpitData';
import { applyLowRiskRewrite, appendPublicDisclaimer, evaluateCreative } from '../services/creativeRules';
import { canTransition } from '../services/creativeWorkflow';

export function CreativeReviewPage() {
  const { role } = useCockpitContext();
  const [drafts, setDrafts] = useState(creativeDraftFixtures);
  const [selectedId, setSelectedId] = useState('creative-product-101');
  const selected = drafts.find((item) => item.id === selectedId) ?? drafts[0];
  const diagnosis = evaluateCreative(selected.body, selected.channel);
  const rewrite = () => setDrafts((items) => items.map((item) => item.id === selected.id ? { ...item, body: item.track === 'public_communication' ? appendPublicDisclaimer(applyLowRiskRewrite(item.body)) : applyLowRiskRewrite(item.body), risk: diagnosis.risk === 'warning' ? 'notice' : item.risk } : item));
  const useTemplate = () => setDrafts((items) => items.map((item) => item.id === selected.id ? { ...item, body: creativeTemplateFixtures[0].body, status: 'editing', history: [...item.history, { at: '2026-07-27T10:30:00Z', by: 'operator', action: 'template_reused', note: '模板复用后需重新全量审核', knowledgeBaseVersion: item.knowledgeBase.version }] } : item));
  const submitReview = () => {
    if (!canTransition(role, selected, 'pending_review')) return;
    setDrafts((items) => items.map((item) => item.id === selected.id ? { ...item, status: 'pending_review', history: [...item.history, { at: '2026-07-27T10:40:00Z', by: role, action: 'submitted_for_review', note: '已重新触发规则检测并提交审核', knowledgeBaseVersion: item.knowledgeBase.version }] } : item));
  };
  const canSubmit = role !== 'executive' && selected.risk !== 'block' && canTransition(role, selected, 'pending_review');
  return <section id="creative-review" className="page-section"><div className="page-heading"><div><p className="eyebrow">模拟草稿 · 人工终审 · 不自动发布</p><h2>素材审核工作台</h2><p>商品内容与公域沟通共用合规引擎；知识来源、规则命中与人工操作均可追溯。</p></div></div><div className="dashboard-grid"><article className="panel"><h3>草稿队列</h3><div className="work-queue">{drafts.map((item) => <button key={item.id} className={item.id === selected.id ? 'queue-item selected' : 'queue-item'} onClick={() => setSelectedId(item.id)}><b>{item.track === 'product' ? '商品内容' : '公域沟通'} · {item.id}</b><span>{item.channel} · {item.risk}</span><small>{item.status}</small></button>)}</div></article><article className="panel"><h3>草稿编辑与诊断</h3><textarea aria-label="素材草稿" value={selected.body} readOnly /><p>知识库版本：{selected.knowledgeBase.version} · {selected.knowledgeBase.scope}</p><div className="formula"><b>规则诊断</b><p>风险：{diagnosis.risk} · 命中：{diagnosis.terms.join('、') || '无'}</p></div>{role !== 'executive' && <div className="transition-actions"><button onClick={rewrite}>应用低风险改写</button><button className="secondary-button" onClick={useTemplate}>复用合规模板</button>{canSubmit && <button className="secondary-button" onClick={submitReview}>提交审核</button>}</div>}{selected.risk === 'block' && <p className="risk-text">强拦截阻断：必须人工改写并重新检测，不能提交审核或跳过终审。</p>}<p className="risk-text">本系统不自动发布。</p></article></div></section>;
}
