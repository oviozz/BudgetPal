


import base64
from flask import Flask, request, jsonify, json
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
import tempfile
import os
from butler import Client
from datetime import datetime

api_key = ''
queue_id = ''

app = Flask(__name__)
CORS(app)


cluster = ""

client = MongoClient(cluster)
db = client["ReceiptTrack"]


@app.route('/upload-image', methods=['POST']) # just have them post uuid
def create_data():
    image_data = request.json.get('imageData')
    photo_data = base64.b64decode(image_data)
    user_id = request.json.get('UUID')
    store_name = request.json.get('store_name')


    return upload_receipt(photo_data, user_id, store_name)


def upload_receipt(image_data, user_id, store_name_item):


    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name

    try:
        user = db[f"{user_id}"]

        ocr_client = Client(api_key)
        ocr_response = ocr_client.extract_document(queue_id, temp_file_path, mime_type='image/jpeg')

        items_table = next((table for table in ocr_response.tables if table.table_name == "Items"), None)

        total_field = next((field for field in ocr_response.form_fields if field.field_name == 'Total'), None)

        current_date = datetime.now().strftime("%Y-%m-%d")

        existing_receipt = user.find_one({"date.timestamp": current_date})

        if existing_receipt:
            updated_receipt = user.find_one_and_update(
                {"date.timestamp": current_date},
                {"$push": {"date.receipts": {
                    'storeName': store_name_item,
                    'purchasedItems': [{
                        'name': row.cells[0].value,
                        'price': row.cells[-1].value
                    } for row in items_table.rows[::-1] if row.cells[0].value and row.cells[-1].value],
                    'total': total_field.value
                }}},
                return_document= ReturnDocument.AFTER
            )

            return json.dumps(updated_receipt['date'])
        else:
            new_receipt = {
                "date": {
                    "timestamp": current_date,
                    "receipts": [{
                        'storeName': store_name_item,
                        'purchasedItems': [{
                            'name': row.cells[0].value,
                            'price': row.cells[-1].value
                        } for row in items_table.rows[::-1] if row.cells[0].value and row.cells[-1].value],
                        'total': total_field.value
                    }]
                }
            }
            user.insert_one(new_receipt)

            return json.dumps(new_receipt['date'])

    finally:
        os.remove(temp_file_path)



@app.route('/get/<uuid_value>')
def get_receipts(uuid_value):
    uui_id = uuid_value
    response_json = get_product_names_and_prices(uui_id)
    return response_json


@app.route('/get_week/<uuid_value>')
def get_week_receipts(uuid_value):
    uui_id = uuid_value
    response_json = get_total_sum_of_receipts_week(uui_id)
    return response_json

@app.route('/get_month/<uuid_value>')
def get_month_receipts(uuid_value):
    uuid_id = uuid_value
    response_json = get_total_sum_of_receipts_month(uuid_value)
    return response_json

def get_all_receipts_by_user(uui_id):
    user = db[f"{uui_id}"]
    # Find all receipts for the user
    receipts = list(user.find())

    # Extract the necessary data and format it as desired
    results = []
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            store_name = item['storeName']
            purchased_items = item['purchasedItems']
            total = item['total']
            timestamp = receipt['date']['timestamp'] # add timestamp field

            items_formatted = []
            for item in purchased_items:
                item_formatted = {
                    "name": item['name'],
                    "price": item['price']
                }
                items_formatted.append(item_formatted)

            result = {
                "receipt": {
                    "store": {
                        "name": store_name
                    }
                },
                "allpurchasedItems": items_formatted,
                "Total": total,
                "timestamp": timestamp # add timestamp field
            }

            results.append(result)

    return results


def get_product_names_and_prices(uui_id):
    user = db[f"{uui_id}"]
    receipts = list(user.find())
    results = []
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            store_name = item['storeName']
            purchased_items = item['purchasedItems'][::-1]
            total = item['total']
            items_formatted = []
            for item in purchased_items:
                item_formatted = {
                    "name": item['name'],
                    "price": item['price'],
                    "timestamp": receipt['date']['timestamp'],
                    "store_name": store_name
                }
                items_formatted.append(item_formatted)
            result = {
                "receipt": {
                    "store": {
                        "name": store_name
                    }
                },
                "allpurchasedItems": items_formatted,
                "Total": total
            }
            results.append(result)
    result1 = []
    for receipt in results:
        for item in receipt['allpurchasedItems']:
            product_name = item['name']
            price = item['price']
            timestamp = item['timestamp']  # Get timestamp from each item
            store_name = item['store_name']
            result1.append({"name": product_name, "price": price, "timestamp": timestamp, "store_name": store_name})
    return result1



