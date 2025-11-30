import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', bio: '', role: '', avatarDataUrl: '' });
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) || {};
      setUser({ name: u.name || '', email: u.email || '', bio: u.bio || '', role: u.role || '', avatarDataUrl: u.avatarDataUrl || '' });
      setPreview(u.avatarDataUrl || '');
    } catch (e) {
      // ignore
    }
  }, []);

  function handleFile(ev) {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    // process and resize image before storing to reduce size
    processImage(f).then((dataUrl) => {
      setPreview(dataUrl);
      setUser(prev => ({ ...prev, avatarDataUrl: dataUrl }));
    }).catch(err => {
      console.error('Failed to process image', err);
    });
  }

  // resize image to maxDimension (square) and compress to JPEG data URL
  function processImage(file, maxDimension = 512) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const ratio = width / height;
            if (width > height) {
              if (width > maxDimension) {
                width = maxDimension;
                height = Math.round(width / ratio);
              }
            } else {
              if (height > maxDimension) {
                height = maxDimension;
                width = Math.round(height * ratio);
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function removeAvatar() {
    setPreview('');
    setUser(prev => ({ ...prev, avatarDataUrl: '' }));
  }

  // go back to Dashboard (explicit) so Cancel/Back always go to dashboard
  function handleBack() {
    try {
      navigate('/dashboard');
    } catch (e) {
      navigate('/');
    }
  }

  function save(e) {
    e && e.preventDefault();
    const errs = {};
    if (!user.name || user.name.trim().length === 0) errs.name = 'Full name is required.';
    const email = (user.email || '').trim();
    if (email.length > 0) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(email)) errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, name: user.name, email: user.email, bio: user.bio, role: user.role, avatarDataUrl: user.avatarDataUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      // notify app that user changed
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updated }));
      setMsg('Profile saved locally');
      setTimeout(() => { setMsg(null); navigate('/dashboard'); }, 900);
    } catch (err) {
      console.error('Failed to save profile', err);
      setMsg('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#6A0DAD] py-12">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <p className="text-sm text-slate-300">Update your profile details and upload a profile picture. Changes are stored locally in this demo.</p>
          </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input className="w-full p-2 rounded bg-white/5 text-white" value={user.name} onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select className="w-full p-2 rounded bg-white text-black" value={user.role} onChange={(e) => setUser(prev => ({ ...prev, role: e.target.value }))}>
              <option value="">Select role</option>
              <option value="client">Client</option>
              <option value="handyman">Handyman</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea className="w-full p-2 rounded bg-white/5 text-white" rows={3} value={user.bio} onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}></textarea>
          </div>

          <div>
            <label className="block text-sm mb-1">Profile picture</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                {preview ? <img src={preview} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-white/60">No image</div>}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleFile} />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={removeAvatar} className="px-3 py-1 rounded bg-transparent border border-white/10">Remove</button>
                </div>
              </div>
            </div>
          </div>

          {msg && <div className="text-sm text-green-300">{msg}</div>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleBack} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBack(); } }} tabIndex={0} className="px-4 py-2 rounded bg-transparent border border-white/10 cursor-pointer" title="Cancel and return to dashboard" aria-label="Cancel and return to dashboard">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-semibold">{saving ? 'Saving...' : 'Save profile'}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
