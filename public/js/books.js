// ============================================================
// public/js/books.js
// Frontend logic for Books Management page
// Uses fetch() to call REST API endpoints
// ============================================================

const API = '/api/books';

// ── Toast Notification Helper ────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// ── Bootstrap Modal Instances ────────────────────────────────
const bookModalEl   = document.getElementById('bookModal');
const deleteModalEl = document.getElementById('deleteModal');
const bookModal     = new bootstrap.Modal(bookModalEl);
const deleteModal   = new bootstrap.Modal(deleteModalEl);

let editingId    = null; // ID of the book currently being edited
let deletingId   = null; // ID of the book to be deleted

// ── Format date ──────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Render Books Table ────────────────────────────────────────
function renderBooks(books) {
  const tbody = document.getElementById('booksBody');
  document.getElementById('books-count').textContent = `${books.length} book${books.length !== 1 ? 's' : ''}`;

  if (!books.length) {
    tbody.innerHTML = `<tr><td colspan="9">
      <div class="empty-state">
        <i class="bi bi-journal-x"></i>
        <p>No books found. Add your first book!</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = books.map((book, i) => {
    const avail = book.available > 0
      ? `<span class="badge badge-available">${book.available}/${book.quantity}</span>`
      : `<span class="badge badge-unavailable">0/${book.quantity}</span>`;
    return `
    <tr>
      <td>${i + 1}</td>
      <td>
        <strong>${book.title}</strong>
        ${book.description ? `<div style="font-size:.78rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${book.description}">${book.description}</div>` : ''}
      </td>
      <td>${book.author}</td>
      <td><span class="badge badge-${book.category.toLowerCase()}" style="background:rgba(79,70,229,.15);color:var(--primary-light)">${book.category}</span></td>
      <td style="font-size:.82rem;color:var(--text-muted)">${book.isbn || '—'}</td>
      <td>${book.publishedYear || '—'}</td>
      <td>${book.quantity}</td>
      <td>${avail}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEdit('${book.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDelete('${book.id}', '${book.title.replace(/'/g,"\\'")}')\" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── Load Books from API ───────────────────────────────────────
async function loadBooks(search = '', category = 'all') {
  document.getElementById('booksBody').innerHTML =
    `<tr><td colspan="9"><div class="spinner-wrap"><div class="spinner-border"></div></div></td></tr>`;
  try {
    const params = new URLSearchParams();
    if (search)                 params.append('search', search);
    if (category !== 'all')     params.append('category', category);
    const res  = await fetch(`${API}?${params}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    renderBooks(json.data);
  } catch (err) {
    document.getElementById('booksBody').innerHTML =
      `<tr><td colspan="9"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>${err.message}</p></div></td></tr>`;
    showToast(err.message, 'error');
  }
}

// ── Open Add Modal ─────────────────────────────────────────────
document.getElementById('addBookBtn').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').innerHTML = '<i class="bi bi-book me-2"></i>Add New Book';
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').value = '';
});

// ── Open Edit Modal ────────────────────────────────────────────
async function openEdit(id) {
  try {
    const res  = await fetch(`${API}/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const b = json.data;
    editingId = id;
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Book';
    document.getElementById('bookId').value    = b.id;
    document.getElementById('fTitle').value    = b.title;
    document.getElementById('fAuthor').value   = b.author;
    document.getElementById('fCategory').value = b.category;
    document.getElementById('fIsbn').value     = b.isbn || '';
    document.getElementById('fQuantity').value = b.quantity;
    document.getElementById('fYear').value     = b.publishedYear || '';
    document.getElementById('fDesc').value     = b.description || '';
    bookModal.show();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Save Book (Add or Update) ──────────────────────────────────
document.getElementById('saveBookBtn').addEventListener('click', async () => {
  const title    = document.getElementById('fTitle').value.trim();
  const author   = document.getElementById('fAuthor').value.trim();
  const category = document.getElementById('fCategory').value;
  if (!title || !author || !category) {
    showToast('Title, Author, and Category are required!', 'error'); return;
  }
  const payload = {
    title, author, category,
    isbn:          document.getElementById('fIsbn').value.trim(),
    quantity:      document.getElementById('fQuantity').value,
    publishedYear: document.getElementById('fYear').value,
    description:   document.getElementById('fDesc').value.trim(),
  };
  const id     = document.getElementById('bookId').value;
  const method = id ? 'PUT' : 'POST';
  const url    = id ? `${API}/${id}` : API;
  try {
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    bookModal.hide();
    showToast(json.message, 'success');
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ── Open Delete Modal ──────────────────────────────────────────
function openDelete(id, title) {
  deletingId = id;
  document.getElementById('deleteBookName').textContent = title;
  deleteModal.show();
}

// ── Confirm Delete ─────────────────────────────────────────────
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  try {
    const res  = await fetch(`${API}/${deletingId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    deleteModal.hide();
    showToast(json.message, 'success');
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ── Search & Filter ────────────────────────────────────────────
document.getElementById('searchBtn').addEventListener('click', () => {
  loadBooks(
    document.getElementById('searchInput').value.trim(),
    document.getElementById('categoryFilter').value
  );
});
document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = 'all';
  loadBooks();
});
// Search on Enter key
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ── Initial Load ───────────────────────────────────────────────
loadBooks();
