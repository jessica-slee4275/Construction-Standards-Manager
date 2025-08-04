from flask import Blueprint, request, jsonify
from models.template import Template
from db import db
import uuid
from datetime import datetime
import json

templates_bp = Blueprint('templates', __name__)

# ✅ GET /api/templates?team_id=xxx
@templates_bp.route('/api/templates', methods=['GET'])
def get_templates():
    # team_id = request.args.get('team_id')
    templates = Template.query.all()
    result = []

    for t in templates:
        try:
            checklist = json.loads(t.checklist) if t.checklist else []
        except json.JSONDecodeError:
            checklist = []
            
        result.append({
            "id": t.id,
            "title": t.title,
            "subtitle": t.subtitle,
            "team_id": t.team_id,
            "category": t.category,
            "checklist": checklist,
            "created_at": t.created_at.isoformat() if t.created_at else None
            })
    return jsonify(result)

# ✅ GET /api/templates/:id
@templates_bp.route('/api/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    t = Template.query.get(template_id)
    if not t:
        return jsonify({"error": "Not found"}), 404
    return jsonify({
        "id": t.id,
        "title": t.title,
        "subtitle": t.subtitle,
        "team_id": t.team_id,
        "category": t.category,
        "checklist": t.checklist,
        "created_at": t.created_at.isoformat()
    })

# ✅ POST /api/templates
@templates_bp.route("/api/templates", methods=["POST"])
def create_template():
    data = request.get_json()

    title = data.get("title")
    subtitle = data.get('subtitle') 
    checklist = data.get('checklist')
    category = data.get('category')
    team_id = data.get('team_id') 

    if not title or not checklist or not isinstance(checklist, list):
        return jsonify({"error": "Missing title or content"}), 400

    new_template = Template(
        id=str(uuid.uuid4()),
        title=title,
        subtitle=subtitle,
        checklist=json.dumps(checklist),
        category=category,
        created_at=datetime.utcnow(),
        team_id=team_id,
    )

    db.session.add(new_template)
    db.session.commit()

    return jsonify({"message": "Template saved", "id": new_template.id}), 201

# ✅ DELETE /api/templates/:id
@templates_bp.route('/api/templates/<template_id>', methods=['DELETE'])
def delete_template(template_id):
    t = Template.query.get(template_id)
    if not t:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Deleted"})
