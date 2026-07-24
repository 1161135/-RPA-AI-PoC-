import { AppShell } from './components/AppShell';
import { CockpitProvider } from './hooks/useCockpitData';
import { DailyReportPage } from './pages/DailyReportPage';
import { OverviewPage } from './pages/OverviewPage';
import { ProductAnalysisPage } from './pages/ProductAnalysisPage';
import { TasksPage } from './pages/TasksPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { IntegrationPage } from './pages/IntegrationPage';
import { CompetitorPricePage } from './pages/CompetitorPricePage';
import { OrderServicePage } from './pages/OrderServicePage';
import { CreativeCompliancePage } from './pages/CreativeCompliancePage';
import { useCockpitContext } from './hooks/useCockpitData';
import { sourceRows } from './data/mock-data';
import { downloadCsv, generatePowerBiCsv } from './services/export';
import './styles/polish.css';

function CockpitPages() {
  const { filters } = useCockpitContext();
  const exportCurrentReport = () => downloadCsv(
    generatePowerBiCsv(sourceRows, filters),
    'rpa-cockpit-current-report.csv',
  );

  return <AppShell onExport={exportCurrentReport}>
    <OverviewPage />
    <DailyReportPage />
    <AnomaliesPage />
    <ProductAnalysisPage />
    <TasksPage />
    <IntegrationPage />
    <CompetitorPricePage />
    <OrderServicePage />
    <CreativeCompliancePage />
  </AppShell>;
}

export default function App() {
  return <CockpitProvider><CockpitPages /></CockpitProvider>;
}
