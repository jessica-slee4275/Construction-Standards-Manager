from db import db
from sqlalchemy.dialects.sqlite import JSON
import uuid
from datetime import datetime

class safetyTemplate(db.Model):
    __tablename__ = "safetyTemplates"

    id = db.Column(db.Integer, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String, nullable=False)
    subtitle = db.Column(db.Text, nullable=True)
    checklist = db.Column(db.Text, nullable=False)
    team_id = db.Column(db.String, nullable=True)
    category = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)