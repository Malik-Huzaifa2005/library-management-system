// ============================================================
// public/js/users.js
// Frontend logic for Members Management page
// ============================================================

const API = '/api/users';

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 350); }, 3500);
}

const userModal   = new bootstrap.Modal(document.getElementById('userModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
let deletingId = null;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function membershipBadge(type) {
  const map = { Premium: 'badge-premium', Standard: 'badge-standard', Student: 'badge-student' };
  return `<span class="badge ${map[type] || 'badge-standard'}">${type}</span>`;
}

function renderUsers(users) {
  const tbody = document.getElementById('usersBody');
  document.getElementById('users-count').textContent = `${users.length} member${users.length !== 1 ? 's' : ''}`;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><i class="bi bi-people"></i><p>No members found. Add your first member!</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));
               display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;flex-shrink:0">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>${u.name}</strong>
            ${u.address ? `<div style="font-size:.75rem;color:var(--text-muted)">${u.address}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="font-size:.85rem">${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td>${membershipBadge(u.membershipType)}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${fmtDate(u.joinDate)}</td>
      <td><span class="badge badge-${u.status.toLowerCase()}">${u.status}</span></td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEdit('${u.id}')" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="openDelete('${u.id}','${u.name.replace(/'/g,"\\'")}')\" title="Delete"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('');
}

async function loadUsers(search = '', status = 'all', membershipType = 'all') {
  document.getElementById('usersBody').innerHTML =
    `<tr><td colspan="8"><div class="spinner-wrap"><div class="spinner-border"></div></div></td></tr>`;
  try {
    const params = new URLSearchParams();
    if (search)                    params.append('search', search);
    if (status !== 'all')          params.append('status', status);
    if (membershipType !== 'all')  params.append('membershipType', membershipType);
    const res  = await fetch(`${API}?${params}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderUsers(json.data);
  } catch (err) {
    document.getElementById('usersBody').innerHTML =
      `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>${err.message}</p></div></td></tr>`;
    showToast(err.message, 'error');
  }
}

// Open Add Modal
document.getElementById('addUserBtn').addEventListener('click', () => {
  document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus me-2"></i>Add New Member';
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
});

// Open Edit Modal
async function openEdit(id) {
  try {
    const res  = await fetch(`${API}/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const u = json.data;
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Member';
    document.getElementById('userId').value   = u.id;
    document.getElementById('fName').value    = u.name;
    document.getElementById('fEmail').value   = u.email;
    document.getElementById('fPhone').value   = u.phone || '';
    document.getElementById('fType').value    = u.membershipType;
    document.getElementById('fStatus').value  = u.status;
    document.getElementById('fAddress').value = u.address || '';
    userModal.show();
  } catch (err) { showToast(err.message, 'error'); }
}

// Save (Add or Update)
document.getElementById('saveUserBtn').addEventListener('click', async () => {
  const name  = document.getElementById('fName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  if (!name || !email) { showToast('Name and Email are required!', 'error'); return; }
  const payload = {
    name, email,
    phone:          document.getElementById('fPhone').value.trim(),
    membershipType: document.getElementById('fType').value,
    status:         document.getElementById('fStatus').value,
    address:        document.getElementById('fAddress').value.trim(),
  };
  const id     = document.getElementById('userId').value;
  const method = id ? 'PUT' : 'POST';
  const url    = id ? `${API}/${id}` : API;
  try {
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    userModal.hide();
    showToast(json.message, 'success');
    loadUsers();
  } catch (err) { showToast(err.message, 'error'); }
});

// Delete
function openDelete(id, name) {
  deletingId = id;
  document.getElementById('deleteUserName').textContent = name;
  deleteModal.show();
}
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  try {
    const res  = await fetch(`${API}/${deletingId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    deleteModal.hide();
    showToast(json.message, 'success');
    loadUsers();
  } catch (err) { showToast(err.message, 'error'); }
});

// Search & Filter
document.getElementById('searchBtn').addEventListener('click', () => {
  loadUsers(
    document.getElementById('searchInput').value.trim(),
    document.getElementById('statusFilter').value,
    document.getElementById('typeFilter').value
  );
});
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('statusFilter').value = 'all';
  document.getElementById('typeFilter').value   = 'all';
  loadUsers();
});
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

loadUsers();
