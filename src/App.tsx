import { AppShell } from './components/AppShell';
import { CockpitProvider } from './hooks/useCockpitData';

function DashboardPlaceholder() {
  return (
    <section className="page-heading" aria-label="经营总览内容区域">
      <p className="eyebrow">运营自动化 · 演示环境</p>
      <h2>经营总览</h2>
      <p>正在加载统一经营数据与异常规则。</p>
    </section>
  );
}

export default function App() {
  return (
    <CockpitProvider>
      <AppShell>
        <DashboardPlaceholder />
      </AppShell>
    </CockpitProvider>
  );
}
