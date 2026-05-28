import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from extensions import db
import models  # noqa: F401 — registers all ORM models with SQLAlchemy
from routes import register_blueprints

load_dotenv()

app = Flask(__name__)
CORS(app)
app.json.ensure_ascii = False

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True, port=5000)