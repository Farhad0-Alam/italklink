import { useState } from "react";
import styles from "./PricingCard.module.css";
import FeatureList from "./FeatureList";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import ExtraCard from "./ExtraCard";

import Cookies from "js-cookie";
import { formatDurationUsingIntl } from "../../../utils/formatDurationUsingIntl";

const PricingCard = ({
  plan,
  setTotalPrice: parentSetTotalPrice,
  classes,
  currentPlan,
  SelectedPlan,
  currentUserData,
  handleFreePlan,
  freePlanLoading,
  setCustomField,
}) => {
  const [extraCards, setExtraCards] = useState(0);
  const [totalPrice, setTotalPrice] = useState(plan?.price);
  const router = useRouter();

  const handleExtraCards = (customField) => {
    setCustomField(customField);
    if (customField) {
      setExtraCards(customField.vcard_number);
      setTotalPrice(Number(plan.price) + Number(customField.vcard_price));
      parentSetTotalPrice(Number(plan.price) + Number(customField.vcard_price));
    } else {
      setExtraCards(plan?.numberOfEcard);
      setTotalPrice(plan?.price);
      parentSetTotalPrice(plan?.price);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={classes.plan_name_wrap}>{plan.planname}</div>
      <motion.div
        className={styles.pricingInfo}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        <span className={styles.currency}>{plan?.currency?.symbol}</span>
        <span className={styles.price}>{parseInt(totalPrice)}</span>
        <span className={styles.period}>
          /{formatDurationUsingIntl(plan?.validity)}
        </span>
      </motion.div>
      <div className={styles.cardInfo}>
        <p>Number of eCard: {plan?.numberOfEcard + extraCards}</p>
        {currentUserData?.isFreePlan === null &&
          !currentUserData?.plan &&
          plan?.testDays !== 0 && (
            <p className={styles.freeTrial}>
              {formatDurationUsingIntl(formatDurationUsingIntl)} free trial
            </p>
          )}
        {!Cookies.get("accessToken") && plan?.testDays !== 0 && (
          <p className={styles.freeTrial}>{plan?.testDays} days free trial</p>
        )}
      </div>
      <FeatureList features={plan?.features} />
      <div className={styles.actions}>
        {plan?.customFields?.length > 0 && (
          <motion.div>
            <ExtraCard
              onSelect={handleExtraCards}
              customFields={plan?.customFields}
            />
          </motion.div>
        )}
        {currentUserData?.isFreePlan === null &&
        !currentUserData?.plan &&
        plan?.testDays !== 0 ? (
          <motion.button
            className={`${styles.freeTrialButton} pu_btn`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={freePlanLoading}
            onClick={() => handleFreePlan(plan?._id)}
          >
            {currentPlan?._id === plan?._id ? "Current Plan" : "Try It Free"}
          </motion.button>
        ) : null}
        {!Cookies.get("accessToken") && plan?.testDays !== 0 ? (
          <motion.button
            className={`${styles.freeTrialButton} pu_btn`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={freePlanLoading}
            onClick={() => handleFreePlan(plan?._id)}
          >
            {currentPlan?._id === plan?._id ? "Current Plan" : "Try It Free"}
          </motion.button>
        ) : null}
        <motion.button
          className={`${styles.subscribeButton} pu_btn`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            currentPlan?._id === plan?._id
              ? router.push("/profile")
              : SelectedPlan(
                  plan._id,
                  plan.planname,
                  totalPrice,
                  plan.validity,
                  plan?.numberOfEcard + extraCards
                )
          }
        >
          {currentPlan?._id === plan?._id ? "Go To Profile" : "Go Premium"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PricingCard;
