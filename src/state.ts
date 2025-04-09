import { createDummyStore } from "./dummy/utils";
import logo from "./assets/logo.jpg";
import banner from "./assets/banner.jpg";
import productsData from './products.json';
import { atom, selector } from "recoil";
import {
  Address,
  HeaderType,
  StoreOrder,
  Product,
  ProductInfoPicked,
  Store,
} from "./models";
import { getRandomInt } from "./utils";
import { filter } from "./constants/referrence";

// export const storeState = selector<Store>({
//   key: "store",
//   get: () => {
//     return createDummyStore();
//   },
// });


export const storeState = selector<Store>({
  key: "store",
  get: async () => {
    // const response = await fetch("https://dummyjson.com/products");
    // const data = await response.json();
    return {
      id: 1,
      nameStore: "The 92 Store",
      address: "TP. Việt Trì, Phú Thọ",
      logoStore: logo, // Sử dụng ảnh local
      bannerStore: banner, // Sử dụng ảnh local
      categories: ["Tất cả sản phẩm", "Chè", "Tư Vấn Mini App"],
      followers: 2145,
      type: "personal",
      listProducts: productsData.products.map((product) => ({
        id: product.id,
        nameProduct: product.title,
        description: product.description,
        options: [],
        imgProduct: product.images[0],
        retailPrice: product.price,
        salePrice: (product.price * (100 - product.discountPercentage)) / 100,
      })),
    };
  },
});

export const productState = selector<Product[]>({
  key: "product",
  get: ({ get }) => {
    const store = get(storeState);
    return store.listProducts;
  },
});

export const cartState = atom<StoreOrder>({
  key: "cart",
  default: {
    status: "pending",
    listOrder: [],
    date: new Date(),
  },
});

export const cartTotalPriceState = selector<number>({
  key: "cartTotalPrice",
  get: ({ get }) => {
    const cart = get(cartState);
    const products = get(productState);
    const result = cart.listOrder.reduce(
      (total, item) =>
        total +
        Number(item.order.quantity) *
          Number(products.find((product) => product.id === item.id)?.salePrice),
      0
    );
    return result;
  },
});

export const headerState = atom<HeaderType>({
  key: "header",
  default: {},
});

export const searchProductState = atom<string>({
  key: "searchProduct",
  default: "",
});

export const activeCateState = atom<number>({
  key: "activeCate",
  default: 0,
});

export const activeFilterState = atom<string>({
  key: "activeFilter",
  default: filter[0].key,
});

export const storeProductResultState = selector<Product[]>({
  key: "storeProductResult",
  get: ({ get }) => {
    get(activeCateState);
    get(searchProductState);

    const store = get(storeState);
    const pos = getRandomInt(store.listProducts.length - 122, 0);
    const num = getRandomInt(120, 50);
    return [...store.listProducts.slice(pos, pos + num)];
  },
});

export const addressState = atom<Address>({
  key: "address",
  default: {
    city: "",
    district: "",
    ward: "",
    detail: "",
  },
});

export const openProductPickerState = atom<boolean>({
  key: "openProductPicker",
  default: false,
});

export const initialProductInfoPickedState = {
  productId: -1,
  isUpdate: false,
};

export const productInfoPickedState = atom<ProductInfoPicked>({
  key: "productInfoPicked",
  default: initialProductInfoPickedState,
});
