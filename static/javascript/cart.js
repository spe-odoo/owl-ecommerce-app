const { Component, xml, useRef,useState,useComponent, useEffect,onWillStart, onMounted, onWillUnmount, onWillUpdateProps, onPatched, onWillPatch, onWillRender, onRendered, onWillDestroy } = owl;

export class Cart extends Component {
    static template = xml`
        <div class="container bootstrap snippets bootdey">
            <div class="col-md-9 col-sm-8 content">
                <div class="row">
                    <div class="col-md-12">
                        <h2> <center>Cart</center> </h2>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="panel panel-info panel-shadow">
                            <div class="panel-body">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                        </tr>
                                        </thead>
                                        <tbody class="cart-items" t-ref="cart-items">
                                            <tr t-foreach="Object.values(this.cart_items.key)" t-as="cart_item" t-key="cart_item.cart_id" class="items">
                                                <td><input type="hidden" class="cart_product_id" t-att="{'value':cart_item.product_id}"/><p class="cart_item_name"><strong><t t-esc="cart_item.name"/></strong></p></td>
                                                <td>
                                                <div class="input-group">
                                                    <span class="input-group-btn">
                                                        <button type="button" class="btn btn-danger btn-number"  data-type="minus" data-action="decrease-item" t-on-click="toDecreaseQty">
                                                            <span class="fa fa-minus"></span>
                                                        </button>
                                                    </span>
                                                    <input class="form-control input-number" type="text" t-att="{'value':cart_item.quantity}" min="1"/>
                                                    <span class="input-group-btn">
                                                        <button type="button" class="btn btn-success btn-number" data-type="plus" data-action="increase-item" t-on-click="toIncreaseQty">
                                                            <span class="fa fa-plus"></span>
                                                        </button>
                                                    </span>
                                                </div>
                                                </td>
                                                <td><p class="cart_item_price"><t t-esc="cart_item.price"/>$</p></td>
                                                <td><button class="btn badge" type="button" data-action="remove-item" t-att-data-product-id="cart_item.product_id" t-on-click="toRemoveCartItem">🗑</button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="col-sm-12">
                                        <h4 class="text-right"> <strong>Total:</strong> <span class="cart_item_total" t-ref="cart_item_total"></span></h4>
                                    </div>
                                </div>
                            </div>
                            <button class="btn badge-dark pull-right" type="button" data-action="check-out" t-on-click="toCheckOut">Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    static props = ["bus"]

    cartsRef = useRef("cart-items");
    cartItemTotalRef = useRef("cart_item_total");
    cart_items = useState({ key: ''})
    cart_all_prodId = useState({ ids:''});

    render(data){
        this.cart_items.key = data.detail[0];
        this.add_to_cart_btn_dom = data.detail[1];
    }

    setup(){
        useLogLifecycle();
        this.props.bus.addEventListener("cartfiller",this.render.bind(this));

        onPatched(()=> {
            let items = this.cartsRef.el.querySelectorAll('.items');
            this.cart_all_prodId.ids = this.cartsRef.el.querySelectorAll('.cart_product_id');
            this.cart_total = 0;
                    items.forEach(item => {
                        this.cart_total += parseFloat(item.querySelector('.cart_item_price').innerText);
                        this.cartItemTotalRef.el.innerText = this.cart_total.toFixed(2) + "$";
                    })
            })
    }

    toIncreaseQty(ev) {
        let items = this.cartsRef.el.querySelectorAll('.items');
        let data = Object.values(this.cart_items.key);
        items.forEach(item=> {
            if (item.querySelector('[data-action="increase-item"]') == ev.currentTarget){
                data.forEach(dt=> {
                    if(dt['name'] === item.querySelector('.cart_item_name').innerText){
                        let qty_input = item.querySelector('.input-number')
                        let cart_item_price = item.querySelector('.cart_item_price')
                        qty_input.value = parseInt(qty_input.value) + 1
                        cart_item_price.innerText = parseInt(qty_input.value) * parseFloat(dt['price']) + "$";
                        this.cart_total = this.cart_total + parseFloat(dt['price']);
                        this.cartItemTotalRef.el.innerText = this.cart_total.toFixed(2) + "$";
                    }
                })
            }
        })
    }

    toDecreaseQty(ev){
        let items = this.cartsRef.el.querySelectorAll('.items');
        let data = Object.values(this.cart_items.key);
        items.forEach(item=>{
            if (item.querySelector('[data-action="decrease-item"]') == ev.currentTarget){
                data.forEach(dt=> {
                    if(dt['name'] === item.querySelector('.cart_item_name').innerText){
                        let qty_input = item.querySelector('.input-number');
                        let cart_item_price = item.querySelector('.cart_item_price')
                        let val = parseInt(qty_input.value);
                        if (val >qty_input.min) {
                            qty_input.value = val - 1
                            cart_item_price.innerText = parseInt(qty_input.value) * parseFloat(dt['price']) + "$";
                            this.cart_total  = this.cart_total - parseFloat(dt['price']);
                            this.cartItemTotalRef.el.innerText = this.cart_total.toFixed(2) + "$";
                        }
                    }
                })
            }
        })
    }

    toRemoveCartItem(ev){
        let items = this.cartsRef.el.querySelectorAll('.items');
        let data = Object.values(this.cart_items.key);
        items.forEach(item=> {
            if (item.querySelector('[data-action="remove-item"]') == ev.currentTarget){
                data.forEach(dt=>{
                    if(dt['name'] === item.querySelector('.cart_item_name').innerText){
                        this.cart_total = this.cart_total - parseFloat(item.querySelector(".cart_item_price").innerText);
                        this.cartItemTotalRef.el.innerText = this.cart_total.toFixed(2) + "$";
                        let prod_id = item.querySelector('[data-action="remove-item"]').dataset.productId;
                        let data_prod_id = {'prod_id':prod_id}
                        item.remove();
                        data.pop(dt)
                        this.cart_items.key = data;
                        this.add_to_cart_btn_dom.forEach(add_to_cart_btn => {
                            if (add_to_cart_btn.dataset.productId == prod_id){
                                add_to_cart_btn.innerHTML = "Add to cart";
                                add_to_cart_btn.disabled = false;
                            }
                        })
                        fetch('/remove_item',{
                            method:'POST',
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify(data_prod_id)
                          });
                    }
                })
            }
        })
    }

    toCheckOut(ev){
        ev.preventDefault();
        let products = [];
        const product_ids = this.cart_all_prodId.ids;
        product_ids.forEach(product_id => {products.push(product_id.value)})
        this.add_to_cart_btn_dom.forEach(add_to_cart_btn => {
            if (products.includes(add_to_cart_btn.dataset.productId)) {
                add_to_cart_btn.innerHTML = "Add to cart";
                add_to_cart_btn.disabled = false;
            }
            })
        fetch('/checkout', {
            method:'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({'product_ids' : products})
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            this.cartsRef.el.innerHTML = "";
            this.cartItemTotalRef.el.innerHTML = parseFloat(0.00).toFixed(2) + "$";
            this.cart_items.key = '';
        })
    }
}

function useLogLifecycle(){
    const component = useComponent();
    const name = component.constructor.name;
    onWillStart(() => console.log(`${name}:willStart`));
    onMounted(() => console.log(`${name}:mounted`));
    onWillUpdateProps(() => console.log(`${name}:willUpdateProps`));
    onWillRender(() => console.log(`${name}:willRender`));
    onRendered(() => console.log(`${name}:rendered`));
    onWillPatch(() => console.log(`${name}:willPatch`));
    onPatched(() => console.log(`${name}:patched`));
    useEffect(() => console.log(`${name}:useEffect`));
    onWillUnmount(() => console.log(`${name}:willUnmount`));
    onWillDestroy(() => console.log(`${name}:willDestroy`));
}
