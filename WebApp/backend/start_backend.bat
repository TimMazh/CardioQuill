
@echo off
echo Creating virtual environment if it doesn't exist...
if not exist venv (
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
pip install --upgrade pip

echo Installing dependencies...
pip install -r requirements.txt

echo Starting backend server...
python app.py
