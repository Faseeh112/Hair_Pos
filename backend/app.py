# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import requests
from pymongo import ASCENDING

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")  # change for Atlas
db = client['hair_clinic']

products_col = db['products']
services_col = db['services']
sales_col = db['sales']
staff_col = db['staff']

# --- AI engine ---
def ai_engine(prompt):
    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "gemma:latest", "prompt": prompt, "stream": False},
            timeout=300
        )
        return r.json().get("response", "AI response missing.")
    except Exception as e:
        return f"Ollama Error: {str(e)}"

# --- Products & Services ---
@app.route("/api/products")
def get_products():
    products = list(products_col.find({}, {"_id": 0}))
    return jsonify(products)

@app.route("/api/services")
def get_services():
    services = list(services_col.find({}, {"_id": 0}))
    return jsonify(services)

# --- AI Chat ---
@app.route("/api/ai_chat", methods=["POST"])
def ai_chat():
	user_query = request.json.get("message", "").strip()
	if not user_query:
		return jsonify({"answer": "Please provide a valid question."})

	# Fetch all inventory data to give the AI full context of what is in stock
	prod_list = list(products_col.find({}, {"_id": 0}))
	serv_list = list(services_col.find({}, {"_id": 0}))

	# Create a detailed inventory string including stock numbers and descriptions
	inventory_details = ""
	if prod_list:
		inventory_details += "PRODUCTS IN SYSTEM:\n"
		for p in prod_list:
			status = f"IN STOCK ({p.get('Stock')} units)" if p.get('Stock', 0) > 0 else "OUT OF STOCK"
			inventory_details += f"- {p['Name']} | Price: ${p.get('Price')} | {status} | Desc: {p.get('Description', 'N/A')}\n"

	if serv_list:
		inventory_details += "\nSERVICES IN SYSTEM:\n"
		for s in serv_list:
			inventory_details += f"- {s['Name']} | Price: ${s.get('Price')} | Desc: {s.get('Description', 'N/A')}\n"

	# Keywords for focus detection (optional, but helps the AI prioritize)
	lower_query = user_query.lower()

	context_prompt = f"""
SYSTEM: You are a professional sales consultant for a Hair Clinic.
Your goal is to greet users, answer basic questions, and provide expert product recommendations.

CURRENT INVENTORY DATA:
{inventory_details}

STRICT GUIDELINES:
1. GREETINGS: If the user says 'hi', 'hello', or asks 'who are you', reply with a friendly professional greeting.
2. PRODUCT DESCRIPTION: If a user asks about a specific product (e.g., "What is the Foundation Shampoo?"), describe it using the 'Desc' provided in the inventory above.
3. STOCK AWARENESS:
   - If an item has 0 units, tell the user it is currently 'Out of Stock' but we can notify them when it returns.
   - If an item has low stock (1-3 units), mention that "Stock is limited, order soon!"
4. HAIR RECOMMENDATIONS: If the user mentions hair issues (hair loss, dandruff, oily scalp), recommend the most relevant products or services from the list above.
5. FORMATTING: Use bold text for product names, bullet points for lists, and clear headings.
6. SAFETY: Do not give medical prescriptions; suggest products as cosmetic/supportive solutions.

USER QUERY: "{user_query}"
RESPONSE:
"""
	# Generate the response using your AI engine
	answer = ai_engine(context_prompt)

	return jsonify({"answer": answer})

@app.route("/api/products", methods=["POST"])
def add_product():
	data = request.json

	# 1. Validation: Ensure required fields exist
	if not data.get("Name") or data.get("Price") is None:
		return jsonify({"error": "Name and Price are required"}), 400

	try:
		# 2. Construction: Convert types to prevent DB errors
		new_product = {
			"Name": data.get("Name"),
			"Price": float(data.get("Price")),  # Ensure number
			"Stock": int(data.get("Stock", 0)),  # Ensure integer
			"Image": data.get("Image", ""),  # Base64 string from frontend
			"Category": "products",
			"CreatedAt": datetime.utcnow()  # Useful for sorting
		}

		products_col.insert_one(new_product)
		return jsonify({"status": "success", "message": "Product added"}), 201

	except (ValueError, TypeError) as e:
		return jsonify({"error": "Invalid price or stock format"}), 400



