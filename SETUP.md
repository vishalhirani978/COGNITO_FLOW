# CognitoFlow Setup Instructions

## Project Structure

```
project/
├── backend/          # Python Flask backend
│   ├── app.py       # Main Flask application
│   ├── database.sql # MySQL database schema
│   ├── requirements.txt
│   └── .env.example
├── frontend/         # HTML/CSS/JS frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
```

## Prerequisites

- Python 3.8 or higher
- MySQL 5.7 or higher
- A modern web browser

## Backend Setup

### 1. Install Python Dependencies

Navigate to the backend directory and install required packages:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure MySQL Database

Start your MySQL server and create the database:

```bash
mysql -u root -p < database.sql
```

Or manually run the SQL commands:

```sql
CREATE DATABASE IF NOT EXISTS cognitoflow;

USE cognitoflow;

CREATE TABLE IF NOT EXISTS papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    teacher_name VARCHAR(255),
    file_content TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_subject (subject),
    INDEX idx_year (year),
    INDEX idx_teacher_name (teacher_name)
);
```

### 3. Configure Environment Variables

Copy the example environment file and configure your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and update with your MySQL credentials:

```
DB_HOST=localhost
DB_NAME=cognitoflow
DB_USER=root
DB_PASSWORD=your_password_here
```

### 4. Start the Backend Server

```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Configure API URL (if needed)

If your backend is running on a different host or port, edit `frontend/app.js`:

```javascript
const API_URL = 'http://localhost:5000/api';
```

### 2. Serve the Frontend

You can use any static file server. Here are a few options:

**Option 1: Python HTTP Server**
```bash
cd frontend
python -m http.server 8000
```

**Option 2: Node.js HTTP Server**
```bash
cd frontend
npx http-server -p 8000
```

**Option 3: PHP Built-in Server**
```bash
cd frontend
php -S localhost:8000
```

The frontend will be available at `http://localhost:8000`

## Usage

1. Open your browser and navigate to `http://localhost:8000`
2. Click the "Upload" tab to upload exam papers
3. Fill in the paper details:
   - Paper Title
   - Subject
   - Year
   - Teacher Name (optional)
   - Upload a .txt file containing the exam content
4. Click "Upload Paper" to submit
5. Switch to the "Analysis" tab to view insights
6. Select a subject and choose between "General" (topic trends over years) or "Teacher Comparison" mode
7. View the heatmap showing topic distribution

## API Endpoints

### POST /api/papers
Upload a new exam paper

**Request Body:**
```json
{
  "title": "Final Exam 2024",
  "subject": "Data Structures",
  "year": 2024,
  "teacherName": "Mr. Atta",
  "fileContent": "..."
}
```

### GET /api/papers
Get all uploaded papers

### GET /api/subjects
Get list of unique subjects

### GET /api/analysis/{mode}?subject={subject}
Get analysis data for a subject

**Parameters:**
- `mode`: "general" or "teacher"
- `subject`: Subject name

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database `cognitoflow` exists

**Module Not Found:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues

**CORS Errors:**
- Ensure Flask-CORS is installed in the backend
- Check that backend is running on port 5000

**API Connection Failed:**
- Verify backend server is running
- Check API_URL in `app.js` matches your backend URL

## Sample Exam Paper Format

Create a `.txt` file with content like:

```
Question 1: Implement a function using Dynamic Programming (10 marks)
Question 2: Write a Sorting Algorithm using Divide and Conquer (8 marks)
Question 3: Explain Graph Algorithms and implement BFS (12 marks)
Question 4: Create a Binary Search Tree implementation (15 marks)
```

The system will automatically extract topics and marks from the content.
