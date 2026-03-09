import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <div className="dark bg-[#0F172A] min-h-screen font-['Inter',sans-serif]">
      <RouterProvider router={router} />
    </div>
  );
}
