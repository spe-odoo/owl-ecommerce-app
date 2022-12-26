const { Component, xml, onWillStart,useState, useRef} = owl;

export class Productlist extends Component{
    static template = xml`
        <div class="product-list">
            <div class="card-group" t-ref="product_list">
                <t t-foreach="Object.values(this.products.key)" t-as="product" t-key="product.id">
                    <div class="card">
                        <div class="card-body">
                            <h1><t t-esc="product.name"/></h1>
                            <p class="product-price"><t t-esc="product.price"/>$</p>
                            <p><button class="add_to_cart_btn" t-on-click="addToCart_click" t-att-data-product-id="product.id">Add to Cart</button></p>
                        </div>
                    </div>
                </t>
            </div>
        </div>`;
    static props = ['bus'];
    productListRef = useRef("product_list");

    render(data){
       this.products.key = data.detail;
    }

    setup(){
        this.products = useState({ key : ''});
        onWillStart(async () => {
            this.props.bus.addEventListener("productlister",this.render.bind(this))
          });
    }

    addToCart_click(ev) {
      let prod_id = ev.target.dataset.productId;
      const data = {'prod_id':prod_id}
      ev.target.innerHTML = "In Cart";
      ev.target.disabled = true;

      fetch('/add_to_cart', {
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
       })
        .then((response) => response.json())
        .then((data) => {
            console.log("data",data);
            let  add_to_cart_btn_dom = this.productListRef.el.querySelectorAll('.add_to_cart_btn');
            this.props.bus.trigger("cartfiller",[data,add_to_cart_btn_dom]);
        });
    }
}
