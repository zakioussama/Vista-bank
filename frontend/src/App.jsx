import { useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return <AppRoutes />;
}

export default App;