@app.route("/api/products/<name>", methods=["PUT"])
def update_product(name):
    data = request.json
    db.products.update_one({"Name": name}, {"$set": {
        "Price": data.get("Price"),
        "Stock": data.get("Stock"),
        "Name": data.get("Name")
    }})
    return jsonify({"message": "Product Updated"}), 200


@app.route("/api/services/<name>", methods=["PUT"])
def update_service(name):
	try:
		data = request.json

		# 1. Prepare the update dictionary
		update_fields = {
			"Name": data.get("Name"),
			"Price": float(data.get("Price", 0)),
			"StaffIDs": data.get("StaffIDs", ""),
			"RoomIDs": data.get("RoomIDs", ""),
			"Duration": int(data.get("Duration", 30))
		}

		# 2. Execute the update
		# We use the original 'name' from the URL to find the document
		result = db.services.update_one(
			{"Name": name},
			{"$set": update_fields}
		)

		if result.matched_count == 0:
			return jsonify({"error": "Service not found"}), 404

		return jsonify({"message": "Service Updated Successfully"}), 200
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@app.route("/api/sales", methods=["POST"])
def add_sale():
	data = request.json
	# Log it to your terminal to check if the names are there!
	print("Incoming Data:", data)

	new_sale = {
		"Date": data.get("Date"),
		"Total": data.get("Total"),
		"Items": data.get("Items", []),
		"FullDetails": data.get("FullDetails", [])  # <--- MUST INCLUDE THIS
	}

	db.sales.insert_one(new_sale)
	return jsonify({"message": "Saved"}), 201

@app.route("/api/products/image", methods=["PUT"])
def update_product_image():
	data = request.json
	name = data.get("Name")
	image_data = data.get("Image")

	if not name:
		return jsonify({"error": "Product name is required"}), 400

	# Update the specific product found by name
	result = products_col.update_one(
		{"Name": name},
		{"$set": {"Image": image_data}}
	)

	if result.matched_count == 0:
		return jsonify({"error": "Product not found"}), 404

	return jsonify({"status": "success", "message": "Image updated"})

# --- USER MANAGEMENT ---
@app.route("/api/login", methods=["POST"])
def login():
	data = request.json
	username = data.get("username")
	password = data.get("password")

	# Search for user in MongoDB
	user = db['users'].find_one({"username": username, "password": password}, {"_id": 0})
	if user:
		return jsonify(user), 200
	return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/signup", methods=["POST"])
def signup():
	data = request.json
	# Check if user exists
	if db['users'].find_one({"username": data.get("username")}):
		return jsonify({"error": "User already exists"}), 400

	# New signups are ALWAYS 'user' role
	new_user = {
		"username": data.get("username"),
		"password": data.get("password"),
		"role": "user"
	}
	db['users'].insert_one(new_user)
	return jsonify({"username": new_user['username'], "role": "user"}), 201

@app.route("/api/admin/create-account", methods=["POST"])
def admin_create():
    data = request.json
    db['users'].insert_one({
       "username": data.get("username"),
       "password": data.get("password"), # In production, use hashing!
       "role": data.get("role", "user")
    })
    return jsonify({"status": "Account created"}), 201

@app.route("/api/services", methods=["POST"])
def add_service():
    data = request.json
    staff_input = data.get("StaffIDs", "")

    # Verification: Check if Staff IDs exist in 'staff' collection
    ids_to_check = [s.strip() for s in staff_input.split(",") if s.strip()]
    for s_id in ids_to_check:
        exists = db['staff'].find_one({"StaffID": s_id})
        if not exists:
            return jsonify({"error": f"Staff ID {s_id} does not exist. Please add staff first."}), 400

    new_service = {
        "Name": data.get("Name"),
        "Price": float(data.get("Price")),
        "StaffIDs": staff_input,
        "RoomIDs": data.get("RoomIDs"),
        "Description": data.get("Description", ""),
        "Duration": data.get("Duration", "30 mins"),
        "CreatedAt": datetime.utcnow()
    }

    services_col.insert_one(new_service)
    return jsonify({"message": "Service added successfully!"}), 201

