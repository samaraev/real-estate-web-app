import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { I18nProvider } from '@/i18n';
import { AccountProvider } from '@/lib/AccountContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import ListingDetail from './pages/ListingDetail';
import ListingEditor from './pages/ListingEditor';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import SavedSearches from './pages/SavedSearches';
import Messages from './pages/Messages';
import Viewings from './pages/Viewings';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Mortgage from './pages/Mortgage';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import Rent from './pages/Rent';
import LeaseDetail from './pages/LeaseDetail';
import InvoiceDetail from './pages/InvoiceDetail';
import RentJoin from './pages/RentJoin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AccountProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/listings/new" element={<ListingEditor />} />
          <Route path="/listings/:id/edit" element={<ListingEditor />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/viewings" element={<Viewings />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/rent/leases/:id" element={<LeaseDetail />} />
          <Route path="/rent/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/rent/join/:id" element={<RentJoin />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mortgage" element={<Mortgage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal/:page" element={<Legal />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </AccountProvider>
  );
};

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App