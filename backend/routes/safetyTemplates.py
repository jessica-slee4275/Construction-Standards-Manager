from flask import Blueprint, request, jsonify, render_template_string
from models.safetyTemplate import safetyTemplate
from db import db
import json

safetyTemplates_bp = Blueprint("safetyTemplates", __name__)

# ---------- helpers ----------
def _safe_list(v):
    if not v: return []
    if isinstance(v, list): return v
    if isinstance(v, str):
        try:
            x = json.loads(v)
            return x if isinstance(x, list) else []
        except json.JSONDecodeError:
            return []
    return []

def _serialize_templates():
    safetyTemplates = safetyTemplate.query.all()
    out = []
    for t in safetyTemplates:
        out.append({
            "id": t.id,
            "title": t.title,
            "subtitle": t.subtitle,
            "team_id": t.team_id,
            "category": t.category,
            "checklist": _safe_list(t.checklist),
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return out

# ---------- routes ----------

# Root preview page (http://127.0.0.1:5000/)
@safetyTemplates_bp.route("/", methods=["GET"], endpoint="index")
def safety_index():
    html = """<!doctype html><html lang="en"><head><meta charset="utf-8" />
    <title>Safety Templates</title>
    <style>body{font-family:system-ui,Segoe UI,Roboto,sans-serif;margin:24px}
    pre{background:#f6f8fa;padding:16px;border-radius:12px;overflow:auto}</style>
    </head><body>
    <h1>Safety Templates</h1>
    <p class="desc">This is the safetyTemplates DB.</p>
    <p><a href="/api/safetyTemplates">/api/safetyTemplates</a></p>
    <pre id="out">Loading...</pre>
    <script>
      fetch('/api/safetyTemplates').then(r=>r.json()).then(d=>{
        document.getElementById('out').textContent = JSON.stringify(d,null,2);
      }).catch(e=>{document.getElementById('out').textContent='Failed: '+e});
    </script></body></html>"""
    return render_template_string(html)

# List
@safetyTemplates_bp.route("/api/safetyTemplates", methods=["GET"], endpoint="list_templates")
def get_safetyTemplates():
    return jsonify(_serialize_templates())

# Create
@safetyTemplates_bp.route("/api/safetyTemplates", methods=["POST", "OPTIONS"], endpoint="create_template")
def create_safetyTemplate():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    t = safetyTemplate(
        title=title,
        subtitle=data.get("subtitle"),
        team_id=data.get("team_id"),
        category=data.get("category"),
        checklist=json.dumps(data.get("checklist") or []),
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({
        "id": t.id,
        "title": t.title,
        "subtitle": t.subtitle,
        "team_id": t.team_id,
        "category": t.category,
        "checklist": _safe_list(t.checklist),
        "created_at": t.created_at.isoformat() if t.created_at else None
    }), 201

# Get one
@safetyTemplates_bp.route("/api/safetyTemplates/<tpl_id>", methods=["GET"], endpoint="get_template")
def get_one_template(tpl_id):
    t = safetyTemplate.query.filter_by(id=str(tpl_id)).first_or_404()
    return jsonify({
        "id": str(t.id),
        "title": t.title,
        "subtitle": t.subtitle,
        "team_id": t.team_id,
        "category": t.category,
        "checklist": _safe_list(t.checklist),
        "created_at": t.created_at.isoformat() if t.created_at else None
    })

# Update
@safetyTemplates_bp.route("/api/safetyTemplates/<tpl_id>", methods=["PUT", "PATCH", "OPTIONS"], endpoint="update_template")
def update_template(tpl_id):
    if request.method == "OPTIONS":
        return ("", 204)
    t = safetyTemplate.query.filter_by(id=str(tpl_id)).first_or_404()
    data = request.get_json(force=True) or {}

    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400
    t.title = title

    if "category" in data:
        t.category = data["category"]

    if "checklist" in data:
        t.checklist = json.dumps(data.get("checklist") or [])

    db.session.commit()
    return get_one_template(tpl_id)

# Delete
@safetyTemplates_bp.route("/api/safetyTemplates/<tpl_id>", methods=["DELETE", "OPTIONS"], endpoint="delete_template")
def delete_template(tpl_id):
    if request.method == "OPTIONS":
        return ("", 204)
    t = safetyTemplate.query.filter_by(id=str(tpl_id)).first_or_404()
    db.session.delete(t)
    db.session.commit()
    return ("", 204)