@app.route('/get_products_by_name/<uui_id>/<product_name>')
def get_products_by_name_route(uui_id, product_name):
    user = db[f"{uui_id}"]
    receipts = list(user.find())

    # Iterate through all receipts and their items to find matching products
    matching_items = []
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            for purchased_item in item['purchasedItems']:
                if purchased_item['name'].lower() == product_name.lower():
                    matching_items.append(purchased_item)

    # Extract the necessary data and format it as desired
    results = []
    for receipt in receipts:
        for item in matching_items:
            if item in receipt['date']['receipts'][0]['purchasedItems']:
                item_formatted = {
                    "name": item['name'],
                    "price": item['price'],
                    'timestamp': receipt['date']['timestamp']
                }
                results.append(item_formatted)

    return jsonify(results)

def get_store_info(uui_id, store_name):
    user = db[f"{uui_id}"]
    receipts = list(user.find())

    # Iterate through all receipts and find matching store
    matching_receipts = []
    for receipt in receipts:
        if receipt['date']['receipts'][0]['storeName'].lower() == store_name.lower():
            matching_receipts.append(receipt)

    # Extract the necessary data and format it as desired
    results = []
    for receipt in matching_receipts:
        store_name = receipt['date']['receipts'][0]['storeName']
        total = receipt['date']['receipts'][0]['total']
        purchased_items = []
        for item in receipt['date']['receipts'][0]['purchasedItems']:
            item_formatted = {
                "name": item['name'],
                "price": item['price']
            }
            purchased_items.append(item_formatted)

        result = {
            "receipt": {
                "store": {
                    "name": store_name
                }
            },
            "purchasedItems": purchased_items,
            "Total": total
        }

        results.append(result)

    return results

def delete_document_by_timestamp(uui_id, date):
    # Connect to MongoDB
    user = db[f"{uui_id}"]
    # Convert the timestamp to a datetime object
    date_obj = datetime.strptime(date, '%Y-%m-%d')

    # Find the document with the specified timestamp and delete it
    result = user.delete_one({'date.timestamp': date})
    if result.deleted_count == 1:
        return "TRUE"
    else:
        return "FALSE"

def get_total_sum_of_receipts_week(uui_id):
    user = db[f"{uui_id}"]
    # Find all receipts for the user
    receipts = list(user.find())
    # Extract the necessary data and format it as desired
    results = [0] * 7  # initialize array with 7 elements, all set to 0
    today = datetime.now().date()
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            receipt_date = datetime.strptime(receipt['date']['timestamp'], "%Y-%m-%d").date()
            days_ago = (today - receipt_date).days
            if 0 <= days_ago < 7:
                total_price = item['total']
                results[6 - days_ago] += float(str(total_price).replace('$', ''))
    return results



def get_total_sum_of_receipts_month(uui_id):
    user = db[f"{uui_id}"]
    # Find all receipts for the user
    receipts = list(user.find())
    # Extract the necessary data and format it as desired
    results = [0] * 30  # initialize array with 30 elements, all set to 0
    today = datetime.now().date()
    start_of_month = today.replace(day=1)
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            receipt_date = datetime.strptime(receipt['date']['timestamp'], "%Y-%m-%d").date()
            if start_of_month <= receipt_date <= today:
                days_ago = (today - receipt_date).days
                total_price = item['total']
                days_since_start_of_month = (receipt_date - start_of_month).days
                results[days_since_start_of_month] += float(total_price)
    current_day_index = (today - start_of_month).days
    results[current_day_index] = results[current_day_index] if current_day_index < 30 else 0
    return results


@app.route('/get_year/<uui_id>')
def get_total_sum_of_receipts_year(uui_id):
    user = db[f"{uui_id}"]
    # Find all receipts for the user
    receipts = list(user.find())
    # Extract the necessary data and format it as desired
    results = [0] * 12  # initialize array with 12 elements, one for each month of the year
    current_year = datetime.now().year
    today = datetime.now().date()
    for receipt in receipts:
        for item in receipt['date']['receipts']:
            receipt_date = datetime.strptime(receipt['date']['timestamp'], "%Y-%m-%d").date()
            if receipt_date.year == current_year:
                month_index = receipt_date.month - 1
                total_price = item['total']
                results[month_index] += float(str(total_price).replace('$', ''))
    current_month_index = today.month - 1
    results[current_month_index] = results[current_month_index] if current_month_index < 12 else 0
    return results

@app.route('/search/<user_id>/character')
def search_receipts(user_id, character):
    if user_id not in db:
        return jsonify({'error': f'User {user_id} not found'})

    user = db[user_id]
    receipts = user.find({})

    matching_receipts = []
    for receipt in receipts:
        for purchased_item in receipt['date']['receipts']:
            store_name = purchased_item['storeName']
            if store_name.startswith(character):
                matching_receipts.append(purchased_item)
            else:
                matching_items = []
                for item in purchased_item['purchasedItems']:
                    name = item['name']
                    if name.startswith(character):
                        matching_items.append(item)
                if matching_items:
                    matching_purchased_item = purchased_item.copy()
                    matching_purchased_item['purchasedItems'] = matching_items
                    matching_receipts.append(matching_purchased_item)

    if not matching_receipts:
        return jsonify({'message': 'No matching receipts found'})

    return jsonify(matching_receipts)



if __name__ == '__main__':
    app.run(debug=True)
