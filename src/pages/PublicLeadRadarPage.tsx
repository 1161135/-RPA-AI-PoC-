import { leadAdapters } from '../adapters/leadAdapters';
import { useLeadRadar } from '../hooks/useLeadRadar';

const channelLabel = { douyin: '抖音', tmall: '淘宝/天猫', jd: '京东' };

export function PublicLeadRadarPage() {
  const { leads, setSelectedId } = useLeadRadar();
  const highPriority = leads.filter((lead) => lead.priority === 'high' || lead.priority === 'medium');
  const blocked = leads.filter((lead) => lead.riskLevel === 'strong_block');
  return <section id="public-lead-radar" className="page-section lead-radar-page">
    <div className="page-heading"><div><p className="eyebrow">核心能力 · 低门槛合规接入</p><h2>公域需求雷达</h2><p>仅展示模拟脱敏数据或已获准导入样本；不自动采集、不自动发布。</p></div><span className="lead-source-label">模拟脱敏数据 · 本地演示</span></div>
    <div className="lead-kpis">
      <article><small>今日命中需求</small><b>{leads.length}</b><span>导入样本识别</span></article><article><small>待审核 / 高意向</small><b>{highPriority.length}</b><span>人工确认后处理</span></article><article><small>合规强拦截</small><b>{blocked.length}</b><span>禁止进入发送流程</span></article><article><small>平均承接时效</small><b>12 分钟</b><span>模拟测算</span></article>
    </div>
    <div className="dashboard-grid"><article className="panel"><div className="panel-header"><div><h3>需求雷达与高优先级队列</h3><p>症状、需求、决策词共同决定运营排序；相似表达仅提示人工核查。</p></div></div>{highPriority.map((lead) => <div className="lead-queue" key={lead.id}><div><b>{channelLabel[lead.channel]} · {lead.intent === 'price_sensitive' ? '价格敏感需求' : '明确需求'}</b><p>{lead.comment}</p></div><button onClick={() => { setSelectedId(lead.id); window.location.hash = '#lead-review'; }}>查看高优先级线索</button></div>)}</article>
      <article className="panel"><div className="panel-header"><div><h3>渠道接入与降级状态</h3><p>实时、快照与模拟来源清晰区分，缺失数据不记为 0。</p></div></div>{leadAdapters.map((adapter) => <div className="adapter-row" key={adapter.channel}><b>{channelLabel[adapter.channel]}</b><span>{adapter.dataMode === 'realtime' ? '官方 API 已授权' : adapter.dataMode === 'snapshot_24h' ? '24 小时快照' : '客户本地人工辅助'}</span><small>{adapter.lastSuccessfulAt} · {adapter.noticePreview}</small></div>)}</article></div>
    <article className="panel funnel-panel"><div className="panel-header"><div><h3>获客运营漏斗</h3><p>从样本到人工跟进，保留被过滤、强拦截和人工忽略的原因。</p></div></div><div className="lead-funnel"><span>导入记录<br /><b>{leads.length}</b></span><span>有效识别<br /><b>{leads.filter((lead) => lead.priority !== 'filtered').length}</b></span><span>待审核<br /><b>{highPriority.length}</b></span><span>强拦截<br /><b>{blocked.length}</b></span><span>人工跟进<br /><b>0</b></span></div></article>
  </section>;
}
