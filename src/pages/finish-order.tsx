import React, { SyntheticEvent, useEffect, useState } from "react";
import AddressForm from "../constants/address-form";
import ButtonFixed from "../components/button-fixed/button-fixed";
import { AddressFormType } from "../models";
import { convertPrice, cx } from "../utils";
import CardStore from "../components/custom-card/card-store";
import { Box, Button, Input, Page, Select, Text } from "zmp-ui";
import { selector, useRecoilValue, useSetRecoilState } from "recoil";
import {
  cartState,
  cartTotalPriceState,
  openProductPickerState,
  productInfoPickedState,
  productState,
  storeState,
} from "../state";
import CardProductOrder from "../components/custom-card/card-product-order";
import { changeStatusBarColor, pay } from "../services";
import useSetHeader from "../hooks/useSetHeader";
import { getConfig } from "../components/config-provider";

const { Option } = Select;

const locationVnState = selector({
  key: "locationVn",
  get: () => import("../dummy/location").then((module) => module.default),
});

const FinishOrder = () => {
  const cart = useRecoilValue(cartState);
  const totalPrice = useRecoilValue(cartTotalPriceState);
  const listProducts = useRecoilValue(productState);
  const storeInfo = useRecoilValue(storeState);

  const setOpenSheet = useSetRecoilState(openProductPickerState);
  const setProductInfoPicked = useSetRecoilState(productInfoPickedState);
  const setHeader = useSetHeader();

  const locationVN = useRecoilValue(locationVnState);

  const [currentCity, setCurrentCity] = useState(locationVN[0]);
  const [currentDistrict, setCurrentDistrict] = useState(
    locationVN[0].districts[0]
  );
  const [currentWard, setCurrentWard] = useState(
    locationVN[0].districts[0].wards[0]
  );

  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
    locationVN[0].districts[0].id
  );
  const [selectedWardId, setSelectedWardId] = useState<string | null>(
    locationVN[0].districts[0].wards[0].id
  );

  const [shippingFeeGHN, setShippingFeeGHN] = useState<number | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [shippingMethod, setShippingMethod] = useState<'GHN' | 'Pickup'>('GHN');

  const handlePayMoney = async (e: SyntheticEvent) => {
    e.preventDefault();

    // const productsToPay = cart.listOrder.map((item) => {
    //   const product = listProducts.find((p) => p.id === item.id);
    //   return {
    //     id: product?.id,
    //     name: product?.nameProduct,
    //     quantity: item.order.quantity,
    //     price: product?.salePrice,
    //   };
    // });

    // const payload = {
    //   totalPrice,
    //   products: productsToPay,
    //   shippingFee: shippingFeeGHN || 0,
    //   shippingMethod,
    //   address: {
    //     city: currentCity.name,
    //     district: currentDistrict.name,
    //     ward: currentWard.name,
    //   },
    // };

    await pay(totalPrice);
  };

  const handleChooseProduct = (productId: number) => {
    setOpenSheet(true);
    setProductInfoPicked({ productId, isUpdate: true });
  };

  const getShippingFee = async (toDistrictId: string, toWardCode: string) => {
    if (shippingMethod === 'Pickup') return;
    setIsCalculatingFee(true);
    try {
      const response = await fetch(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': '93cb4daa-150f-11f0-95d0-0a92b8726859',
            'ShopId': '196359',
          },
          body: JSON.stringify({
            from_district_id: 227,
            from_ward_code: "07927",
            service_id: 53321,
            service_type_id: null,
            to_district_id: toDistrictId,
            to_ward_code: toWardCode,
            height: 10,
            length: 20,
            weight: 500,
            width: 15,
            insurance_value: 50000,
            cod_failed_amount: 0,
            coupon: null,
            items: [
              {
                name: "Demo Product",
                quantity: 1,
                height: 10,
                weight: 500,
                length: 20,
                width: 15
              }
            ]
          }),
        }
      );

      const data = await response.json();
      if (data.code === 200) {
        setShippingFeeGHN(data.data.total);
      } else {
        setShippingFeeGHN(null);
      }
    } catch (error) {
      console.error('GHN Fee Error:', error);
      setShippingFeeGHN(null);
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const filterSelectionInput = (item: AddressFormType) => {
    let listOptions: any = locationVN;
    let value;
    let handleOnSelect: (id: string) => void;

    switch (item.name) {
      case "city":
        listOptions = locationVN;
        value = currentCity.id;
        handleOnSelect = (cityId) => {
          const indexCity = Number(cityId) - 1 > -1 ? Number(cityId) - 1 : 0;
          const firstDistrict = locationVN[indexCity].districts[0];
          const firstWard = firstDistrict.wards[0];
          setCurrentCity(locationVN[indexCity]);
          setCurrentDistrict(firstDistrict);
          setSelectedDistrictId(firstDistrict.id);
          setCurrentWard(firstWard);
          setSelectedWardId(firstWard.id);
          if (shippingMethod === 'GHN') {
            getShippingFee(firstDistrict.id, firstWard.id);
          }
        };
        break;
      case "district":
        listOptions = currentCity.districts;
        value = selectedDistrictId;
        handleOnSelect = (districtId) => {
          const district = currentCity.districts.find(
            (currentDistrict) => currentDistrict.id === districtId
          );
          if (district) {
            const firstWard = district.wards[0];
            setCurrentDistrict(district);
            setSelectedDistrictId(districtId);
            setCurrentWard(firstWard);
            setSelectedWardId(firstWard.id);
            if (shippingMethod === 'GHN') {
              getShippingFee(districtId, firstWard.id);
            }
          }
        };
        break;
      case "ward":
        listOptions = currentDistrict.wards;
        value = selectedWardId;
        handleOnSelect = (wardId) => {
          setSelectedWardId(wardId);
          if (selectedDistrictId && shippingMethod === 'GHN') {
            getShippingFee(selectedDistrictId, wardId);
          }
        };
        break;
      default:
        listOptions = locationVN;
        value = undefined;
        handleOnSelect = () => {};
        break;
    }
    return { listOptions, value, handleOnSelect };
  };

  useEffect(() => {
    setHeader({ title: "Đơn đặt hàng", type: "secondary" });
    changeStatusBarColor("secondary");

    if (shippingMethod === 'GHN') {
      getShippingFee(selectedDistrictId!, selectedWardId!);
    } else {
      setShippingFeeGHN(0);
    }
  }, [shippingMethod]);

  return (
    <Page>
      {cart && (
        <div className=" mb-[80px]">
          <Box m={0} p={4} className=" bg-white">
            <CardStore
              store={storeInfo}
              hasRightSide={false}
              hasBorderBottom={false}
              type="order"
            />
          </Box>
          <Box mx={3} mb={2}>
            {cart.listOrder.map((product) => {
              const productInfo = listProducts.find(
                (prod) => prod.id === product.id
              );
              return (
                <CardProductOrder
                  pathImg={productInfo!.imgProduct}
                  nameProduct={productInfo!.nameProduct}
                  salePrice={productInfo!.salePrice}
                  quantity={product!.order.quantity}
                  key={productInfo!.id}
                  id={product.id}
                  handleOnClick={(productId) => handleChooseProduct(productId)}
                />
              );
            })}
          </Box>
          <Box m={4} flex flexDirection="row" justifyContent="space-between">
            <span className=" text-base font-medium">Đơn hàng</span>
            <span className=" text-base font-medium text-primary">
              {convertPrice(totalPrice)}đ
            </span>
          </Box>

          <Box m={0} px={4} className=" bg-white">
            <Text size="large" bold className=" border-b py-3 mb-0">
              Phương thức giao hàng
            </Text>
            <div className="py-3 border-b">
              <Select
                value={shippingMethod}
                onChange={(value) => {
                  setShippingMethod(value as 'GHN' | 'Pickup');
                  if (value === 'Pickup') {
                    setShippingFeeGHN(0);
                  } else {
                    getShippingFee(selectedDistrictId!, selectedWardId!);
                  }
                }}
              >
                <Option value="GHN" title="GHN (Giao tận nơi)" />
                <Option value="Pickup" title="Tự đến lấy hàng" />
              </Select>
            </div>
          </Box>

          <Box m={0} px={4} className=" bg-white">
            <Text size="large" bold className=" border-b py-3 mb-0">
              Địa chỉ giao hàng
            </Text>

            {AddressForm.map((item: AddressFormType) => {
              const { listOptions, value, handleOnSelect } =
                filterSelectionInput(item);

              return (
                <div
                  key={item.name}
                  className={cx("py-3", item.name !== "ward" && "border-b")}
                >
                  <Text
                    size="large"
                    bold
                    className="after:content-['_*'] after:text-primary after:align-middle"
                  >
                    {item.label}
                  </Text>
                  <Box className="relative" m={0}>
                    {item.type === "select" ? (
                      <Select
                        id={item.name}
                        placeholder={item.placeholder}
                        name={item.name}
                        value={value}
                        onChange={(value) => {
                          handleOnSelect(value as string);
                        }}
                      >
                        {listOptions?.map((option) => (
                          <Option
                            key={option.id}
                            value={option.id}
                            title={option.name}
                          />
                        ))}
                      </Select>
                    ) : (
                      <Input placeholder="Nhập số nhà, tên đường" clearable />
                    )}
                  </Box>
                </div>
              );
            })}
          </Box>

          {(shippingFeeGHN !== null || isCalculatingFee) && (
            <Box m={4} flex flexDirection="row" justifyContent="space-between">
              <span className="text-base font-medium">Phí ship</span>
              <span className="text-base font-medium text-primary">
                {isCalculatingFee
                  ? "Đang tính..."
                  : `${convertPrice(shippingFeeGHN || 0)}đ`}
              </span>
            </Box>
          )}

          <ButtonFixed zIndex={99}>
            <Button
              htmlType="submit"
              fullWidth
              className=" bg-primary text-white rounded-lg h-12"
              onClick={handlePayMoney}
            >
              Đặt hàng
            </Button>
          </ButtonFixed>

          <Text className="p-4 text-center">
            {`Đặt hàng đồng nghĩa với việc bạn đồng ý quan tâm 
              ${storeInfo.nameStore} 
              để nhận tin tức mới`}
          </Text>
        </div>
      )}
    </Page>
  );
};

export default FinishOrder;
