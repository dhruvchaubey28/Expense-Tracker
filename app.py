from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from datetime import datetime
import os

app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/expense_tracker_db"))
db = client["expense_tracker_db"]
expenses_collection = db["expenses"]
budgets_collection = db["budgets"]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/add_expense', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        if not data or 'description' not in data or 'amount' not in data or 'category' not in data:
            return jsonify({"error": "Missing fields"}), 400
        expense = {
            "description": data['description'],
            "amount": float(data['amount']),
            "category": data['category'],
            "date": datetime.now().isoformat()
        }
        expenses_collection.insert_one(expense)
        return jsonify({"message": "Expense added successfully"}), 201
    except Exception as e:
        print(f"Error in add_expense: {e}")  # Debugging information
        return jsonify({"error": "Failed to add expense", "message": str(e)}), 500


@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    try:
        expenses = list(expenses_collection.find({}, {"_id": 0}))  # Exclude _id from response
        return jsonify(expenses), 200
    except Exception as e:
        print(f"Error in get_expenses: {e}")  # Debugging information
        return jsonify({"error": "Failed to fetch expenses", "message": str(e)}), 500


@app.route('/set_budget', methods=['POST'])
def set_budget():
    try:
        data = request.get_json()
        if not data or 'category' not in data or 'amount' not in data:
            return jsonify({"error": "Missing fields"}), 400
        budget = {
            "category": data['category'],
            "amount": float(data['amount']),
            "start_date": data.get('start_date', datetime.now().isoformat()),
            "end_date": data.get('end_date', datetime.now().isoformat())
        }
        budgets_collection.insert_one(budget)
        return jsonify({"message": "Budget set successfully"}), 201
    except Exception as e:
        print(f"Error in set_budget: {e}")  # Debugging information
        return jsonify({"error": "Failed to set budget", "message": str(e)}), 500


@app.route('/get_budget', methods=['GET'])
def get_budget():
    try:
        budgets = list(budgets_collection.find({}, {"_id": 0}))  # Exclude _id from response
        return jsonify(budgets), 200
    except Exception as e:
        print(f"Error in get_budget: {e}")  # Debugging information
        return jsonify({"error": "Failed to fetch budgets", "message": str(e)}), 500


@app.route('/get_insights', methods=['GET'])
def get_insights():
    try:
        # Calculate total expenses per category
        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        insights = list(expenses_collection.aggregate(pipeline))
        return jsonify(insights), 200
    except Exception as e:
        print(f"Error in get_insights: {e}")  # Debugging information
        return jsonify({"error": "Failed to fetch insights", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
