import {
  TransactionInitializeMutationVariables,
  TransactionProcessMutationVariables,
  useTransactionInitializeMutation,
  useTransactionProcessMutation,
} from "@/checkout-storefront/graphql";
import { useAlerts } from "@/checkout-storefront/hooks/useAlerts";
import { useCheckout } from "@/checkout-storefront/hooks/useCheckout";
import { useEvent } from "@/checkout-storefront/hooks/useEvent";
import { useSubmit } from "@/checkout-storefront/hooks/useSubmit";
import {
  AdyenCheckoutInstanceOnAdditionalDetails,
  AdyenCheckoutInstanceOnSubmit,
  AdyenCheckoutInstanceState,
  AdyenPaymentResponse,
} from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/types";
import {
  anyFormsValidating,
  areAllFormsValid,
  useCheckoutValidationActions,
  useCheckoutValidationState,
} from "@/checkout-storefront/state/checkoutValidationStateStore";
import DropinElement from "@adyen/adyen-web/dist/types/components/Dropin";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearQueryParams,
  getQueryParams,
  ParamBasicValue,
  replaceUrl,
} from "@/checkout-storefront/lib/utils/url";
import { ParsedAdyenGateway } from "@/checkout-storefront/sections/PaymentSection/types";
import { getCurrentHref } from "@/checkout-storefront/lib/utils/locale";
import {
  areAnyRequestsInProgress,
  hasFinishedApiChangesWithNoError,
  useCheckoutUpdateState,
} from "@/checkout-storefront/state/updateStateStore";
import { useCheckoutComplete } from "@/checkout-storefront/hooks/useCheckoutComplete";
import { useErrorMessages } from "@/checkout-storefront/hooks/useErrorMessages";
import { adyenErrorMessages } from "@/checkout-storefront/sections/PaymentSection/AdyenDropIn/errorMessages";
import { camelCase } from "lodash-es";
import { apiErrorMessages } from "@/checkout-storefront/hooks/useAlerts/messages";
import { MightNotExist } from "@/checkout-storefront/lib/globalTypes";

export interface AdyenDropinProps {
  config: ParsedAdyenGateway;
}

