import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import PremiumGuard from "../components/PremiumGuard";

export default function Analytics() {
  // Simple analytics demo page — you can replace with real charts later
  const sampleStats = [
    { title: 'Total Views', value: '12,345' },
    { title: 'Clicks', value: '3,210' },
    { title: 'Conversion', value: '4.8%' },
    { title: 'Revenue', value: '$4,320' },
  ];

  return (
    <Layout>
      <div className="w-full max-w-none mx-0 px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <PremiumGuard feature="analytics dashboard">
          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white text-black border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
            <Link to="/" className="text-sm text-slate-600 hover:text-black">← Back to dashboard</Link>
          </div>

          <p className="text-sm text-slate-600 mb-4">Overview of your recent performance. Replace these placeholders with real charts and metrics when ready.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleStats.map((s) => (
              <div key={s.title} className="p-4 bg-slate-50 rounded-lg border border-gray-100">
                <div className="text-sm text-slate-500">{s.title}</div>
                <div className="text-xl font-bold text-slate-900 mt-2">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="h-48 bg-slate-50 border border-gray-100 rounded-lg flex items-center justify-center text-slate-400">Chart placeholder</div>
          </div>
          </div>
        </PremiumGuard>
      </div>
    </Layout>
  );
}
