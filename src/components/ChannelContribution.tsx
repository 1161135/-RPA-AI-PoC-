import type { ChannelMetric } from '../hooks/useCockpitData';

const names = { tmall: '淘宝/天猫', jd: '京东', douyin: '抖音' };
export function ChannelContribution({ channels, totalGmv }: { channels: ChannelMetric[]; totalGmv: number }) {
  return <div className="contribution-list" aria-label="渠道 GMV 贡献">
    {channels.map((item) => {
      const percentage = totalGmv === 0 ? 0 : (item.gmv / totalGmv) * 100;
      return <div className="contribution" key={item.channel}><div><b>{names[item.channel]}</b><span>¥{item.gmv.toLocaleString()} · {percentage.toFixed(1)}%</span></div><div className="bar"><i className={item.channel} style={{ width: `${percentage}%` }} /></div><strong>{percentage.toFixed(1)}%</strong></div>;
    })}
  </div>;
}
