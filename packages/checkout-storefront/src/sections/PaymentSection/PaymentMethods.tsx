// import { useFormattedMessages } from "@/checkout-storefront/hooks/useFormattedMessages";
// import { SelectBoxGroup } from "@/checkout-storefront/components/SelectBoxGroup";
// import { SelectBox } from "@/checkout-storefront/components/SelectBox";
// import { Text } from "@saleor/ui-kit";
// import { paymentSectionLabels, paymentMethodsMessages } from "./messages";
// import { usePaymentMethodsForm } from "@/checkout-storefront/sections/PaymentSection/usePaymentMethodsForm";
// import { FormProvider } from "@/checkout-storefront/providers/FormProvider";
import { AdyenDropIn } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/AdyenDropIn";
import { PaymentSectionSkeleton } from "@/checkout-storefront/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout-storefront/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout-storefront/state/updateStateStore";

export const PaymentMethods = () => {
  // const formatMessage = useFormattedMessages();
  // const { form, availablePaymentMethods, availablePaymentProviders } = usePaymentMethodsForm();
  const { /*availablePaymentMethods,*/ availablePaymentGateways } = usePayments();
  const {
    updateState: { paymentGatewaysInitialize },
    changingBillingCountry,
  } = useCheckoutUpdateState();

  const { adyen } = availablePaymentGateways;
  // console.log

  if (changingBillingCountry || paymentGatewaysInitialize === "loading") {
    return <PaymentSectionSkeleton />;
  }

  return adyen ? <AdyenDropIn config={adyen} /> : null;
  // return showAdyenDropin ? (
  //   <AdyenDropIn />
  // ) : (
  //   <FormProvider form={form}>
  //     <SelectBoxGroup
  //       label={formatMessage(paymentSectionLabels.paymentProviders)}
  //       className="flex flex-row gap-2 mb-8"
  //     >
  //       {availablePaymentMethods.map((paymentMethodId) => (
  //         <SelectBox
  //           key={paymentMethodId}
  //           className="shrink"
  //           name="selectedMethodId"
  //           value={paymentMethodId}
  //         >
  //           <Text>{formatMessage(paymentMethodsMessages[paymentMethodId])}</Text>
  //         </SelectBox>
  //       ))}
  //     </SelectBoxGroup>
  //   </FormProvider>
  // );
};
