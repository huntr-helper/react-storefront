import { AdyenDropIn } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/AdyenDropIn";
import { PaymentSectionSkeleton } from "@/checkout-storefront/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout-storefront/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout-storefront/state/updateStateStore";

export const PaymentMethods = () => {
  const { availablePaymentGateways, fetching } = usePayments();
  const {
    changingBillingCountry,
    updateState: { checkoutDeliveryMethodUpdate },
  } = useCheckoutUpdateState();

  const { adyen } = availablePaymentGateways;

  console.log(111, { changingBillingCountry, fetching, checkoutDeliveryMethodUpdate });
  if (changingBillingCountry || fetching || checkoutDeliveryMethodUpdate === "loading") {
    return <PaymentSectionSkeleton />;
  }

  return <div className="mb-3">{adyen ? <AdyenDropIn config={adyen} /> : null}</div>;
};