export const useAdyenDropin = (props: AdyenDropinProps) => {
  const { config } = props;
  const { id } = config;

  const {
    checkout: { id: checkoutId, totalPrice },
  } = useCheckout();
  const { errorMessages } = useErrorMessages(adyenErrorMessages);
  const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);
  const { validateAllForms } = useCheckoutValidationActions();
  const { validationState } = useCheckoutValidationState();
  const { updateState, loadingCheckout, ...rest } = useCheckoutUpdateState();
  const { showCustomErrors } = useAlerts();

  const [currentTransactionId, setCurrentTransactionId] = useState<ParamBasicValue>(
    getQueryParams().transaction
  );
  const [, transactionInitialize] = useTransactionInitializeMutation();
  const [, transactionProccess] = useTransactionProcessMutation();
  const { onCheckoutComplete } = useCheckoutComplete();
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const [adyenCheckoutSubmitParams, setAdyenCheckoutSubmitParams] = useState<{
    state: AdyenCheckoutInstanceState;
    component: DropinElement;
  } | null>(null);

  const anyRequestsInProgress = areAnyRequestsInProgress({ updateState, loadingCheckout, ...rest });

  const finishedApiChangesWithNoError = hasFinishedApiChangesWithNoError({
    updateState,
    loadingCheckout,
    ...rest,
  });

  const handlePaymentResult = useCallback(
    ({
      paymentResponse,
      transaction,
    }: {
      paymentResponse: AdyenPaymentResponse;
      transaction: MightNotExist<{ id: string }>;
    }) => {
      const { action, resultCode } = paymentResponse;

      if (transaction) {
        setCurrentTransactionId(transaction.id);
        replaceUrl({ query: { transaction: transaction.id } });
      }

      if (action) {
        adyenCheckoutSubmitParams?.component.handleAction(action);
      }

      switch (resultCode) {
        case "Authorised":
          adyenCheckoutSubmitParams?.component.setStatus("success");
          // void onCheckoutComplete();
          return;
        case "Error":
          adyenCheckoutSubmitParams?.component.setStatus("error");
          showCustomErrors([{ message: "There was an error processing your payment." }]);
          return;
        case "Refused":
          setCurrentTransactionId(undefined);

          adyenCheckoutSubmitParams?.component.setStatus("ready");

          const messageKey = camelCase(paymentResponse.refusalReason);

          showCustomErrors([{ message: errorMessages[messageKey as keyof typeof errorMessages] }]);

          return;
      }
    },
    [adyenCheckoutSubmitParams?.component, errorMessages, showCustomErrors]
  );

  const onTransactionInitialize = useSubmit<
    TransactionInitializeMutationVariables,
    typeof transactionInitialize
  >(
    useMemo(
      () => ({
        onSubmit: transactionInitialize,
        onError: () => {
          showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
          adyenCheckoutSubmitParams?.component.setStatus("ready");
        },
        extractCustomErrors: (result) => result?.data?.transactionInitialize?.data?.errors,
        onSuccess: async ({ data }) => {
          // setSubmitting(false);

          if (!data) {
            showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
            return;
          }

          const { transaction, data: adyenData } = data;

          if (!transaction || !adyenData) {
            //alert?
            return;
          }

          if (adyenData) {
            void handlePaymentResult({
              paymentResponse: adyenData.paymentResponse,
              transaction,
            });
          }
        },
      }),
      [
        adyenCheckoutSubmitParams?.component,
        commonErrorMessages.somethingWentWrong,
        handlePaymentResult,
        showCustomErrors,
        transactionInitialize,
      ]
    )
  );

  const onTransactionProccess = useSubmit<
    TransactionProcessMutationVariables,
    typeof transactionProccess
  >(
    useMemo(
      () => ({
        onSubmit: transactionProccess,
        onError: () => {
          showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
          adyenCheckoutSubmitParams?.component.setStatus("ready");
        },
        extractCustomErrors: (result) => result?.data?.transactionProcess?.data?.errors,
        onSuccess: ({ data }) => {
          // setSubmitting(false);

          if (!data?.data) {
            showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
            return;
          }

          const {
            transaction,
            data: { paymentDetailsResponse },
          } = data;

          handlePaymentResult({
            paymentResponse: paymentDetailsResponse,
            transaction,
          });
        },
      }),
      [
        adyenCheckoutSubmitParams?.component,
        commonErrorMessages.somethingWentWrong,
        handlePaymentResult,
        showCustomErrors,
        transactionProccess,
      ]
    )
  );

  const onSubmitInitialize: AdyenCheckoutInstanceOnSubmit = useEvent(async (state, component) => {
    component.setStatus("loading");
    console.log(`Calling validateAllForms()`);
    setAdyenCheckoutSubmitParams({ state, component });
    validateAllForms();
    setSubmitInProgress(true);
  });

  useEffect(() => {
    const validating = anyFormsValidating(validationState);
    const allFormsValid = areAllFormsValid(validationState);

    // no submit in progess or still validating forms or some requests in progress or no params
    // do nothing
    if (!submitInProgress || validating || anyRequestsInProgress || !adyenCheckoutSubmitParams) {
      console.log("NO SUBMIT IN PROGRESS OR VALIDATING OR REQUESTS IN PROGRESS OR NO PARAMS");
      return;
    }

    // there was en error either in some other request or form validation
    // stop the submission altogether
    if (!finishedApiChangesWithNoError || !allFormsValid) {
      console.log("API CHANGES ERROR OR FORMS INVALID");
      adyenCheckoutSubmitParams?.component.setStatus("ready");
      setSubmitInProgress(false);
      return;
    }

    // submit in progress only means that submit has been initialized
    // we want to disable it here so it's no run again
    setSubmitInProgress(false);
    adyenCheckoutSubmitParams.component.setStatus("loading");

    // there is a previous transaction going on, we want to process instead of initialize
    if (currentTransactionId) {
      console.log("SUBMITEN PROCESS");
      void onTransactionProccess({
        data: adyenCheckoutSubmitParams?.state.data,
        id: currentTransactionId,
      });
      return;
    }

    console.log("SUBMITEN INITIALIZE");
    void onTransactionInitialize({
      checkoutId,
      amount: totalPrice.gross.amount,
      paymentGateway: {
        id,
        data: {
          ...adyenCheckoutSubmitParams.state.data,
          returnUrl: getCurrentHref(),
        },
      },
    });
  }, [
    adyenCheckoutSubmitParams,
    anyRequestsInProgress,
    checkoutId,
    currentTransactionId,
    finishedApiChangesWithNoError,
    onTransactionInitialize,
    onTransactionProccess,
    submitInProgress,
    totalPrice.gross.amount,
    validationState,
    id,
  ]);

  const onAdditionalDetails: AdyenCheckoutInstanceOnAdditionalDetails = useEvent(
    async (state, component) => {
      setAdyenCheckoutSubmitParams({ state, component });
      if (currentTransactionId) {
        adyenCheckoutSubmitParams?.component?.setStatus("loading");
        setSubmitInProgress(true);
        // void onTransactionProccess({ data: state.data, id: currentTransactionId });
      }
    }
  );

  // handle when page is opened from previously redirected payment
  useEffect(() => {
    const { redirectResult, transaction } = getQueryParams();

    if (!redirectResult || !transaction) {
      return;
    }

    const decodedRedirectData = Buffer.from(redirectResult, "base64").toString();

    setCurrentTransactionId(transaction);

    console.log("YOOOOOOO");
    clearQueryParams("redirectResult", "resultCode");

    void onTransactionProccess({
      id: transaction,
      data: { details: decodedRedirectData },
    });
  }, []);

  return { onSubmit: onSubmitInitialize, onAdditionalDetails };
};
