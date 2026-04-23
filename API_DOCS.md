# 📖 LibraryPro — API Documentation

Base URL: `http://localhost:3000/api`

All endpoints return JSON in the format:
```json
{ "success": true/false, "message": "...", "data": ... }
```

---

## 📚 Books API

### GET `/api/books`
Get all books. Supports search and category filter.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by title or author |
| `category` | string | Filter by category (e.g. `Fiction`, `Classic`) |

**Example:** `GET /api/books?search=gatsby&category=Fiction`

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "b001",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "category": "Fiction",
      "isbn": "978-0743273565",
      "quantity": 5,
      "available": 5,
      "publishedYear": 1925,
      "description": "...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/books/:id`
Get a single book by ID.

**Response:** `{ "success": true, "data": { ...book } }`

---

### POST `/api/books`
Add a new book.

**Request Body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Technology",
  "isbn": "978-0132350884",
  "quantity": 3,
  "publishedYear": 2008,
  "description": "A handbook of agile software craftsmanship."
}
```
**Required:** `title`, `author`, `category`

**Response:** `201 Created` with the new book object.

---

### PUT `/api/books/:id`
Update an existing book. Send only the fields you want to update.

**Request Body:** (any subset of book fields)
```json
{ "available": 4, "quantity": 5 }
```

---

### DELETE `/api/books/:id`
Delete a book by ID.

**Response:** `{ "success": true, "message": "Book 'X' deleted successfully!" }`

---

## 👥 Users / Members API

### GET `/api/users`
Get all members.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name or email |
| `status` | string | `Active` or `Inactive` |
| `membershipType` | string | `Premium`, `Standard`, or `Student` |

---

### GET `/api/users/:id`
Get a single member by ID.

---

### POST `/api/users`
Register a new member.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@email.com",
  "phone": "555-0101",
  "membershipType": "Premium",
  "address": "123 Maple Street"
}
```
**Required:** `name`, `email`

**Response:** `201 Created` with the new member object.

---

### PUT `/api/users/:id`
Update member details.

---

### DELETE `/api/users/:id`
Remove a member.

---

## 🔄 Issues / Return API

### GET `/api/issues`
Get all issue records.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `Issued` or `Returned` |
| `search` | string | Search by book title or member name |

---

### POST `/api/issues`
Issue a book to a member.

**Request Body:**
```json
{
  "bookId": "b001",
  "userId": "u002",
  "dueDate": "2024-05-10"
}
```
**Required:** `bookId`, `userId`

**Business Rules:**
- Book must have `available > 0`
- Member must have `status === "Active"`
- Member cannot have the same book issued twice simultaneously
- `available` count is automatically decremented

---

### PUT `/api/issues/:id`
Return a book (mark issue as Returned).

**No body required.** Automatically:
- Sets `returnDate` to now
- Sets `status` to `"Returned"`
- Increments the book's `available` count

---

### DELETE `/api/issues/:id`
Delete an issue record permanently.

---

## ❤️ Health Check

### GET `/api/health`
Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "Library Management System API is running!",
  "timestamp": "2024-04-23T18:00:00.000Z",
  "version": "1.0.0"
}
```

---

## ⚠️ Error Responses

All errors return:
```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — missing/invalid fields |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate email, book already issued |
| `500` | Internal Server Error |
