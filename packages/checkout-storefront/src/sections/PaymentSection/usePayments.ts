import { useCheckout } from "@/checkout-storefront/hooks/useCheckout";
import { useCheckoutComplete } from "@/checkout-storefront/hooks/useCheckoutComplete";
import { usePaymentGatewaysInitialize } from "@/checkout-storefront/sections/PaymentSection/usePaymentGatewaysInitialize";
import { useEffect } from "react";

export const usePayments = () => {
  const {
    checkout: { chargeStatus, authorizeStatus },
  } = useCheckout();

  const { fetching, availablePaymentGateways } = usePaymentGatewaysInitialize();

  const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();

  useEffect(() => {
    // the checkout was already paid earlier, complete
    if (
      !completingCheckout &&
      (chargeStatus === "FULL" ||
        chargeStatus === "OVERCHARGED" ||
        (chargeStatus === "NONE" && authorizeStatus === "FULL"))
    ) {
      // TMP for development
      // void onCheckoutComplete();
    }
  }, []);

  return { fetching, availablePaymentGateways };
};
