export type Category =
  | "cakes"
  | "muffins"
  | "cookies"
  | "chocolates"
  | "jars"
  | "hampers";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;          // INR
  unit?: string;          // "500g" | "Box of 6" | "Per piece"
  description: string;
  flavors: string[];      // for filter
  bestseller?: boolean;
  eggless?: boolean;
  jainFriendly?: boolean;
  customizable?: boolean;
  image: string;          // emoji glyph used as visual placeholder
  bg: string;             // tailwind bg color class
};

export type Filters = {
  category?: Category | "all";
  minPrice?: number;
  maxPrice?: number;
  flavor?: string;
  bestseller?: boolean;
};
