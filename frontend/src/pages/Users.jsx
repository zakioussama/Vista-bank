import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' });

  const fetchUsers = () => {
    api.get('/users').then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/users', form);
      toast.success('User created');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'operator' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleActive = async (user) => {
    await api.put(`/users/${user.id}`, { is_active: !user.is_active });
    toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
    fetchUsers();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'is_active', label: 'Status', render: (r) => r.is_active ? 'Active' : 'Inactive' },
    { key: 'created_at', label: 'Created', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'actions', label: '', render: (r) => (
      <button onClick={() => toggleActive(r)} className="text-sm text-vista-600 hover:underline">
        {r.is_active ? 'Deactivate' : 'Activate'}
      </button>
    )},
  ];

  return (
    <MainLayout title="User Management">
      <div className="mb-6 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">Add User</button>
      </div>
      <div className="card">
        {loading ? <LoadingSpinner /> : <DataTable columns={columns} data={users} />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create User">
        <div className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create</button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Users;
