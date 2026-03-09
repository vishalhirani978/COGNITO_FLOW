from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from datetime import datetime
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# -----------------------------
# Database Connection
# -----------------------------
def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "cognitoflow"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "")
        )
    except Error as e:
        print("Database connection error:", e)
        return None

# -----------------------------
# Health Check Routes
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "CognitoFlow backend is running 🚀"
    }), 200

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "OK"}), 200

# -----------------------------
# Upload Paper
# -----------------------------
@app.route("/api/papers", methods=["POST"])
def upload_paper():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    required_fields = ["title", "subject", "year", "teacherName", "fileContent"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        query = """
            INSERT INTO papers (title, subject, year, teacher_name, file_content, uploaded_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            data["title"],
            data["subject"],
            data["year"],
            data["teacherName"],
            data["fileContent"],
            datetime.now()
        )

        cursor.execute(query, values)
        connection.commit()

        paper_id = cursor.lastrowid
        cursor.execute("SELECT * FROM papers WHERE id = %s", (paper_id,))
        paper = cursor.fetchone()

        return jsonify(paper), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

# -----------------------------
# Get Papers
# -----------------------------
@app.route("/api/papers", methods=["GET"])
def get_papers():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM papers ORDER BY year DESC")
        papers = cursor.fetchall()
        return jsonify(papers), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

# -----------------------------
# Get Subjects
# -----------------------------
@app.route("/api/subjects", methods=["GET"])
def get_subjects():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT DISTINCT subject FROM papers ORDER BY subject")
        subjects = [row[0] for row in cursor.fetchall()]
        return jsonify(subjects), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

# -----------------------------
# Analysis Endpoint
# -----------------------------
@app.route("/api/analysis/<mode>", methods=["GET"])
def get_analysis(mode):
    subject = request.args.get("subject")
    if not subject:
        return jsonify({"error": "Subject parameter is required"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT year, teacher_name, file_content FROM papers WHERE subject = %s ORDER BY year",
            (subject,)
        )
        papers = cursor.fetchall()

        if not papers:
            return jsonify({
                "topics": [],
                "years": [],
                "teachers": [],
                "values": []
            }), 200

        topic_keywords = [
            "Dynamic Programming", "Recursion", "Sorting Algorithms",
            "Graph Algorithms", "Trees", "Linked Lists", "Arrays",
            "Hashing", "Greedy Algorithms", "Divide and Conquer",
            "Backtracking", "String Algorithms", "Binary Search",
            "Stacks and Queues", "Heaps"
        ]

        topics_map = {}
        dimensions = set()

        for paper in papers:
            topics = extract_topics(paper["file_content"], topic_keywords)

            key = paper["teacher_name"] if mode == "teacher" else paper["year"]
            dimensions.add(key)

            for topic, marks in topics.items():
                topics_map.setdefault(topic, {})
                topics_map[topic][key] = topics_map[topic].get(key, 0) + marks

        topics = sorted(
            topics_map.keys(),
            key=lambda t: sum(topics_map[t].values()),
            reverse=True
        )[:10]

        dimensions = sorted(dimensions)
        values = [
            [topics_map[t].get(d, 0) for d in dimensions]
            for t in topics
        ]

        return jsonify({
            "topics": topics,
            "years": dimensions if mode == "general" else [],
            "teachers": dimensions if mode == "teacher" else [],
            "values": values
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

# -----------------------------
# Topic Extraction
# -----------------------------
def extract_topics(content, keywords):
    topics = {}
    lines = content.split("\n")

    for line in lines:
        for keyword in keywords:
            if keyword.lower() in line.lower():
                match = re.search(r"\((\d+)\s*marks?\)", line, re.IGNORECASE)
                marks = int(match.group(1)) if match else 5
                topics[keyword] = topics.get(keyword, 0) + marks

    return topics

# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
