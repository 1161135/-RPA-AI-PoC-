import { useState } from 'react';

export function CreativeCompliancePage() {
  const [generated, setGenerated] = useState(false);
  return <section id="creative-compliance" className="page-section">
    <div className="page-heading"><div><p className="eyebrow">二期能力演示 · 生成内容仅为模拟草稿</p><h2>AI 素材生成与合规审核</h2><p>AI 提供图文和短视频脚本初稿，敏感词规则与人工终审共同把关。</p></div><button className="export-button" onClick={() => setGenerated(true)}>生成模拟素材 <span>✦</span></button></div>
    <div className="dashboard-grid"><article className="panel"><div className="panel-header"><div><h3>素材草稿工作台</h3><p>选择商品卖点后生成可编辑初稿，不直接发布到任何平台。</p></div></div>{generated ? <div className="creative-draft"><b>短视频脚本 · 夏季家庭常备</b><p>开场：展示居家收纳场景；中段：说明产品适用信息与使用提示；结尾：引导用户查看官方商品详情。</p><small>模拟生成结果，仅供运营编辑。</small></div> : <div className="empty-state">点击“生成模拟素材”，演示 AI 初稿与审核流程。</div>}</article><article className="panel"><div className="panel-header"><div><h3>合规关键词审核</h3><p>行业规则包用于提示风险，不能替代人工药师或合规人员判断。</p></div></div><div className="formula"><h4>命中提示</h4><p><span className="risk-text">“治疗”“根治”“绝对有效”</span> 等宣传表达需要人工改写或复核。</p></div><div className="formula" style={{ marginTop: 12 }}><h4>发布边界</h4><p>规则初筛 → 运营修改 → 合规关键词审核 → <b>人工终审</b> → 人工发布。PoC 不自动发布素材。</p></div></article></div>
  </section>;
}
