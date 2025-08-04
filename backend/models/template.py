from db import db
from sqlalchemy.dialects.sqlite import JSON
import uuid
from datetime import datetime

class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    subtitle = db.Column(db.String, nullable=True)
    checklist = db.Column(db.Text, nullable=False)
    team_id = db.Column(db.String, nullable=True)
    category = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)