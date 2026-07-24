import { canTransitionAnomaly, type Anomaly, type AnomalyStatus, type Role } from '../domain/types';

const statusLabels: Record<AnomalyStatus, string> = {
  pending: '待处理', in_progress: '处理中', resolved: '已解决', ignored: '已忽略',
};

type AnomalyListProps = {
  anomalies: Anomaly[];
  role: Role;
  onTransition: (anomaly: Anomaly, status: AnomalyStatus) => void;
  onAssign: (anomaly: Anomaly) => void;
};

export function AnomalyList({ anomalies, role, onTransition, onAssign }: AnomalyListProps) {
  const transitionLabel = (status: AnomalyStatus) => ({
    in_progress: '开始处理', resolved: '标记已解决', ignored: '忽略异常', pending: '待处理',
  })[status];

  return <div className="anomaly-list" aria-label="异常列表">
    {anomalies.map((anomaly) => <article className="anomaly-row anomaly-card" key={anomaly.id}>
      <span className={`severity ${anomaly.severity}`}>{anomaly.severity === 'high' ? '高' : '中'}</span>
      <span className="anomaly-content">
        <b>{anomaly.type} · {anomaly.title}</b>
        <small>{anomaly.detail}</small>
        {anomaly.source === 'preset' && <small>预置模拟规则触发</small>}
        <small>负责人：{anomaly.owner} · <i data-testid={`anomaly-status-${anomaly.id}`} className={`status-tag status-${anomaly.status}`}>{statusLabels[anomaly.status]}</i></small>
        <details className="audit-history"><summary>操作历史（{anomaly.history.length}）</summary>{anomaly.history.length === 0 ? <small>尚无人工处理记录</small> : anomaly.history.map((record) => <small key={`${record.at}-${record.status}`}>{new Date(record.at).toLocaleString('zh-CN', { hour12: false })} · {record.by} · {statusLabels[record.status]} · 处理方式：{record.method ?? '人工复核'} · {record.note}</small>)}</details>
      </span>
      <em>{anomaly.recommendation}</em>
      {role === 'manager' && <button onClick={() => onAssign(anomaly)}>分配负责人</button>}
      {(['in_progress', 'resolved', 'ignored'] as AnomalyStatus[]).filter((next) => canTransitionAnomaly(role, anomaly.status, next)).map((next) => <button key={next} onClick={() => onTransition(anomaly, next)}>{next === 'in_progress' && (anomaly.status === 'resolved' || anomaly.status === 'ignored') ? '重新打开' : transitionLabel(next)}</button>)}
    </article>)}
  </div>;
}
