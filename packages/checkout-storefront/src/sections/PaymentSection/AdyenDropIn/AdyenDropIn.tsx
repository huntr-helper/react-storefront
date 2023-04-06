import AdyenCheckout from "@adyen/adyen-web";
import { FC, useCallback, useEffect, useRef } from "react";

import { useLocale } from "@/checkout-storefront/hooks/useLocale";
import { createAdyenCheckoutConfig } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/utils";
import {
  AdyenDropinProps,
  useAdyenDropin,
} from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/useAdyenDropin";
import "@adyen/adyen-web/dist/adyen.css";
import { UrlChangeHandlerArgs, useUrlChange } from "@/checkout-storefront/hooks/useUrlChange";
import { getParsedLocaleData } from "@/checkout-storefront/lib/utils/locale";
import { Locale } from "@/checkout-storefront/lib/regions";

type AdyenCheckoutInstance = Awaited<ReturnType<typeof AdyenCheckout>>;

// fake function just to get the type because can't import it :(
const _hack = (adyenCheckout: AdyenCheckoutInstance) =>
  adyenCheckout.create("dropin").mount("#dropin-container");
type DropinElement = ReturnType<typeof _hack>;

export const AdyenDropIn: FC<AdyenDropinProps> = ({ config }) => {
  const { locale } = useLocale();
  const { onSubmit, onAdditionalDetails } = useAdyenDropin({ config });
  const dropinContainerElRef = useRef<HTMLDivElement>(null);
  const dropinComponentRef = useRef<DropinElement | null>(null);
  const previousCountryCode = useRef(getParsedLocaleData(locale).countryCode);

  const createAdyenCheckoutInstance = useCallback(
    async (locale: Locale, container: HTMLDivElement) => {
      const adyenCheckout = await AdyenCheckout(
        createAdyenCheckoutConfig({ ...config.data, locale, onSubmit, onAdditionalDetails })
      );

      const dropin = adyenCheckout.create("dropin").mount(container);

      dropinComponentRef.current = dropin;
    },
    [config.data, onAdditionalDetails, onSubmit]
  );

  const handleUrlChange = useCallback(
    ({ queryParams: { locale } }: UrlChangeHandlerArgs) => {
      const newCountryCode = getParsedLocaleData(locale).countryCode;

      const hasCountryChanged = newCountryCode !== previousCountryCode.current;

      if (hasCountryChanged && dropinContainerElRef.current) {
        previousCountryCode.current = newCountryCode;

        // dropinComponentRef.current?.unmount();

        void createAdyenCheckoutInstance(locale, dropinContainerElRef.current);
      }
    },
    [createAdyenCheckoutInstance]
  );

  useEffect(() => {
    if (dropinComponentRef.current || !dropinContainerElRef.current) {
      return;
    }

    void createAdyenCheckoutInstance(locale, dropinContainerElRef.current);

    // return () => {
    //   dropinComponentRef.current?.unmount();
    // };
  }, [createAdyenCheckoutInstance, locale]);

  useUrlChange(handleUrlChange);

  return <div ref={dropinContainerElRef} />;
};
