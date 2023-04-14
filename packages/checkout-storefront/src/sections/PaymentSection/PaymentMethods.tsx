import { AdyenDropIn } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/AdyenDropIn";
import { PaymentSectionSkeleton } from "@/checkout-storefront/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout-storefront/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout-storefront/state/updateStateStore";

export const PaymentMethods = () => {
  const { availablePaymentGateways } = usePayments();
  const {
    updateState: { paymentGatewaysInitialize },
    changingBillingCountry,
  } = useCheckoutUpdateState();

  const { adyen } = availablePaymentGateways;

  if (changingBillingCountry || paymentGatewaysInitialize === "loading") {
    return <PaymentSectionSkeleton />;
  }

  return <div className="mb-3">{adyen ? <AdyenDropIn config={adyen} /> : null}</div>;
};
