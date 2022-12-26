const { Component, mount, xml, EventBus } = owl;

import { Searchbar } from './searchbar.js';
import { Productlist } from './productlist.js';
import { Cart } from './cart.js';

class Root extends Component {
    static template = xml`<div class="ecommerce-app">
       <Searchbar bus="bus"/>
       <Productlist bus="bus"/>
       <Cart bus="bus" />
  </div>`;
    static components = {Searchbar,Productlist,Cart}
    bus = new EventBus();
}

mount(Root, document.body);
