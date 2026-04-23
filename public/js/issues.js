// ============================================================
// public/js/issues.js
// Frontend logic for Issue / Return Books page
// ============================================================

const ISSUES_API = '/api/issues';
const BOOKS_API  = '/api/books';
const USERS_API  = '/api/users';

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 350); }, 3500);
}

const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
let deletingId = null;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isOverdue(dueDateISO, status) {
  if (status === 'Returned') return false;
  return new Date(dueDateISO) < new Date();
}

// ── Populate Book Dropdown ─────────────────────────────────────
async function loadBookDropdown() {
  try {
    const res  = await fetch(BOOKS_API);
    const json = await res.json();
    const sel  = document.getElementById('issueBookId');
    sel.innerHTML = '<option value="">— Select Book —</option>';
    (json.data || []).forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.title} (${b.available} available)`;
      opt.disabled = b.available <= 0;
      sel.appendChild(opt);
    });
  } catch (e) { console.error('Failed to load books', e); }
}

// ── Populate User Dropdown ─────────────────────────────────────
async function loadUserDropdown() {
  try {
    const res  = await fetch(`${USERS_API}?status=Active`);
    const json = await res.json();
    const sel  = document.getElementById('issueUserId');
    sel.innerHTML = '<option value="">— Select Member —</option>';
    (json.data || []).forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.name} (${u.membershipType})`;
      sel.appendChild(opt);
    });
  } catch (e) { console.error('Failed to load users', e); }
}

// ── Set default due date (14 days from today) ─────────────────
function setDefaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  document.getElementById('issueDueDate').value = d.toISOString().split('T')[0];
  // Min date = today
  document.getElementById('issueDueDate').min = new Date().toISOString().split('T')[0];
}

// ── Render Issues Table ────────────────────────────────────────
function renderIssues(issues) {
  const tbody = document.getElementById('issuesBody');
  document.getElementById('issues-count').textContent = `${issues.length} record${issues.length !== 1 ? 's' : ''}`;
  updateQuickStats(issues);

  if (!issues.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><i class="bi bi-arrow-left-right"></i><p>No records found.</p></div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = issues.map((issue, i) => {
    const overdue = isOverdue(issue.dueDate, issue.status);
    const dueTxt  = overdue
      ? `<span style="color:var(--danger)">${fmtDate(issue.dueDate)} ⚠ Overdue</span>`
      : fmtDate(issue.dueDate);
    const statusBadge = issue.status === 'Issued'
      ? `<span class="badge badge-issued">Issued</span>`
      : `<span class="badge badge-returned">Returned</span>`;
    const returnBtn = issue.status === 'Issued'
      ? `<button class="btn btn-sm btn-success me-1" onclick="returnBook('${issue.id}')" title="Mark Returned">
           <i class="bi bi-arrow-down-left-circle"></i> Return
         </button>`
      : '';
    return `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${issue.bookTitle}</strong></td>
      <td>${issue.userName}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${fmtDate(issue.issueDate)}</td>
      <td style="font-size:.82rem">${dueTxt}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${fmtDate(issue.returnDate)}</td>
      <td>${statusBadge}</td>
      <td>
        ${returnBtn}
        <button class="btn btn-sm btn-danger" onclick="openDelete('${issue.id}')" title="Delete"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

// ── Update Quick Stats ─────────────────────────────────────────
function updateQuickStats(issues) {
  const issued   = issues.filter(i => i.status === 'Issued').length;
  const returned = issues.filter(i => i.status === 'Returned').length;
  document.getElementById('qs-total').textContent    = issues.length;
  document.getElementById('qs-issued').textContent   = issued;
  document.getElementById('qs-returned').textContent = returned;
}

// ── Load Issues from API ───────────────────────────────────────
async function loadIssues(search = '', status = 'all') {
  document.getElementById('issuesBody').innerHTML =
    `<tr><td colspan="8"><div class="spinner-wrap"><div class="spinner-border"></div></div></td></tr>`;
  try {
    const params = new URLSearchParams();
    if (search)           params.append('search', search);
    if (status !== 'all') params.append('status', status);
    const res  = await fetch(`${ISSUES_API}?${params}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderIssues(json.data);
  } catch (err) {
    document.getElementById('issuesBody').innerHTML =
      `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>${err.message}</p></div></td></tr>`;
    showToast(err.message, 'error');
  }
}

// ── Issue Form Submit ──────────────────────────────────────────
document.getElementById('issueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bookId  = document.getElementById('issueBookId').value;
  const userId  = document.getElementById('issueUserId').value;
  const dueDate = document.getElementById('issueDueDate').value;
  if (!bookId || !userId) { showToast('Please select both a book and a member.', 'error'); return; }
  const btn = document.getElementById('issueBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Issuing…';
  try {
    const res  = await fetch(ISSUES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, userId, dueDate }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast(json.message, 'success');
    document.getElementById('issueForm').reset();
    setDefaultDueDate();
    await loadBookDropdown(); // Refresh to show updated availability
    loadIssues();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-arrow-up-right-circle me-1"></i> Issue Book';
  }
});

// ── Return a Book ──────────────────────────────────────────────
async function returnBook(id) {
  try {
    const res  = await fetch(`${ISSUES_API}/${id}`, { method: 'PUT' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast(json.message, 'success');
    await loadBookDropdown(); // Refresh availability
    loadIssues();
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Delete Record ──────────────────────────────────────────────
function openDelete(id) {
  deletingId = id;
  deleteModal.show();
}
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  try {
    const res  = await fetch(`${ISSUES_API}/${deletingId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    deleteModal.hide();
    showToast(json.message, 'success');
    loadIssues();
  } catch (err) { showToast(err.message, 'error'); }
});

// ── Search & Filter ────────────────────────────────────────────
document.getElementById('searchBtn').addEventListener('click', () => {
  loadIssues(
    document.getElementById('searchInput').value.trim(),
    document.getElementById('statusFilter').value
  );
});
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ── Initial Load ───────────────────────────────────────────────
loadBookDropdown();
loadUserDropdown();
setDefaultDueDate();
loadIssues();
