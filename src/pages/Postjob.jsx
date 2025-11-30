import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [activeQuick, setActiveQuick] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const sampleProfessionals = [
    { name: 'Alice', skills: ['react','node','design'], hourly: 30 },
    { name: 'Bob', skills: ['wordpress','php','design'], hourly: 20 },
    { name: 'Carlos', skills: ['mobile','react-native','design'], hourly: 28 },
    { name: 'Diana', skills: ['writing','seo','marketing'], hourly: 18 },
    { name: 'Eve', skills: ['plumbing','electrical','tiling'], hourly: 15 },
  ];

  const keywords = `${title} ${description}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  const estimatedMatches = (() => {
    if (keywords.length === 0) return sampleProfessionals.length;
    return sampleProfessionals.filter(p => p.skills.some(s => keywords.includes(s))).length;
  })();

  const [suggestedBudgetMin, suggestedBudgetMax] = (() => {

    const matched = sampleProfessionals.filter(p => p.skills.some(s => keywords.includes(s)));
    const pool = matched.length ? matched : sampleProfessionals;
    const avg = Math.round(pool.reduce((s, p) => s + p.hourly, 0) / pool.length || 20);
    
    return [avg * 10, avg * 40];
  })();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user")) || {};
    const userRole = u && u.role ? String(u.role).toLowerCase() : null;
    if (u && userRole === "handyman") {
      alert("Handymen cannot post jobs. Only clients can post jobs. Please contact support if you believe this is an error.");
      navigate("/");
    } else {
      setUser(u);
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const currentUser = user || {};
    jobs.push({ 
      title, 
      description, 
      price: `$${price}`, 
      postedBy: currentUser.name || currentUser.email || 'Anonymous',
      status: "active" 
    });
    localStorage.setItem("jobs", JSON.stringify(jobs));
    alert("Job posted successfully!");
    navigate("/");
  };

 

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto p-6">
        
        <div className="glass-card p-8 rounded-3xl bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-white/20 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Post a New Job 📝
            </h1>
            <p className="text-white/70 text-lg">
              Create a job posting and connect with talented professionals
            </p>
          </div>
        </div>

       
        <div className="glass-card p-8 rounded-2xl bg-linear-to-br from-indigo-600/10 to-purple-600/10 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-black font-semibold mb-2">
                Job Title *
              </label>
              <input 
                type="text"
                placeholder="e.g., Website Development, Logo Design, Content Writing"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="input-field w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-black placeholder-black/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300" 
                required 
              />
            </div>

            
            <div>
              <label className="block text-black font-semibold mb-2">
                Job Description *
              </label>
              <textarea 
                placeholder="Describe the job requirements, skills needed, and project details..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={6}
                className="input-field w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-black placeholder-black/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 resize-none" 
                required 
              />
            </div>

            
            <div>
              <label className="block text-white font-semibold mb-2">
                Budget (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/70 font-semibold">
                  $
                </span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className="input-field w-full pl-8 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300" 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-black font-semibold mb-2">
                Job Category
              </label>
              <select className="input-field w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-black focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300">
                <option value="" className="bg-slate-800">Select a category</option>
                <option value="web-development" className="bg-slate-800">Web Development</option>
                <option value="mobile-development" className="bg-slate-800">Mobile Development</option>
                <option value="design" className="bg-slate-800">Design & Creative</option>
                <option value="writing" className="bg-slate-800">Writing & Content</option>
                <option value="marketing" className="bg-slate-800">Marketing</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
            </div>

            
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg"
              >
                🚀 Post Job Now
              </button>
            </div>
          </form>

          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div role="button" tabIndex={0} onClick={() => setActiveQuick('quick')} onKeyDown={(e) => { if (e.key === 'Enter') setActiveQuick('quick'); }} className="cursor-pointer p-4 rounded bg-white/5 hover:bg-white/10 transition">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-white/80">Quick Posting</p>
              </div>

              <div role="button" tabIndex={0} onClick={() => setActiveQuick('quality')} onKeyDown={(e) => { if (e.key === 'Enter') setActiveQuick('quality'); }} className="cursor-pointer p-4 rounded bg-white/5 hover:bg-white/10 transition">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm text-white/80">Quality Matches</p>
              </div>

              <div role="button" tabIndex={0} onClick={() => setActiveQuick('professional')} onKeyDown={(e) => { if (e.key === 'Enter') setActiveQuick('professional'); }} className="cursor-pointer p-4 rounded bg-white/5 hover:bg-white/10 transition">
                <div className="text-2xl mb-2">💼</div>
                <p className="text-sm text-white/80">Professional Results</p>
              </div>
            </div>

            {activeQuick && (
              <div className="mt-4 p-4 rounded bg-white/5 border border-white/10 text-left">
                {activeQuick === 'quick' && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Quick Posting Tips</h4>
                    <ul className="list-disc list-inside text-sm text-white/80">
                      <li>Be specific: include deliverables, expected timeline and skills required.</li>
                      <li>Use clear titles — e.g., "React e-commerce site" instead of "Website".</li>
                      <li>Set a realistic budget and payment terms to attract qualified applicants.</li>
                    </ul>
                    <div className="mt-3 text-sm text-white/70">Title length: <strong className="text-white">{title.length}</strong> chars · Description length: <strong className="text-white">{description.length}</strong> chars</div>
                  </div>
                )}

                {activeQuick === 'quality' && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Estimated Matches</h4>
                    <p className="text-sm text-white/80">Based on your title & description, we estimate <strong className="text-white">{estimatedMatches}</strong> professionals match these skills.</p>
                    <div className="mt-3 text-sm text-white/70">Suggested next steps: review applicants' profiles, ask for samples, and set short trial milestones.</div>
                  </div>
                )}

                {activeQuick === 'professional' && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Improve Professional Results</h4>
                    <ul className="list-disc list-inside text-sm text-white/80">
                      <li>Request portfolios and prior work relevant to your industry.</li>
                      <li>Offer clear acceptance criteria and success metrics.</li>
                      <li>Consider offering milestone payments to reduce risk and increase quality.</li>
                    </ul>
                    <div className="mt-3 text-sm text-white/70">Estimated fair budget range: <strong className="text-white">${suggestedBudgetMin} — ${suggestedBudgetMax}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
