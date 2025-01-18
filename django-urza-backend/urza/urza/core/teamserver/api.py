# silenttrinity/core/teamserver/api.py

from quart import Blueprint, jsonify, request, abort
from silenttrinity.core.utils import CmdError
import logging

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Simple Token-Based Authentication Decorator
def require_api_token(func):
    async def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != 'Bearer YOUR_SECURE_TOKEN':
            logging.warning("Unauthorized API access attempt.")
            abort(401, description="Unauthorized")
        return await func(*args, **kwargs)
    return wrapper

# Example: List All Listeners
@api_bp.route('/listeners', methods=['GET'])
@require_api_token
async def list_listeners():
    listeners_context = request.app.listeners_context  # Access the listeners context
    listeners = listeners_context.list()
    return jsonify(listeners)

# Example: Create a New Listener
@api_bp.route('/listeners', methods=['POST'])
@require_api_token
async def create_listener():
    data = await request.json
    required_fields = ['name', 'bind_ip', 'port', 'comms']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        logging.error(f"Missing required fields: {missing_fields}")
        abort(400, description=f"Missing required fields: {', '.join(missing_fields)}")
    
    try:
        name = data['name']
        bind_ip = data['bind_ip']
        port = int(data['port'])
        comms = data['comms']
        # Add more options as needed
        
        listeners_context = request.app.listeners_context
        listeners_context.selected = None  # Reset selected
        listeners_context.selected = {
            'Name': name,
            'BindIP': bind_ip,
            'Port': port,
            'Comms': comms,
            # Add more options as needed
        }
        response = listeners_context.start()
        return jsonify(response), 201
    except KeyError as e:
        logging.error(f"Missing required field: {e}")
        abort(400, description=f"Missing required field: {e}")
    except CmdError as e:
        logging.error(f"Error creating listener: {e}")
        abort(400, description=str(e))
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        abort(500, description="Internal Server Error")

# Example: Delete a Listener
@api_bp.route('/listeners/<string:name>', methods=['DELETE'])
@require_api_token
async def delete_listener(name):
    listeners_context = request.app.listeners_context
    try:
        response = listeners_context.stop(name)
        return jsonify(response), 200
    except CmdError as e:
        logging.error(f"Error deleting listener: {e}")
        abort(400, description=str(e))
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        abort(500, description="Internal Server Error")

# Similarly, define other API endpoints for sessions, modules, stagers, etc.
