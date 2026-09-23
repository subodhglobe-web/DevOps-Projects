
from flask import Flask, request
import redis
import os

app = Flask(__name__)

# Redis connection details
redis_host = os.getenv('REDIS_HOST', 'localhost')
redis_port = int(os.getenv('REDIS_PORT', 6379))

r = redis.Redis(
    host=redis_host,
    port=redis_port,
    decode_responses=True
)


# Create sample data in Redis
def create_sample_data():
    r.set("name", "Subodh")
    r.set("city", "Kolkata")
    r.set("job", "DevOps Engineer")
    r.set("skill", "Kubernetes")
    r.set("experience", "8 years")


# Home page
@app.route('/')
def home():
    return {
        'message': 'Flask Redis application is running',
        'available_keys': [
            'name',
            'city',
            'job',
            'skill',
            'experience'
        ]
    }


# Store data in Redis
@app.route('/set', methods=['POST'])
def set_value():
    key = request.json.get('key')
    value = request.json.get('value')

    r.set(key, value)

    return {'status': 'ok'}


# Get data from Redis
@app.route('/get/<key>')
def get_value(key):
    value = r.get(key)

    return {
        'key': key,
        'value': value
    }


if __name__ == "__main__":
    create_sample_data()

    app.run(
        host='0.0.0.0',
        port=5000
    )


