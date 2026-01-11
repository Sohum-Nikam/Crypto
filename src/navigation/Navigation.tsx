import { Routes, Route } from 'react-router-dom';

// components
import AuthGuard from '../utils/auth-guard';

// pages
import MarketScreen from '../screens/Market/MarketScreen';
import SigninScreen from '../screens/Members/SigninScreen';
import SignupScreen from '../screens/Members/SignupScreen';
import ForgotScreen from '../screens/Members/ForgotScreen';
import PasswordResetScreen from '../screens/Members/PasswordResetScreen';
import ProfileScreen from '../screens/Members/ProfileScreen';
import CapitalScreen from '../screens/Capital/CapitalScreen';
import NotFoundScreen from '../screens/NotFound/NotFoundScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';

const Navigation: React.FC = () => (
  <Routes>
    {/* Public routes */}
    <Route path='/' element={
      <AuthGuard requireAuth={false}>
        <SigninScreen />
      </AuthGuard>
    } />
    <Route path='/members/signup' element={
      <AuthGuard requireAuth={false}>
        <SignupScreen />
      </AuthGuard>
    } />
    <Route path='/members/forgot-password' element={
      <AuthGuard requireAuth={false}>
        <ForgotScreen />
      </AuthGuard>
    } />
    <Route path='/members/password-reset' element={
      <AuthGuard requireAuth={false}>
        <PasswordResetScreen />
      </AuthGuard>
    } />
    
    {/* Protected routes */}
    <Route path='/market' element={
      <AuthGuard requireAuth={true}>
        <MarketScreen />
      </AuthGuard>
    } />
    <Route path='/members' element={
      <AuthGuard requireAuth={true}>
        <ProfileScreen />
      </AuthGuard>
    } />
    <Route path='/capital' element={
      <AuthGuard requireAuth={true}>
        <CapitalScreen />
      </AuthGuard>
    } />
    <Route path='/dashboard' element={
      <AuthGuard requireAuth={true}>
        <DashboardScreen />
      </AuthGuard>
    } />
    <Route path='/transactions' element={
      <AuthGuard requireAuth={true}>
        <TransactionsScreen />
      </AuthGuard>
    } />
    
    <Route path='*' element={<NotFoundScreen />} />
  </Routes>
);

export default Navigation;
