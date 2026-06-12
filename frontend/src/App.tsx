import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';

const BASE = 'http://localhost:8000';

interface Person {
  id: string;
  name: string;
  age: number;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [persons, setPersons] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  function showSuccess(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  function showError(msg: string) { setError(msg); setTimeout(() => setError(''), 3000); }

  async function getToken() {
    if (!user) return '';
    return await user.getIdToken();
  }

  async function authHeaders() {
    const token = await getToken();
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  async function fetchAll() {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/persons`, { headers });
      const data = await res.json();
      setPersons(data.data || []);
    } catch {
      showError('Failed to load data. Make sure the backend is running.');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age) { showError('Name and Age are required.'); return; }
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/persons`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: name.trim(), age: parseInt(age) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setName(''); setAge('');
      showSuccess('Person added successfully!');
      fetchAll();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim() || !editAge) { showError('Name and Age are required.'); return; }
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/persons/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: editName.trim(), age: parseInt(editAge) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setEditId(null);
      showSuccess('Person updated successfully!');
      fetchAll();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete?')) return;
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/persons/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      showSuccess('Person deleted successfully!');
      fetchAll();
    } catch (err: any) { showError(err.message); }
    finally { setLoading(false); }
  }

  function startEdit(person: Person) {
    setEditId(person.id);
    setEditName(person.name);
    setEditAge(String(person.age));
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setPersons([]);
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  // Show login page if not logged in
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Show CRUD app if logged in
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
              🗂️ CRUD App
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Welcome, {user.displayName}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Log out
          </button>
        </div>

        {/* Success / Error */}
        {success && (
          <div style={{ background: '#064e3b', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#450a0a', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            ❌ {error}
          </div>
        )}

        {/* Add Person Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>➕ Add New Person</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                style={{ flex: 1, minWidth: '150px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                style={{ width: '120px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                placeholder="Age"
                type="number"
                min="0"
                max="150"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Persons List */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
              📋 All Persons ({persons.length})
            </h2>
            <button
              onClick={fetchAll}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🔄 Refresh
            </button>
          </div>

          {persons.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '30px 0' }}>No persons added yet. Add one above!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {persons.map(person => (
                <div key={person.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                  {editId === person.id ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        style={{ flex: 1, minWidth: '130px', background: 'var(--bg)', border: '1px solid var(--accent)', color: 'var(--text)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Name"
                      />
                      <input
                        style={{ width: '100px', background: 'var(--bg)', border: '1px solid var(--accent)', color: 'var(--text)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        value={editAge}
                        onChange={e => setEditAge(e.target.value)}
                        placeholder="Age"
                        type="number"
                        min="0"
                        max="150"
                      />
                      <button
                        onClick={() => handleUpdate(person.id)}
                        disabled={loading}
                        style={{ background: 'var(--success)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✅ Update
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '1rem' }}>{person.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.9rem', marginLeft: '12px' }}>Age: {person.age}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEdit(person)}
                          style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
