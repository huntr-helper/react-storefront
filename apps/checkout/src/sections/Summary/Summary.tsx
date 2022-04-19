import React, { useState } from "react";
import { Text } from "@/components/Text";
import { useFormattedMessages } from "@/hooks/useFormattedMessages";
import { SummaryItem } from "./SummaryItem";
import { CheckoutLine } from "@/graphql";
import { Divider } from "@/components/Divider";
import { Money } from "@/components/Money";
import { ChevronDownIcon } from "@/icons";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { useCheckout } from "@/hooks/useCheckout";
import compact from "lodash/compact";

export const Summary = () => {
  const [isOpen, setOpen] = useState(true);
  const { checkout } = useCheckout();

  const formatMessage = useFormattedMessages();

  const totalPrice = checkout?.totalPrice?.gross;
  const taxCost = checkout?.totalPrice?.tax;

  const getTaxPercentage = (): number => {
    if (!totalPrice || !taxCost) {
      return 0;
    }

    return taxCost?.amount / totalPrice?.amount;
  };

  return (
    <div className="summary">
      <div className={clsx("summary-title", isOpen && "open")}>
        <div className="flex flex-row items-center">
          <Text size="lg" weight="bold">
            {formatMessage("summary")}
          </Text>

          <img
            src={ChevronDownIcon}
            alt="chevron-down"
            onClick={() => setOpen(!isOpen)}
          />
        </div>
        <Money weight="bold" money={totalPrice} />
      </div>
      <Transition
        show={isOpen}
        unmount={false}
        enter="transition duration-300 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <div className="w-full h-12" />
        <ul className="summary-items">
          {compact(checkout?.lines)?.map((line) => (
            <SummaryItem line={line as CheckoutLine} key={line?.id} />
          ))}
        </ul>
        <div className="summary-recap">
          <div className="summary-row">
            <Text weight="bold">{formatMessage("subtotal")}</Text>
            <Money weight="bold" money={checkout?.subtotalPrice?.gross} />
          </div>
          <Divider className="my-4" />
          <div className="summary-row mb-2">
            <Text color="secondary">{formatMessage("shippingCost")}</Text>
            <Money color="secondary" money={checkout?.shippingPrice?.gross} />
          </div>
          <div className="summary-row">
            <Text color="secondary">
              {formatMessage("taxCost", {
                taxPercentage: getTaxPercentage(),
              })}
            </Text>
            <Money color="secondary" money={taxCost} />
          </div>
          <Divider className="my-4" />
          <div className="summary-row">
            <Text size="md" weight="bold">
              {formatMessage("total")}
            </Text>
            <Money weight="bold" money={totalPrice} />
          </div>
        </div>
      </Transition>
    </div>
  );
};