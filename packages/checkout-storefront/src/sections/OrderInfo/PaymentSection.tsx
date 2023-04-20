import { Text } from "@saleor/ui-kit";

import { useFormattedMessages } from "@/checkout-storefront/hooks/useFormattedMessages";

import { Section } from "./Section";
import { CheckIcon, ExclamationIcon } from "@/checkout-storefront/icons";
import { getSvgSrc } from "@/checkout-storefront/lib/svgSrc";
import { orderInfoMessages } from "./messages";
import { imageAltMessages } from "@/checkout-storefront/lib/commonMessages";
import { useOrder } from "@/checkout-storefront/hooks/useOrder";

const ErrorMessage = ({ message }: { message: string }) => {
  const formatMessage = useFormattedMessages();

  return (
    <>
      <Text color="error" className="mr-1">
        {message}
      </Text>
      <img src={getSvgSrc(ExclamationIcon)} alt={formatMessage(imageAltMessages.exclamationIcon)} />
    </>
  );
};

const SuccessMessage = ({ message }: { message: string }) => {
  const formatMessage = useFormattedMessages();

  return (
    <>
      <Text color="success" className="mr-1">
        {message}
      </Text>
      <img src={getSvgSrc(CheckIcon)} alt={formatMessage(imageAltMessages.checkIcon)} />
    </>
  );
};

export const PaymentSection = () => {
  const formatMessage = useFormattedMessages();
  const {
    order: { chargeStatus, authorizeStatus },
  } = useOrder();

  return (
    <Section title={formatMessage(orderInfoMessages.paymentSection)}>
      <div data-testid="paymentStatus">
        <div className="flex flex-row items-center">
          {/* <PaymentDetails paymentData={paymentData} paymentStatusLoading={paymentStatusLoading} /> */}

          {chargeStatus === "NONE" && authorizeStatus === "FULL" && (
            <SuccessMessage message={formatMessage(orderInfoMessages.orderAuthorized)} />
          )}

          {chargeStatus === "FULL" && (
            <SuccessMessage message={formatMessage(orderInfoMessages.orderPaid)} />
          )}

          {chargeStatus === "OVERCHARGED" && (
            <ErrorMessage message={formatMessage(orderInfoMessages.orderOvercharged)} />
          )}
        </div>
      </div>
    </Section>
  );
};
