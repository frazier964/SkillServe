import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase/FirebaseConfig";
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u) {
        setUser(u);
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }

    try {
      const prefs = JSON.parse(localStorage.getItem("preferences")) || {};
      setNotificationsEnabled(prefs.notifications !== false);
    } catch (e) {
      setNotificationsEnabled(true);
    }
  }, []);

  function saveProfile() {
    const updated = { ...user };
    // persist locally
    try { localStorage.setItem("user", JSON.stringify(updated)); } catch (e) {}
    // persist to Firestore if we have a uid
    (async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}') || {};
        const uid = stored.uid || updated.uid;
        if (uid) {
          await setDoc(doc(db, 'users', uid), { name: updated.name, email: updated.email }, { merge: true });
        }
        alert('Profile saved');
      } catch (e) {
        console.error('Failed to save profile to Firestore', e);
        alert('Profile saved locally, but failed to update server.');
      }
    })();
  }

  function savePreferences() {
    const prefs = { notifications: notificationsEnabled };
    localStorage.setItem("preferences", JSON.stringify(prefs));
    alert("Preferences saved");
  }

  function changePassword(e) {
    e.preventDefault();
    if (!password) {
      alert("Enter a password");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // In a real app we'd call an API; here we just show a message.
    alert("Password changed (demo)");
    setPassword("");
    setConfirmPassword("");
  }

  function deactivateAccount() {
    if (!confirm("Are you sure you want to deactivate your account? This will clear local data.")) return;
    // remove user and related keys
    localStorage.removeItem("user");
    localStorage.removeItem("messages");
    localStorage.removeItem("jobs");
    localStorage.removeItem("preferences");
    alert("Account deactivated (demo). You will be redirected to login.");
    navigate("/login");
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-black/80 text-white rounded-3xl">
        <h1 className="text-2xl font-bold">Account Settings</h1>

        <section className="p-6 rounded-2xl bg-white text-black border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-black">Profile</h2>
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-black mb-1">Full Name</span>
              <input value={user.name || ""} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} className="p-3 rounded-md bg-white border border-gray-300 text-black" />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={saveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save profile</button>
            <button onClick={() => { setUser({ name: "", email: "" }); alert('Reset to blank profile'); }} className="px-4 py-2 bg-white/5 text-white rounded-lg">Reset</button>
          </div>
        </section>

        <section className="glass-card p-6 rounded-2xl bg-linear-to-br from-green-600/10 to-teal-600/10 border border-white/10">
          <h2 className="text-lg font-semibold mb-3">Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Email notifications</p>
              <p className="text-white/70 text-sm">Receive email notifications for messages and updates</p>
            </div>
            <div>
              <label className="inline-flex items-center gap-3">
                <input type="checkbox" checked={notificationsEnabled} onChange={e => setNotificationsEnabled(e.target.checked)} className="w-5 h-5" />
                <span className="text-white/70 text-sm">Enabled</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={savePreferences} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save preferences</button>
          </div>
        </section>

        <section className="glass-card p-6 rounded-2xl bg-linear-to-br from-purple-600/10 to-pink-600/10 border border-white/10">
          <h2 className="text-lg font-semibold mb-3">Security</h2>
          <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="flex flex-col">
                <span className="text-sm text-white/70 mb-1">New password</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="p-3 rounded-md bg-white border border-slate-300 text-black" />
              </label>
            </div>
            <div className="md:col-span-1">
              <label className="flex flex-col">
                <span className="text-sm text-white/70 mb-1">Confirm password</span>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="p-3 rounded-md bg-white border border-slate-300 text-black" />
              </label>
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Change password</button>
            </div>
          </form>
        </section>

        <section className="glass-card p-6 rounded-2xl bg-linear-to-br from-red-600/10 to-pink-600/10 border border-white/10">
          <h2 className="text-lg font-semibold mb-3 text-red-400">Danger zone</h2>
          <p className="text-white/70 mb-4">Deactivating your account will clear local demo data and sign you out. This is irreversible in the demo app.</p>
          <div className="flex gap-3">
            <button onClick={deactivateAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg">Deactivate account</button>
            <button onClick={() => { localStorage.removeItem('messages'); alert('Cleared messages (demo)'); }} className="px-4 py-2 bg-white/5 text-white rounded-lg">Clear messages</button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
