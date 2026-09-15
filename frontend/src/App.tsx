import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type Status = 'pending' | 'running' | 'completed' | 'failed';
type Job = { id: string; title: string; type: string; status: Status; createdAt: string };
const statuses: Status[] = ['pending', 'running', 'completed', 'failed'];
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setError(''); setJobs(await request<Job[]>('/jobs')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load jobs'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => Object.fromEntries(statuses.map((status) => [status, jobs.filter((j) => j.status === status).length])), [jobs]);
  const visible = filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);

  async function createJob(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !type.trim()) return;
    try { setSaving(true); setError(''); const job = await request<Job>('/jobs', { method: 'POST', body: JSON.stringify({ title: title.trim(), type: type.trim() }) }); setJobs((current) => [job, ...current]); setTitle(''); setType(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create job'); }
    finally { setSaving(false); }
  }
  async function changeStatus(job: Job, status: Status) {
    try { setError(''); const updated = await request<Job>(`/jobs/${job.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setJobs((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not update status'); void load(); }
  }
  async function deleteJob(id: string) {
    try { setError(''); await request<void>(`/jobs/${id}`, { method: 'DELETE' }); setJobs((current) => current.filter((job) => job.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not delete job'); }
  }

  return <main className="container">
    <header><div><p className="eyebrow">OPERATIONS</p><h1>Job Queue</h1><p className="muted">Monitor and manage your background work.</p></div><button className="ghost" onClick={() => void load()}>Refresh</button></header>
    {error && <div className="error" role="alert">{error}</div>}
    <section className="stats">{statuses.map((status) => <button className={`stat ${filter === status ? 'selected' : ''}`} key={status} onClick={() => setFilter(status)}><span>{status}</span><strong>{counts[status]}</strong></button>)}</section>
    <section className="panel"><h2>Create job</h2><form onSubmit={createJob}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" maxLength={120} /><input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (e.g. email)" maxLength={60} /><button disabled={saving}>{saving ? 'Creating...' : 'Create job'}</button></form></section>
    <div className="toolbar"><h2>{filter === 'all' ? 'All jobs' : `${filter} jobs`}</h2><button className={filter === 'all' ? 'active-filter' : 'ghost'} onClick={() => setFilter('all')}>All ({jobs.length})</button></div>
    {loading ? <p className="muted">Loading jobs...</p> : visible.length === 0 ? <div className="empty">No jobs found.</div> : <section className="jobs">{visible.map((job) => <article className="job" key={job.id}><div><h3>{job.title}</h3><p className="muted">{job.type} · {new Date(job.createdAt).toLocaleString()}</p></div><div className="actions"><select value={job.status} onChange={(e) => void changeStatus(job, e.target.value as Status)} aria-label={`Status for ${job.title}`}><option value={job.status}>{job.status}</option>{statuses.filter((status) => status !== job.status).map((status) => <option key={status} value={status}>{status}</option>)}</select><button className="danger" onClick={() => void deleteJob(job.id)}>Delete</button></div></article>)}</section>}
  </main>;
}
