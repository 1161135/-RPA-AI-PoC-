import { useMemo, useState } from 'react';
import type { TrendPoint } from '../hooks/useCockpitData';

const channels = [
  { id: 'tmall', name: '淘宝/天猫', color: '#2c76e7' },
  { id: 'jd', name: '京东', color: '#35b985' },
  { id: 'douyin', name: '抖音', color: '#9d75ea' },
] as const;

type Props = { data: TrendPoint[] };

export function TrendChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((point) => channels.map(({ id }) => point[id])));
  const paths = useMemo(() => channels.map(({ id }) => {
    const points = data.map((point, index) => {
      const x = data.length < 2 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (point[id] / max) * 90;
      return `${x},${y}`;
    });
    return { id, points: points.join(' ') };
  }), [data, max]);
  const active = activeIndex === null ? null : data[activeIndex];
  return <div className="trend-chart" aria-label="GMV 渠道趋势图">
    <div className="chart-legend" aria-label="渠道图例">{channels.map((channel) => <span key={channel.id}><i style={{ background: channel.color }} />{channel.name}</span>)}</div>
    <div className="chart-y-axis"><span>¥{Math.ceil(max / 1000) * 1000}</span><span>¥{Math.ceil(max / 2000) * 1000}</span><span>¥0</span></div>
    <svg viewBox="0 0 100 105" preserveAspectRatio="none" role="img" aria-label="横轴为日期，纵轴为 GMV 金额（元）">
      {[10, 55, 100].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} className="gridline" />)}
      {paths.map(({ id, points }) => <polyline key={id} points={points} className={`trend-line line-${id}`} />)}
      {data.map((point, index) => <rect key={point.date} x={data.length < 2 ? 0 : (index / (data.length - 1)) * 100 - 5} y="0" width="10" height="105" fill="transparent" onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} />)}
    </svg>
    <div className="chart-x-axis">{data.map((point) => <span key={point.date}>{point.date.slice(5)}</span>)}</div>
    {active && <output className="chart-tooltip">{active.date}{channels.map(({ id, name }) => <span key={id}>{name} ¥{active[id].toLocaleString()}</span>)}</output>}
  </div>;
}
