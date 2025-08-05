# 🏗️ Construction Standards Manager

A full-stack web application to manage standardized checklists for construction inspections across schools, apartments, and commercial properties.

---

## 🚀 Tech Stack

| Layer     | Stack                                     |
|-----------|-------------------------------------------|
| Frontend  | React (Vite), TypeScript, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) |
| Backend   | Python, Flask, SQLAlchemy                 |
| Database  | PostgreSQL or SQLite                      |
| Data Format | JSON (Frontend ↔ Backend)               |

---

## 🔧 Features

### ✅ Template Creation (Frontend)
- Select a category: `school`, `apartment`, `commercial`
- View and select standard checklist items (loaded from `templates.json`)
- Input custom `title` for the new template
- Preview selected items before saving

### ✅ Save Template to Backend
- On "Save Template", send a `POST /api/templates` request
- Data payload includes:
  - `title`: user input
  - `subtitle`: comma-separated checklist item titles
  - `checklist`: array of all selected checklist strings
  - `category`: current selected category
- Server stores the template with auto-generated UUID and `created_at` timestamp

### ✅ View Saved Templates
- Fetch saved templates from `GET /api/templates`
- Display each as a card:
  - Title, Subtitle, Category, Timestamp
  - Checklist items shown as bullet list

### ✅ Delete Template
- Call `DELETE /api/templates/<id>` endpoint
- Each card includes a delete button

---

## 🧩 API Endpoints

### `POST /api/templates`
```json
{
  "title": "Fire Safety Checklist",
  "subtitle": "Smoke Detectors, Extinguishers",
  "checklist": [
    "Smoke detectors working",
    "Extinguishers checked"
  ],
  "category": "apartment"
}
````

### `GET /api/templates`

* Returns a list of all saved templates:

```json
[
  {
    "id": "uuid-string",
    "title": "Fire Safety Checklist",
    "subtitle": "Smoke Detectors, Extinguishers",
    "checklist": [...],
    "category": "apartment",
    "created_at": "2025-08-04T23:36:41.402Z"
  }
]
```

### `DELETE /api/templates/<id>`

* Deletes the specified template by UUID

---

## 🧱 Template Schema (SQLAlchemy)

```python
class Template(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = db.Column(db.String(100))
    subtitle = db.Column(db.String(255))
    checklist = db.Column(db.Text)  # Stored as JSON string
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

---

## 🗂️ Project Structure

### Frontend

```
src/
├── components/
│   └── standards/
│       └── TemplateViewer.tsx
├── pages/
│   └── App.tsx
├── data/
│   └── templates.json
├── types/
│   └── templates.ts
└── components/ui/
    ├── input.tsx
    ├── button.tsx
    ├── card.tsx
    └── checkbox.tsx
```

### Backend

```
backend/
├── app.py                  # Flask app instance and setup
├── db.py                   # SQLAlchemy initialization
├── models/
│   └── template.py         # Template model
└── routes/
    └── templates.py        # API route handlers for CRUD
```

---

## ✅ Future Improvements

* [ ] Team-based template filtering (using `team_id`)
* [ ] Template export to PDF or CSV
* [ ] User authentication (multi-user support)
* [ ] Template versioning or history tracking
* [ ] Form validation and error messages

---

## 🏁 Getting Started

```bash
# 1. Install frontend dependencies
cd frontend
npm install
npm run dev

# 2. Run backend (in another terminal)
cd backend
python app.py
```

Make sure both servers are running:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:5000](http://localhost:5000)
