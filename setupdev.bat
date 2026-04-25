@echo off
echo Setting up backend...
if not exist env (
	python -m venv env
) else (
	echo Virtual environment 'env' already exists — skipping venv creation
)
call env\Scripts\activate
pip install -r backend\requirements.txt
cd backend
alembic upgrade head
cd ..
echo Setting up frontend...
cd frontend
npm install
cd ..
echo Setup complete.