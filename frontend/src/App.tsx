import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Prompts } from './pages/Prompts';
import { Schedule } from './pages/Schedule';

// Placeholder components
const Queue = () => <div>Queue</div>;
const Posts = () => <div>Posts</div>;
const Analytics = () => <div>Analytics</div>;
const Settings = () => <div>Settings</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
