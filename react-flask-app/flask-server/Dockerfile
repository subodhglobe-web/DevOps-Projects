# Use a lightweight Python base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend code into the container
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask default port
EXPOSE 5000

# Set the default command to run the server
CMD ["python", "server.py"]
