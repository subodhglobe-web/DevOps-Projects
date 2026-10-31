from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will allow all origins by default

# Members API Route

@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)