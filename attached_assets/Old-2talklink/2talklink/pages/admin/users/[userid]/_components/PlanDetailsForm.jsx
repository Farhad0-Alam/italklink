import React, { useEffect, useRef, useState } from "react";
import styles from "../_styles/PlanDetailsForm.module.css";
import Button from "./Button";
import { convertToLocalDateTime } from "../../../../../utils/convertToLocalDateTime ";

export default function PlanDetailsForm({ planDetails, onSubmit, setMessage }) {
  const [formData, setFormData] = useState(planDetails);
  const storedDate = useRef(null);
  useEffect(() => {
    setFormData(planDetails);
  }, [planDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const removeUndefinedFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => value !== undefined)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(removeUndefinedFields(formData));
    }
  };

  const validateForm = () => {
    if (!formData.planName || !formData.plan) {
      setMessage({
        type: "error",
        text: "Please fill in all  fields.",
      });
      return false;
    }
    // Mock validation for unique Plan ID
    if (formData.validityDate === "TAKEN") {
      setMessage({ type: "error", text: "This Plan ID is already taken." });
      return false;
    }
    return true;
  };

  const handleDateChange = (value, fieldName) => {
    const updatedDate = new Date(value).toISOString(); // Convert back to ISO string
    setFormData({ ...formData, [fieldName]: updatedDate });
  };

  useEffect(() => {

    if (formData.isFreePlan === false) {
      setFormData((prev) => ({
        ...prev,
        freeTrialValidityDate: undefined,
        validityDate: storedDate.current || formData.validityDate,
      }));
      storedDate.current = formData.freeTrialValidityDate;
    } else if (formData.isFreePlan === true) {
      setFormData((prev) => ({
        ...prev,
        validityDate: undefined,
        freeTrialValidityDate:
          storedDate.current || formData.freeTrialValidityDate,
      }));
      storedDate.current = formData.validityDate;
      return () => {
        storedDate.current = null;
      };
    }
  }, [formData.isFreePlan]);
  // console.log(formData);

  return (
    <form onSubmit={handleSubmit} className={styles.planDetailsForm}>
      <h2>Plan Details</h2>
      <div className={styles.formGroup}>
        <label htmlFor="planName">Plan Name:</label>
        <input
          type="text"
          id="planName"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="planValidity">Plan Validity:</label>
        <input
          type="datetime-local"
          id="planValidity"
          name="validityDate"
          value={convertToLocalDateTime(formData.validityDate)}
          onChange={(e) => handleDateChange(e.target.value, "validityDate")}
          disabled={formData?.isFreePlan}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="planIdNumber">Plan ID Number:</label>
        <input
          type="text"
          id="planIdNumber"
          name="plan"
          defaultValue={formData.plan}
          disabled
          // onChange={handleChange}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="totalLinksAllowed">Total Links Allowed:</label>
        <input
          type="number"
          id="totalLinksAllowed"
          name="totalPlanCardCount"
          value={formData.totalPlanCardCount}
          onChange={handleChange}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="linksCreated">Links Created:</label>
        <input
          type="number"
          id="linksCreated"
          // name="currentCardCount"
          defaultValue={formData.currentCardCount}
          // onChange={handleChange}
          disabled
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="isFreePlan">
          <input
            type="checkbox"
            id="isFreePlan"
            name="isFreePlan"
            checked={formData.isFreePlan}
            onChange={handleChange}
          />
          Is it a free plan?
        </label>
      </div>
      {formData.isFreePlan && (
        <div className={styles.formGroup}>
          <label htmlFor="freePlanValidity">Free Plan Validity:</label>
          <input
            type="datetime-local"
            id="freePlanValidity"
            name="freeTrialValidityDate"
            value={convertToLocalDateTime(formData.freeTrialValidityDate)}
            onChange={(e) =>
              handleDateChange(e.target.value, "freeTrialValidityDate")
            }
          />
        </div>
      )}
      <Button type="submit">Update Plan</Button>
    </form>
  );
}
