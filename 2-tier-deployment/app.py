from flask import Flask, request
import redis
import os

app = Flask(__name__)
redis_host = os.getenv('REDIS_HOST', 'localhost')
redis_port = int(os.getenv('REDIS_PORT', 6379))

r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

@app.route('/')
def home():
    return {
        'message': 'Flask Redis application is running',
        'endpoints': [
            '/get/<key>',
            '/set'
        ]
    }




@app.route('/set', methods=['POST'])
def set_value():
    key = request.json.get('key')
    value = request.json.get('value')
    r.set(key, value)
    return {'status': 'ok'}

@app.route('/get/<key>')
def get_value(key):
    value = r.get(key)
    return {'key': key, 'value': value}

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
