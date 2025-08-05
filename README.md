# Construction Standards Manager

A web application for managing standardized construction templates 

## 🚀 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, Flask, SQLAlchemy
- **Data**: JSON (frontend), PostgreSQL or SQLite (backend)

---

## Features

### ✅ Template Creation
- Select category: `school`, `apartment`, or `commercial`
- View and check construction checklist items
- Preview selected items as a template
- Input custom title for the template

### ✅ Save Template to Backend
- Send `POST` request to Flask backend with:
  - `title`: user input
  - `subtitle`: joined string of selected item titles
  - `checklist`: merged checklist arrays
  - `category`: current selected category
- Backend stores data with timestamp (`created_at`)

### ✅ View Saved Templates
- Send `GET /api/templates` to load existing templates
- Render in a card list with:
  - Title, Subtitle, Category, Timestamp
  - Checklist items as bullet list

### ✅ Delete Templates
- `DELETE /api/templates/<id>` endpoint
- UI includes delete button per template card

---

## API Endpoints

### POST `/api/templates`
```json
{
  "title": "Fire Safety Checklist",
  "subtitle": "Smoke, Exit Signs",
  "checklist": ["Smoke detectors working", "Exit signs visible"],
  "category": "apartment"
}

GET /api/templates
Returns a list of all saved templates

DELETE /api/templates/<id>
Deletes one template by UUID

Template Schema

class Template(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = db.Column(db.String(100))
    subtitle = db.Column(db.String(255))
    checklist = db.Column(db.Text)  # Stored as JSON string
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

## Project Structure
Frontend
```bash
src/
├── components/
│   └── standards/TemplateViewer.tsx
├── pages/App.tsx
├── data/templates.json
├── types/templates.ts
components/ui/
├── input.tsx, button.tsx, card.tsx, checkbox.tsx


Backend
```bash
backend/
├── app.py
├── db.py
├── models/template.py
├── routes/templates.py
