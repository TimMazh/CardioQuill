
#!/bin/bash

# Check which Python command is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python is not installed or not in PATH. Please install Python 3."
    exit 1
fi

echo "Using Python command: $PYTHON_CMD"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    
    # Check if venv creation was successful
    if [ ! -d "venv" ]; then
        echo "Failed to create virtual environment. Please install venv module with:"
        echo "$PYTHON_CMD -m pip install virtualenv"
        exit 1
    fi
fi

# Check if activate script exists
if [ ! -f "venv/bin/activate" ]; then
    echo "Virtual environment seems incomplete. Recreating..."
    rm -rf venv
    $PYTHON_CMD -m venv venv
    
    # Check again after recreating
    if [ ! -f "venv/bin/activate" ]; then
        echo "Failed to create proper virtual environment. Please install venv module:"
        echo "$PYTHON_CMD -m pip install virtualenv"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Verify activation
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Failed to activate virtual environment."
    exit 1
else
    echo "Virtual environment activated successfully."
fi

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run Flask application
echo "Starting backend server..."
python app.py
