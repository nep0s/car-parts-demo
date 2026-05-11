export interface Part {
  id: number;
  name: string;
  price: number; // CLP, whole numbers
  stock: number;
}

export const PARTS_PER_PAGE = 12;

export const parts: Part[] = [
  { id: 1,  name: "Filtro de aceite",                  price: 4990,   stock: 48 },
  { id: 2,  name: "Bujías (set x4)",                   price: 12990,  stock: 23 },
  { id: 3,  name: "Pastillas de freno delanteras",      price: 24990,  stock: 15 },
  { id: 4,  name: "Disco de freno",                     price: 39990,  stock: 10 },
  { id: 5,  name: "Correa de distribución",             price: 34990,  stock: 7  },
  { id: 6,  name: "Amortiguador delantero",             price: 89990,  stock: 6  },
  { id: 7,  name: "Batería 60Ah",                       price: 79990,  stock: 12 },
  { id: 8,  name: "Bomba de agua",                      price: 45990,  stock: 4  },
  { id: 9,  name: "Termostato",                         price: 8990,   stock: 31 },
  { id: 10, name: "Radiador de agua",                   price: 149990, stock: 3  },
  { id: 11, name: "Alternador",                         price: 129990, stock: 2  },
  { id: 12, name: "Motor de arranque",                  price: 119990, stock: 5  },
  { id: 13, name: "Filtro de aire",                     price: 9990,   stock: 54 },
  { id: 14, name: "Filtro de combustible",              price: 7990,   stock: 40 },
  { id: 15, name: "Sensor de oxígeno",                  price: 29990,  stock: 9  },
  { id: 16, name: "Sensor MAP",                         price: 22990,  stock: 11 },
  { id: 17, name: "Bobina de encendido",                price: 19990,  stock: 18 },
  { id: 18, name: "Inyector de combustible",            price: 49990,  stock: 0  },
  { id: 19, name: "Bomba de gasolina",                  price: 69990,  stock: 4  },
  { id: 20, name: "Depósito de expansión",              price: 15990,  stock: 8  },
  { id: 21, name: "Manguera de radiador superior",      price: 11990,  stock: 20 },
  { id: 22, name: "Manguera de radiador inferior",      price: 10990,  stock: 19 },
  { id: 23, name: "Palier derecho",                     price: 99990,  stock: 3  },
  { id: 24, name: "Palier izquierdo",                   price: 99990,  stock: 3  },
  { id: 25, name: "Cruceta de palier",                  price: 18990,  stock: 14 },
  { id: 26, name: "Rótula de dirección",                price: 27990,  stock: 7  },
  { id: 27, name: "Barra estabilizadora",               price: 32990,  stock: 0  },
  { id: 28, name: "Silent block",                       price: 14990,  stock: 22 },
  { id: 29, name: "Bujes de suspensión",                price: 16990,  stock: 16 },
  { id: 30, name: "Tensor de correa",                   price: 24990,  stock: 9  },
  { id: 31, name: "Polea tensora",                      price: 21990,  stock: 6  },
  { id: 32, name: "Bomba de dirección hidráulica",      price: 89990,  stock: 2  },
  { id: 33, name: "Filtro de habitáculo",               price: 6990,   stock: 35 },
  { id: 34, name: "Líquido de frenos DOT4 (500ml)",    price: 5990,   stock: 50 },
  { id: 35, name: "Aceite de motor 5W-30 (1L)",        price: 18990,  stock: 30 },
  { id: 36, name: "Refrigerante concentrado (1L)",     price: 12990,  stock: 0  },
];

export function formatCLP(amount: number): string {
  return amount.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
