import { Payment } from "zmp-sdk";
import appConfig from "../../app-config.json";
import { getConfig } from "../components/config-provider";

const pay = (amount: number, description?: string) =>
  new Promise((resolve, reject) => {
    Payment.createOrder({
      desc: description ?? `Thanh toán cho ${appConfig.app.title}`,
      item: [],
      amount:
        amount + Number(getConfig((config) => config.template.shippingFee)),
      success: async (data) => {
        console.log("Thanh toán thành công:", data);

        // try {
        //   const response = await fetch(
        //     "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //         Token: "93cb4daa-150f-11f0-95d0-0a92b8726859",
        //         ShopId: "196359",
        //       },
        //       body: JSON.stringify({
        //         "payment_type_id": 2,
        //         "note": "Tintest 123",
        //         "required_note": "KHONGCHOXEMHANG",
        //         "from_name": "TinTest124",
        //         "from_phone": "0987654321",
        //         "from_address": "72 Thành Thái, Phường 14, Quận 10, Hồ Chí Minh, Vietnam",
        //         "from_ward_name": "Phường 14",
        //         "from_district_name": "Quận 10",
        //         "from_province_name": "HCM",
        //         "return_phone": "0332190444",
        //         "return_address": "39 NTT",
        //         "return_district_id": null,
        //         "return_ward_code": "",
        //         "client_order_code": "",
        //         "to_name": "TinTest124",
        //         "to_phone": "0987654321",
        //         "to_address": "72 Thành Thái, Phường 14, Quận 10, Hồ Chí Minh, Vietnam",
        //         "to_ward_code": "20308",
        //         "to_district_id": 1444,
        //         "cod_amount": 200000,
        //         "content": "Theo New York Times",
        //         "weight": 200,
        //         "length": 1,
        //         "width": 19,
        //         "height": 10,
        //         "pick_station_id": 1444,
        //         "deliver_station_id": null,
        //         "insurance_value": 1000,
        //         "service_id": 0,
        //         "service_type_id": 2,
        //         "coupon": null,
        //         "pick_shift": [2],
        //         "items": [
        //           {
        //             "name": "Áo Polo",
        //             "code": "Polo123",
        //             "quantity": 1,
        //             "price": 200000,
        //             "length": 12,
        //             "width": 12,
        //             "height": 12,
        //             "weight": 1200,
        //             "category": {
        //               "level1": "Áo"
        //             }
        //           }
        //         ]
        //       }),
        //     }
        //   );

        //   const ghnData = await response.json();
        //   console.log("GHN response:", ghnData);

        //   if (ghnData.code === 200) {
        //     resolve({ payment: data, ghn: ghnData });
        //   } else {
        //     console.error("GHN error:", ghnData);
        //     reject(new Error("Tạo đơn GHN thất bại"));
        //   }
        // } catch (err) {
        //   console.error("Lỗi khi tạo đơn GHN:", err);
        //   reject(err);
        // }
      },
      fail: (err) => {
        console.log("Lỗi thanh toán:", err);
        reject(err);
      },
    });
  });

export default pay;
