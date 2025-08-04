from flask import Flask
from flask_cors import CORS
from routes.templates import templates_bp
from db import db

app = Flask(__name__)
CORS(app)  # for React

# Setting DB
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///templates.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ SQLAlchemy init
db.init_app(app)

# ✅ API Route
app.register_blueprint(templates_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
