import os
from app import create_app
from app.config import Config

app = create_app(Config)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1")
    print(f"Starting Shree Amar Ganesh Mitra Mandal API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
