import { Text } from "@saleor/ui-kit";

import { useFormattedMessages } from "@/checkout-storefront/hooks/useFormattedMessages";

import { Section } from "./Section";
import { CheckIcon, ExclamationIcon } from "@/checkout-storefront/icons";
import { getSvgSrc } from "@/checkout-storefront/lib/svgSrc";
import { orderInfoMessages } from "./messages";
import { imageAltMessages } from "@/checkout-storefront/lib/commonMessages";
import { useOrder } from "@/checkout-storefront/hooks/useOrder";

const ErrorIcon = () => {
  const formatMessage = useFormattedMessages();

  return (
    <img src={getSvgSrc(ExclamationIcon)} alt={formatMessage(imageAltMessages.exclamationIcon)} />
  );
};

const SuccessIcon = () => {
  const formatMessage = useFormattedMessages();

  return <img src={getSvgSrc(CheckIcon)} alt={formatMessage(imageAltMessages.checkIcon)} />;
};

export const PaymentSection = () => {
  const formatMessage = useFormattedMessages();
  const {
    order: { chargeStatus },
  } = useOrder();

  return (
    <Section title={formatMessage(orderInfoMessages.paymentSection)}>
      <div data-testid="paymentStatus">
        {/* <PaymentDetails paymentData={paymentData} paymentStatusLoading={paymentStatusLoading} /> */}

        {/* { && <Skeleton className="w-1/2" />} */}

        {chargeStatus === "FULL" && (
          <div className="flex flex-row items-center">
            <Text color="success" className="mr-1">
              {formatMessage(orderInfoMessages.orderPaid)}
            </Text>
            <SuccessIcon />
          </div>
        )}

        {chargeStatus === "OVERCHARGED" && (
          <div className="flex flex-row items-center">
            <Text color="error" className="mr-1">
              {formatMessage(orderInfoMessages.orderOvercharged)}
            </Text>
            <ErrorIcon />
          </div>
        )}
      </div>
    </Section>
  );
};

// if (paymentData?.status === "PENDING") {
//   return <Text color="success">{formatMessage(orderInfoMessages.paymentPending)}</Text>;
// }

// if (paymentData?.status === "UNPAID") {
//   return (
//     <div>
//       <Text color="error">{formatMessage(orderInfoMessages.orderUnpaid)}</Text>
//     </div>
//   );
// }}

// return <Text color="error">{formatMessage(orderInfoMessages.orderPaymentStatusMissing)}</Text>;
