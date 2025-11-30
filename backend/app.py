from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'cognitoflow'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', '')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@app.route('/api/papers', methods=['POST'])
def upload_paper():
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)

        query = """
        INSERT INTO papers (title, subject, year, teacher_name, file_content, uploaded_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        values = (
            data.get('title'),
            data.get('subject'),
            data.get('year'),
            data.get('teacherName'),
            data.get('fileContent'),
            datetime.now()
        )

        cursor.execute(query, values)
        connection.commit()

        paper_id = cursor.lastrowid

        cursor.execute("SELECT * FROM papers WHERE id = %s", (paper_id,))
        paper = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify(paper), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/papers', methods=['GET'])
def get_papers():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM papers ORDER BY year DESC")
        papers = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(papers), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("SELECT DISTINCT subject FROM papers ORDER BY subject")
        subjects = [row[0] for row in cursor.fetchall()]

        cursor.close()
        connection.close()

        return jsonify(subjects), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis/<mode>', methods=['GET'])
def get_analysis(mode):
    try:
        subject = request.args.get('subject')
        if not subject:
            return jsonify({'error': 'Subject parameter is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, year, teacher_name, file_content FROM papers WHERE subject = %s ORDER BY year",
            (subject,)
        )
        papers = cursor.fetchall()

        cursor.close()
        connection.close()

        if not papers:
            return jsonify({
                'topics': [],
                'years': [],
                'values': [],
                'teachers': []
            }), 200

        topics_map = {}
        dimensions_set = set()

        topic_keywords = [
            'Dynamic Programming', 'Recursion', 'Sorting Algorithms',
            'Graph Algorithms', 'Trees', 'Linked Lists', 'Arrays',
            'Hashing', 'Greedy Algorithms', 'Divide and Conquer',
            'Backtracking', 'String Algorithms', 'Binary Search',
            'Stacks and Queues', 'Heaps'
        ]

        for paper in papers:
            topics = extract_topics(paper['file_content'], topic_keywords)

            if mode == 'teacher' and paper['teacher_name']:
                key = paper['teacher_name']
                dimensions_set.add(paper['teacher_name'])
            else:
                key = paper['year']
                dimensions_set.add(paper['year'])

            for topic, marks in topics.items():
                if topic not in topics_map:
                    topics_map[topic] = {}
                if key not in topics_map[topic]:
                    topics_map[topic][key] = 0
                topics_map[topic][key] += marks

        topics = sorted(topics_map.keys(), key=lambda t: sum(topics_map[t].values()), reverse=True)[:10]
        dimensions = sorted(list(dimensions_set))

        values = []
        for topic in topics:
            row = []
            for dim in dimensions:
                row.append(topics_map[topic].get(dim, 0))
            values.append(row)

        result = {
            'topics': topics,
            'years': dimensions if mode == 'general' else [],
            'teachers': dimensions if mode == 'teacher' else [],
            'values': values
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_topics(content, topic_keywords):
    topics = {}
    lines = content.split('\n')

    for line in lines:
        for keyword in topic_keywords:
            if keyword.lower() in line.lower():
                import re
                marks_match = re.search(r'\((\d+)\s*marks?\)', line, re.IGNORECASE)
                marks = int(marks_match.group(1)) if marks_match else 5

                if keyword not in topics:
                    topics[keyword] = 0
                topics[keyword] += marks

    return topics

if __name__ == '__main__':
    app.run(debug=True, port=5000)