@app.route("/api/sales")
def get_sales():
    from_date = request.args.get('from')
    to_date = request.args.get('to')

    query = {}
    if from_date and to_date:
        try:
            # If the dates coming from frontend are 2024-05-20
            start = datetime.strptime(from_date, '%Y-%m-%d')
            end = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59)
            query["Date"] = {"$gte": start, "$lte": end}
        except:
            pass # Fallback to no filter if date format is wrong

    # IMPORTANT: Ensure "Date" or "CreatedAt" is indexed in MongoDB for sorting
    sales = list(sales_col.find(query, {"_id": 0}).sort("Date", -1)) # -1 shows NEWEST first
    return jsonify(sales)

@app.route("/api/restock", methods=["POST"])
def restock_product():
    data = request.json
    name = data.get("Name")
    amount = data.get("Amount", 0)

    if not name or amount <= 0:
        return jsonify({"error": "Invalid data"}), 400

    # Increase the stock by the amount provided
    products_col.update_one(
        {"Name": name},
        {"$inc": {"Stock": amount}}
    )
    return jsonify({"message": "Stock increased successfully"}), 200

# DELETE PRODUCT OR SERVICE
@app.route("/api/<type>/<name>", methods=["DELETE"])
def delete_item(type, name):
    collection = products_col if type == "products" else services_col
    result = collection.delete_one({"Name": name})

    if result.deleted_count > 0:
        return jsonify({"message": "Deleted successfully"}), 200
    return jsonify({"error": "Item not found"}), 404

@app.route("/api/staff", methods=["POST"])
def update_staff():
    data = request.json
    staff_id = data.get("StaffID")
    name = data.get("Name") # Get the name from the request

    # Update or Create (upsert)
    db['staff'].update_one(
        {"StaffID": staff_id},
        {"$set": {
            "Name": name, # CRITICAL: Save the name here
            "LeaveStart": data.get("LeaveStart"),
            "LeaveEnd": data.get("LeaveEnd")
        }},
        upsert=True
    )
    return jsonify({"status": "success"})

@app.route("/api/checkout", methods=["POST"])
def checkout():
	data = request.json
	cart_items = data.get("items", [])
	# NEW: Get the customer name from the request
	customer_name = data.get("CustomerName", "Guest")

	processed_items = []
	for item in cart_items:
		# Keep all existing fields (StartTime, bookingId, etc.)
		processed_items.append(item)

		# Reduce stock for products
		if not item.get("StartTime"):
			qty = int(item.get("quantity", 1))
			products_col.update_one(
				{"Name": item.get("Name")},
				{"$inc": {"Stock": -qty}}
			)

	# Save the sale with the CustomerName included
	sales_col.insert_one({
		"Date": datetime.now(),
		"CustomerName": customer_name,  # <--- Fix: Save this
		"FullDetails": processed_items,
		"Total": float(data.get("total", 0))
	})

	return jsonify({"message": "Booking Confirmed"}), 200


@app.route("/api/appointments/<booking_id>", methods=["DELETE"])
def cancel_appointment(booking_id):
	try:
		# Fix: Use $pull to remove exactly one item from the array by its ID
		result = sales_col.update_one(
			{"FullDetails.bookingId": booking_id},
			{"$pull": {"FullDetails": {"bookingId": booking_id}}}
		)

		# Cleanup: Remove sale document if it's now empty
		sales_col.delete_many({"FullDetails": {"$size": 0}})

		if result.modified_count > 0:
			return jsonify({"success": True}), 200
		return jsonify({"error": "Not found"}), 404
	except Exception as e:
		return jsonify({"error": str(e)}), 500

# In your app.py, add this route:
@app.route("/api/staff", methods=["GET"])
def get_staff():
    # Fetch all staff from the 'staff' collection and hide the MongoDB ID
    staff = list(db['staff'].find({}, {"_id": 0}))
    return jsonify(staff)

@app.route("/api/staff/<id>", methods=["DELETE"])
def delete_staff(id):
    staff_col.delete_one({"StaffID": id})
    return jsonify({"message": "Staff removed"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
# admin, abc
# user1, abc