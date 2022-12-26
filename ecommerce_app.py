from flask import Flask, render_template, request, jsonify
import datetime

app = Flask(__name__)
app.secret_key = "sahil"


products = [
                {
                "id" : 1,
                "name" : "Phone abc",
                "price" : "19.99"
                },
                {
                "id" : 2,
                "name" : "Charger abc",
                "price" : "10.99"
                },
                {
                "id" : 3,
                "name" : "Usb cable yui",
                "price" : "5.99"
                }
]


cart = {}
cart_item = {}


@app.route("/search", methods = ['POST','GET'])
def search():
    data = {}
    if request.method == 'POST':
        data_json = request.get_json()
        for prod in products:
            if data_json['name'] in prod['name']:
                data.update({'product'+str(prod['id']):prod})
            elif data_json['name'] == '':
                data.update({'product'+str(prod['id']):prod})
        return jsonify(data)


    if request.method == 'GET':
        for prod in products:
            data.update({'product'+str(prod['id']):prod})
        return jsonify(data)


@app.route("/add_to_cart", methods = ['POST'])
def add_to_cart():
    if request.method == 'POST':
        odr = {}
        data_json = request.get_json()
        product = get_detail(int(data_json['prod_id']))

        if not cart:
            crt = {'order-'+data_json['prod_id'] : {
            'product_id': data_json['prod_id'],
            'date' : datetime.datetime.now()
            }}
            cart.update(crt)
            crt_item = {'order-line'+data_json['prod_id']:{
                        'cart_id': 'order-'+data_json['prod_id'],
                        'product_id': data_json['prod_id'],
                        'name': product['name'],
                        'price': product['price'],
                        'quantity': 1}}
            cart_item.update(crt_item)
            return jsonify(cart_item)
        elif cart:
            for order in cart.values():
                if data_json['prod_id'] in order['product_id']:
                    odr.update({'order'+order['product_id']:order})
                    return jsonify({'in-cart':'already in cart'})
            else:
                crt = {'order-'+data_json['prod_id'] : {
                'product_id': data_json['prod_id'],
                'date' : datetime.datetime.now()
                }}
                cart.update(crt)
                crt_item = {'order-line'+data_json['prod_id']:{
                        'cart_id': 'order-'+data_json['prod_id'],
                        'product_id': data_json['prod_id'],
                        'name': product['name'],
                        'price': product['price'],
                        'quantity': 1}}
                cart_item.update(crt_item)
                return jsonify(cart_item)


@app.route("/remove_item", methods = ['POST'])
def remove_item():
    if request.method == 'POST':
        data_json = request.get_json()
        element_remover(cart, data_json['prod_id'], 'product_id')
        element_remover(cart_item, data_json['prod_id'], 'product_id')
        return jsonify({"item_removed":"Cart item is removed."})


@app.route("/checkout",methods = ['POST'])
def checkout():
    if request.method == 'POST':
        data_json = request.get_json()

        for id in data_json['product_ids']:
            element_remover(cart, id, 'product_id')
            element_remover(cart_item, id, 'product_id')

        return jsonify({"cart-clear":"Good news!!We have confirmed your order and it will be delivered soon."})


@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template("index.html")


# utility methods
def element_remover(obj,val,k):
    for key, value in obj.copy().items():
        if value[k] == val:
            obj.pop(key)
    return obj

def get_detail(val=None):
    for product in products:
        if val in product.values():
            return product


if __name__ =='__main__':
    app.run(debug = True)
