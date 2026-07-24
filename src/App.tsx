import { AppShell } from './components/AppShell';
import { CockpitProvider } from './hooks/useCockpitData';
import { DailyReportPage } from './pages/DailyReportPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProductAnalysisPage } from './pages/ProductAnalysisPage';
import { TasksPage } from './pages/TasksPage';
import { AnomaliesPage } from './pages/AnomaliesPage';

export default function App() {
  return <CockpitProvider><AppShell>
    <OverviewPage />
    <DailyReportPage />
    <AnomaliesPage />
    <ProductAnalysisPage />
    <TasksPage />
  </AppShell></CockpitProvider>;
}
