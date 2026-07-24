import { AppShell } from './components/AppShell';
import { CockpitProvider } from './hooks/useCockpitData';
import { DailyReportPage } from './pages/DailyReportPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProductAnalysisPage } from './pages/ProductAnalysisPage';
import { TasksPage } from './pages/TasksPage';

export default function App() {
  return <CockpitProvider><AppShell>
    <OverviewPage />
    <DailyReportPage />
    <ProductAnalysisPage />
    <TasksPage />
  </AppShell></CockpitProvider>;
}
