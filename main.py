from flask import Flask, Request, jsonify, render_template, request, redirect, url_for, session
import datetime
import requests
app = Flask(__name__, static_folder='static', template_folder='templates')

# Set a secret key for Flask to handle sessions and cookies securely
app.secret_key = "12345"  # Replace with your secret key

# Replace these credentials with your API credentials
API_URL = "https://api.mediasmart.io/login"
API_GET_IO = "https://api.mediasmart.io/api/insertion_orders"
API_GET_LI = "https://api.mediasmart.io/api/line_items"

# Define the token expiration time (2 days in seconds)
TOKEN_EXPIRATION_SECONDS = 2 * 24 * 60 * 60

@app.route('/get_li_data', methods=['GET'])
def get_li_data():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if not token or not is_token_valid():
        # If the token is invalid or expired, return an error response
        return jsonify({'error': 'Invalid or expired token'}), 401

    # Make a GET request to the API to fetch the IO's data
    headers = {'Authorization': token}
    response = requests.get(API_GET_LI, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(data)
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Error fetching IO data'}), response.status_code


# Keep the existing /list_ios route for rendering the template
@app.route('/list_li', methods=['GET'])
def list_li():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if not token or not is_token_valid():
        # If the token is invalid or expired, redirect to the login page
        session.pop('token', None)  # Remove the invalid token from the session
        session.pop('token_expiration', None)  # Remove the token expiration timestamp from the session
        return redirect(url_for('login'))

    return render_template('lineitem_list.html', token=token)


@app.route('/get_ios_data', methods=['GET'])
def get_ios_data():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if not token or not is_token_valid():
        # If the token is invalid or expired, return an error response
        return jsonify({'error': 'Invalid or expired token'}), 401

    # Make a GET request to the API to fetch the IO's data
    headers = {'Authorization': token}
    response = requests.get(API_GET_IO, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(data)
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Error fetching IO data'}), response.status_code


# Keep the existing /list_ios route for rendering the template
@app.route('/list_ios', methods=['GET'])
def list_ios():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if not token or not is_token_valid():
        # If the token is invalid or expired, redirect to the login page
        session.pop('token', None)  # Remove the invalid token from the session
        session.pop('token_expiration', None)  # Remove the token expiration timestamp from the session
        return redirect(url_for('login'))

    return render_template('ios_list.html', token=token)

@app.route('/')
def index():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if token and is_token_valid():
        # Redirect to the table page if the token is valid
        return redirect(url_for('display_home'))

    # If no token in the session, redirect to the login page
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if the user is already authenticated (has a valid token)
    token = session.get('token')
    if token and is_token_valid():
        # Redirect to the table page if the user is already authenticated
        return redirect(url_for('display_home'))

    error_message = None

    if request.method == 'POST':
        # Get the submitted username and password from the login form
        username = request.form['username']
        password = request.form['password']

        # Call the API to authenticate the user
        response = authenticate_user(username, password)

        if response and 'token' in response:
            # If the API returns a token, store it in the session along with its expiration time
            token = response['token']
            token_expiration = datetime.datetime.now() + datetime.timedelta(seconds=TOKEN_EXPIRATION_SECONDS)
            session['token'] = token
            session['token_expiration'] = token_expiration.timestamp()

            # Redirect to the table page
            return redirect(url_for('display_home'))
        else:
            # If authentication failed, display an error message
            error_message = "Invalid username or password. Please try again."

    # Show the login page template with an error message (if any)
    return render_template('login.html', error_message=error_message)


@app.route('/logout')
def logout():
    # Clear the session data (including the token)
    session.clear()
    return redirect(url_for('login'))


@app.route('/home')
def display_home():
    # Check if the user has a valid token in the session
    token = session.get('token')
    if not token or not is_token_valid():
        # If the token is invalid or expired, redirect to the login page
        session.pop('token', None)  # Remove the invalid token from the session
        session.pop('token_expiration', None)  # Remove the token expiration timestamp from the session
        return redirect(url_for('login'))

    # Retrieve the token expiration timestamp from the session
    token_expiration_timestamp = session.get('token_expiration')
    
    return render_template('home.html', token_expiration_timestamp=token_expiration_timestamp)


@app.route('/upload', methods=['POST', 'GET'])
def upload_file():
    # Check if the user has a valid token in the session
    token = session.get('token')
    print(token)
    if not token or not is_token_valid():
        # If the token is invalid or expired, redirect to the login page
        session.pop('token', None)  # Remove the invalid token from the session
        session.pop('token_expiration', None)  # Remove the token expiration timestamp from the session
        return redirect(url_for('login'))

    return render_template("upload.html")

    # Rest of your upload file logic...


def authenticate_user(username, password):
    # Make a POST request to the API to authenticate the user with the provided credentials
    response = requests.post(API_URL, json={'username': username, 'password': password})
    if response.status_code == 200:
        return response.json()
    return None


def is_token_valid():
    # Check if the token is valid and hasn't expired yet
    token = session.get('token')
    expiration_timestamp = session.get('token_expiration')

    if not token or not expiration_timestamp:
        # If the token or expiration timestamp is not available, assume the token is invalid
        return False

    current_time = datetime.datetime.now().timestamp()

    if current_time >= expiration_timestamp:
        # If the current time is greater than or equal to the expiration time, the token has expired
        # Clear the session data (including the token and expiration timestamp)
        session.clear()
        return False

    return True


if __name__ == '__main__':
    app.run(debug=True)
