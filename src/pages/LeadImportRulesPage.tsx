import { useState } from 'react';
import { leadRuleVersions, publicLeadKeywordGroups } from '../data/leadRadarFixtures';

export function LeadImportRulesPage() {
  const [rollbackPreview, setRollbackPreview] = useState(false);
  return <section id="lead-rules" className="page-section"><div className="page-heading"><div><p className="eyebrow">本地解析 · 规则可追溯</p><h2>导入与规则中心</h2><p>仅导入已脱敏、已获准使用的 CSV 样本；文件只在浏览器本地处理。</p></div></div><div className="dashboard-grid"><article className="panel"><h3>导入脱敏样本</h3><label className="file-drop">选择 CSV 文件<input aria-label="导入脱敏 CSV" type="file" accept=".csv,text/csv" /><small>手机号、邮箱等可识别信息将被拒绝；仅对日期格式提供修正预览。</small></label></article><article className="panel"><h3>规则版本与回滚</h3>{leadRuleVersions.map((version) => <div className="adapter-row" key={version.id}><b>{version.id}</b><span>{version.status === 'current' ? '当前生效' : '历史版本'}</span><small>{version.note}</small></div>)}<button className="secondary-button" onClick={() => setRollbackPreview(true)}>预览回滚至 v1.0</button>{rollbackPreview && <p className="risk-text">规则回滚预览：主管确认后才会生效并留痕。</p>}</article></div><article className="panel"><h3>关键词与合规分流</h3><div className="keyword-grid">{Object.entries(publicLeadKeywordGroups).map(([kind, values]) => <div key={kind}><b>{kind}</b><p>{values.join('、')}</p></div>)}</div></article></section>;
}
