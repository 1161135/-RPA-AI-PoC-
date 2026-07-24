import { sourceRows } from '../data/mock-data';
import { useAutomationTasks, useCockpitContext } from '../hooks/useCockpitData';
import { downloadCsv, generatePowerBiCsv, POWER_BI_FIELDS } from '../services/export';

const channelNames = { tmall: '淘宝/天猫', jd: '京东', douyin: '抖音' } as const;

export function IntegrationPage() {
  const { filters } = useCockpitContext();
  const tasks = useAutomationTasks();
  const exportCurrentDataset = () => {
    const csv = generatePowerBiCsv(sourceRows, filters);
    downloadCsv(csv, 'rpa-cockpit-power-bi-dataset.csv');
  };

  return <section id="integrations" className="page-section">
    <div className="page-heading">
      <div>
        <p className="eyebrow">数据治理 · 可替换接入层</p>
        <h2>数据接入与行业规则</h2>
        <p>当前为可追溯的模拟、脱敏数据；真实系统接入只替换适配器层，不重写指标、异常和页面逻辑。</p>
      </div>
      <button className="export-button" onClick={exportCurrentDataset}>导出当前筛选数据集 <span>→</span></button>
    </div>

    <div className="dashboard-grid">
      <article className="panel">
        <div className="panel-header"><div><h3>渠道适配器状态</h3><p>演示环境 · 每日 08:30 模拟刷新</p></div></div>
        <div className="anomaly-list" aria-label="渠道适配器状态">
          {tasks.map((task) => <article className="anomaly-row" data-testid={`adapter-${task.channel}`} key={task.id}>
            <span className="severity medium">源</span>
            <span><b>{channelNames[task.channel]}</b><small>模拟适配器 · {task.isFallback ? '采集失败，保留最近一次成功快照，不以 0 覆盖。' : '模拟采集完成，可替换为真实平台适配器。'}</small></span>
            <em><span className="status-tag">{task.isFallback ? '降级/快照' : '已就绪'}</span></em>
          </article>)}
        </div>
      </article>

      <article className="panel">
        <div className="panel-header"><div><h3>医药行业规则包（演示）</h3><p>规则包与通用引擎分离，可按行业替换。</p></div></div>
        <div className="formula">
          <h4>合规复核超时</h4>
          <p>若处方药（Rx）商品的主图或详情页合规复核超过约定时限，生成高优先级异常，提醒人工药师复核；不执行自动下架或发布。</p>
        </div>
        <div className="formula" style={{ marginTop: 12 }}>
          <h4>数据最小化</h4>
          <p>PoC 不采集真实用户信息；导出的统一数据集不包含可识别个人身份的字段。</p>
        </div>
      </article>
    </div>

    <article className="panel" style={{ marginTop: 16 }}>
      <div className="panel-header"><div><h3>Power BI 交付边界</h3><p>PoC 仅交付 CSV、字段字典和连接说明；不承诺嵌入、企业网关、刷新权限或 .pbit 模板。</p></div></div>
      <div className="report-grid" style={{ marginTop: 16 }}>
        <div className="report-card"><span className="report-index">01</span><h3>统一数据集</h3><p>导出遵循当前时间与渠道筛选条件的 CSV，适合作为 Power BI 的受控输入。</p></div>
        <div className="report-card"><span className="report-index">02</span><h3>字段字典</h3><p>{POWER_BI_FIELDS.join('、')}</p></div>
        <div className="report-card"><span className="report-index">03</span><h3>正式接入前提</h3><p>确认平台授权、ERP/WMS 接口、指标口径、Power BI 数据模型及网关/刷新权限后，再实施生产集成。</p></div>
      </div>
    </article>
  </section>;
}
