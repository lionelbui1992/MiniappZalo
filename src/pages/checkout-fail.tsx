import React, { SyntheticEvent, useEffect, useState } from "react";
import { Box, Button, Input, Page, Select, Text, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";

const CheckoutFail = () => {
    const navigate = useNavigate();

  return (
    <Page className="flex flex-col items-center justify-center text-center px-6 py-12">
      <Box className="mb-6">
        <Icon icon="zi-check-circle" size={80} className="text-green-500" />
      </Box>

      <Text.Title className="text-xl font-semibold mb-2">
        Đã sảy ra sự cố khi mua hàng!
      </Text.Title>
      <Text className="text-gray-600 mb-6">
       Mong quý khách thông cảm và thử lại
      </Text>

      <Button
        fullWidth
        size="large"
        onClick={() => navigate("/")}
        className="mt-4"
      >
        Quay lại trang chủ
      </Button>
    </Page>
  );
};

export default CheckoutFail;
