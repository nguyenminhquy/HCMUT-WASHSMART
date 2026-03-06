export type VincomBranch = {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  slotStep: number;
  capacity: number;
};

export const VINCOM_BRANCHES: VincomBranch[] = [
  {
    name: "Vincom Center Dong Khoi",
    address: "72 Le Thanh Ton, Ben Nghe, Quan 1, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.7789,
    longitude: 106.7035,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Center Landmark 81",
    address: "720A Dien Bien Phu, Binh Thanh, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.7942,
    longitude: 106.7218,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Mega Mall Thao Dien",
    address: "161 Xa Lo Ha Noi, Thao Dien, TP Thu Duc, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.8019,
    longitude: 106.7404,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Mega Mall Grand Park",
    address: "512 Nguyen Xien, Long Thanh My, TP Thu Duc, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.8448,
    longitude: 106.8295,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Go Vap",
    address: "12 Phan Van Tri, Ward 7, Go Vap, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.8383,
    longitude: 106.6684,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Le Van Viet",
    address: "50 Le Van Viet, Hiep Phu, TP Thu Duc, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.8493,
    longitude: 106.7719,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Thu Duc",
    address: "216 Vo Van Ngan, Binh Tho, TP Thu Duc, TP Ho Chi Minh",
    city: "TP Ho Chi Minh",
    latitude: 10.8505,
    longitude: 106.756,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Bien Hoa",
    address: "1096 Pham Van Thuan, Tan Mai, Bien Hoa, Dong Nai",
    city: "Dong Nai",
    latitude: 10.951,
    longitude: 106.8235,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Di An",
    address: "79 DT743, Di An, Binh Duong",
    city: "Binh Duong",
    latitude: 10.9068,
    longitude: 106.7722,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Vung Tau",
    address: "147 Hoang Hoa Tham, Thang Tam, TP Vung Tau",
    city: "Ba Ria - Vung Tau",
    latitude: 10.3498,
    longitude: 107.0843,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Can Tho",
    address: "209 Duong 30/4, Xuan Khanh, Ninh Kieu, Can Tho",
    city: "Can Tho",
    latitude: 10.0305,
    longitude: 105.7684,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Long Xuyen",
    address: "1244 Tran Hung Dao, My Binh, Long Xuyen, An Giang",
    city: "An Giang",
    latitude: 10.3865,
    longitude: 105.4353,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Rach Gia",
    address: "1A Ton Duc Thang, Vinh Bao, Rach Gia, Kien Giang",
    city: "Kien Giang",
    latitude: 10.0125,
    longitude: 105.0804,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Ca Mau",
    address: "9 Tran Hung Dao, Ward 5, TP Ca Mau",
    city: "Ca Mau",
    latitude: 9.1765,
    longitude: 105.151,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Soc Trang",
    address: "22 Tran Hung Dao, Ward 2, TP Soc Trang",
    city: "Soc Trang",
    latitude: 9.602,
    longitude: 105.9737,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Bac Lieu",
    address: "Trung tam TP Bac Lieu, Bac Lieu",
    city: "Bac Lieu",
    latitude: 9.2942,
    longitude: 105.7244,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Buon Ma Thuot",
    address: "78 Ly Thuong Kiet, Buon Ma Thuot, Dak Lak",
    city: "Dak Lak",
    latitude: 12.6793,
    longitude: 108.0446,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Nha Trang",
    address: "44 Le Thanh Ton, Loc Tho, TP Nha Trang",
    city: "Khanh Hoa",
    latitude: 12.2388,
    longitude: 109.1967,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Da Nang",
    address: "910A Ngo Quyen, Son Tra, Da Nang",
    city: "Da Nang",
    latitude: 16.0678,
    longitude: 108.2242,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Hue",
    address: "50A Hung Vuong, Phu Nhuan, TP Hue",
    city: "Hue",
    latitude: 16.4637,
    longitude: 107.5909,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Quy Nhon",
    address: "70 Le Loi, TP Quy Nhon, Binh Dinh",
    city: "Binh Dinh",
    latitude: 13.7815,
    longitude: 109.2199,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Thanh Hoa",
    address: "27 Tran Phu, Dien Bien, TP Thanh Hoa",
    city: "Thanh Hoa",
    latitude: 19.807,
    longitude: 105.7765,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Vinh",
    address: "Quang Trung, TP Vinh, Nghe An",
    city: "Nghe An",
    latitude: 18.6746,
    longitude: 105.6923,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Ha Tinh",
    address: "Ha Huy Tap, TP Ha Tinh",
    city: "Ha Tinh",
    latitude: 18.3429,
    longitude: 105.9057,
    openTime: "08:00",
    closeTime: "21:30",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Center Ba Trieu",
    address: "191 Ba Trieu, Hai Ba Trung, Ha Noi",
    city: "Ha Noi",
    latitude: 21.0123,
    longitude: 105.852,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Center Metropolis",
    address: "29 Lieu Giai, Ba Dinh, Ha Noi",
    city: "Ha Noi",
    latitude: 21.0319,
    longitude: 105.8134,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Mega Mall Royal City",
    address: "72A Nguyen Trai, Thanh Xuan, Ha Noi",
    city: "Ha Noi",
    latitude: 20.9989,
    longitude: 105.8146,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Mega Mall Times City",
    address: "458 Minh Khai, Hai Ba Trung, Ha Noi",
    city: "Ha Noi",
    latitude: 20.9966,
    longitude: 105.8682,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Mega Mall Smart City",
    address: "Dai lo Thang Long, Nam Tu Liem, Ha Noi",
    city: "Ha Noi",
    latitude: 21.0029,
    longitude: 105.7345,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 4
  },
  {
    name: "Vincom Plaza Long Bien",
    address: "7-9 Nguyen Van Linh, Long Bien, Ha Noi",
    city: "Ha Noi",
    latitude: 21.0453,
    longitude: 105.8884,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Bac Ninh",
    address: "Ly Thai To, Dai Phuc, TP Bac Ninh",
    city: "Bac Ninh",
    latitude: 21.1822,
    longitude: 106.0763,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Hai Phong Imperia",
    address: "Ha Noi Highway, Thuong Ly, Hong Bang, Hai Phong",
    city: "Hai Phong",
    latitude: 20.8652,
    longitude: 106.6804,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Ha Long",
    address: "Tran Quoc Nghien, Bach Dang, Ha Long, Quang Ninh",
    city: "Quang Ninh",
    latitude: 20.955,
    longitude: 107.042,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Viet Tri",
    address: "Hung Vuong Boulevard, TP Viet Tri, Phu Tho",
    city: "Phu Tho",
    latitude: 21.3294,
    longitude: 105.398,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  },
  {
    name: "Vincom Plaza Lang Son",
    address: "Hung Vuong, Hoang Van Thu, TP Lang Son",
    city: "Lang Son",
    latitude: 21.8482,
    longitude: 106.7573,
    openTime: "08:00",
    closeTime: "22:00",
    slotStep: 30,
    capacity: 3
  }
];
