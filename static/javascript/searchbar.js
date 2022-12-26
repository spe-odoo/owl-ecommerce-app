const { Component, xml, useRef, onMounted } = owl;

export class Searchbar extends Component{
    static template = xml`<input type='text' placeholder='Search..' t-ref='prod_srch'/>
    <span>
        <button t-on-click="toSearch">Search</button>
    </span>
    `;
    static props = ['bus'];
    search_input = useRef("prod_srch");

    getProducts(method = 'GET', data = undefined) {
        if (method == 'POST') {
            fetch('/search',{
                method:'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }).then((response) => (response.json()))
            .then((data) => {
                console.log(data);
                this.props.bus.trigger("productlister",data);
                });
        }
        else{
            fetch('/search')
            .then((response) => (response.json()))
            .then((data) => {
                console.log(data);
                this.props.bus.trigger("productlister",data);
                });
        }
    }

    toSearch(){
        const data = {
            'name' : this.search_input.el.value
        }
        if (this.search_input.el.value != ""){
            this.getProducts('POST', data);
        }
        else {
            this.getProducts();
        }
    }

    setup(){
        onMounted(() => {this.getProducts();});
    }
}
