import AdyenCheckout from "@adyen/adyen-web";
import { FC, useCallback, useEffect, useRef } from "react";

import { useLocale } from "@/checkout-storefront/hooks/useLocale";
import { createAdyenCheckoutConfig } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/utils";
import {
  AdyenDropinProps,
  useAdyenDropin,
} from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/useAdyenDropin";
import "@adyen/adyen-web/dist/adyen.css";
import { Locale } from "@/checkout-storefront/lib/regions";
import { ParsedAdyenGateway } from "@/checkout-storefront/sections/PaymentSection/types";
import { isEqual } from "lodash-es";

type AdyenCheckoutInstance = Awaited<ReturnType<typeof AdyenCheckout>>;

// fake function just to get the type because can't import it :(
const _hack = (adyenCheckout: AdyenCheckoutInstance) =>
  adyenCheckout.create("dropin").mount("#dropin-container");
type DropinElement = ReturnType<typeof _hack>;

export const AdyenDropIn: FC<AdyenDropinProps> = ({ config }) => {
  const { locale } = useLocale();
  const { onSubmit, onAdditionalDetails } = useAdyenDropin({ config });
  const prevConfig = useRef<ParsedAdyenGateway>(config);
  const prevLocale = useRef<Locale>(locale);
  const dropinContainerElRef = useRef<HTMLDivElement>(null);
  const dropinComponentRef = useRef<DropinElement | null>(null);

  const createAdyenCheckoutInstance = useCallback(
    async (locale: Locale, container: HTMLDivElement) => {
      // console.log(123, { lol: config.data });
      const adyenCheckout = await AdyenCheckout(
        createAdyenCheckoutConfig({ ...config.data, locale, onSubmit, onAdditionalDetails })
      );

      const dropin = adyenCheckout.create("dropin").mount(container);

      dropinComponentRef.current = dropin;
    },
    [config.data, onAdditionalDetails, onSubmit]
  );

  useEffect(() => {
    const hasConfigChanged = !isEqual(config, prevConfig.current);
    const hasLocaleChanged = locale !== prevLocale.current;

    // console.log(
    //   123,
    //   config,
    //   prevConfig.current,
    //   hasConfigChanged,
    //   hasLocaleChanged,
    //   dropinComponentRef.current,
    //   dropinContainerElRef.current
    // );
    if (!dropinContainerElRef.current || (!hasConfigChanged && !hasLocaleChanged)) {
      // console.log(123, "EXIT");
      return;
    }

    if (hasLocaleChanged) {
      prevLocale.current = locale;
    }

    if (hasConfigChanged) {
      prevConfig.current = config;
    }

    // console.log(123, "PROCEED");
    void createAdyenCheckoutInstance(locale, dropinContainerElRef.current);
  }, [config, createAdyenCheckoutInstance, locale]);

  useEffect(() => {
    if (dropinContainerElRef.current && !dropinComponentRef.current) {
      void createAdyenCheckoutInstance(locale, dropinContainerElRef.current);
    }
  }, []);

  return <div ref={dropinContainerElRef} />;
};
