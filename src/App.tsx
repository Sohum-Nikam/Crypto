import Navigation from './navigation/Navigation';

// styles
import './styles/site.css';

// contexts
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => (
  <AuthProvider>
    <Navigation />
  </AuthProvider>
);

export default App;
