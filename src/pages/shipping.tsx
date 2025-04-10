import axios from "axios";

// Define a function to fetch shipping fee from GHN API
const getShippingFee = async (cityId: string, districtId: string, wardId: string) => {
  try {
    const response = await axios.post("https://api.giaohangnhanh.com.vn/v2/shipping/fee", {
      shop_id: "your_shop_id", // replace with your shop ID
      from_district: "from_district_id", // usually your store's district ID
      to_district: districtId,
      to_ward: wardId,
      service_id: "your_service_id", // Shipping service ID
      weight: 1000, // The weight of the package in grams
    });
    
    return response.data.data.total_fee; // Shipping fee from the API response
  } catch (error) {
    console.error("Error fetching shipping fee:", error);
    return 0; // Default fee in case of an error
  }
};
