import { useState, useEffect } from "react";
import styles from "../_styles/PlanForm.module.css";
import CardGrid from "./CardGrid";
import CustomFields from "./CustomFields";
import FeaturesList from "./FeaturesList";
import { useRouter } from "next/router";
import validator from "validator";
import { AlertMsg, Loading } from "../../../../src/helper/helper";
import { common } from "../../../../src/helper/Common";

export default function PlanForm({ existingPlan, isEdit }) {
  const [formData, setFormData] = useState({
    planname: "",
    selectedModels: [],
    validity: "",
    currency: { code: "", symbol: "" },
    price: "",
    numberOfEcard: "",
    testDays: "",
    storageLimit: "200",
    customSelection: false,
    customFields: [],
    features: [],
  });

  const router = useRouter();

  useEffect(() => {
    if (isEdit && existingPlan) {
      setFormData(existingPlan);
    }
  }, [existingPlan, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "currency") {
      // Map of currency symbols
      const currencyMap = {
        USD: "$",
        EUR: "€",
        GBP: "£",
      };

      setFormData((prev) => ({
        ...prev,
        currency: {
          code: value,
          symbol: currencyMap[value] || "",
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomFieldsChange = (customFields) => {
    setFormData((prev) => ({ ...prev, customFields }));
  };

  const handleModelSelection = (selectedModels) => {
    setFormData((prev) => ({ ...prev, selectedModels }));
  };

  const handleFeaturesChange = (features) => {
    setFormData((prev) => ({ ...prev, features }));
  };

  const addPlanFormSubmit = () => {
    const emptyplan = validator.isEmpty(formData.planname, {
      ignore_whitespace: true,
    });
    
    if (emptyplan || !formData.price || !formData.validity) {
      // console.log(emptyplan, formData.price, formData.frequency);

      AlertMsg("error", "Oops!", "Field can not be empty!");
      return false;
    } else {
      const data = {
        planname: formData.planname,
        selectedModels: formData.selectedModels,
        validity: formData.validity,
        currency: formData.currency,
        price: formData.price,
        numberOfEcard: formData.numberOfEcard,
        testDays: formData.testDays,
        storageLimit: formData.storageLimit,
        customSelection: formData.customSelection,
        customFields: formData.customFields,
        features: formData.features,
      };
      if (isEdit === true) {
        data.id = existingPlan?._id;
      }

      Loading(true);
      common.getAPI(
        {
          method: "POST",
          url: "admin/addPlan",
          data: data,
        },
        (resp) => {
          if (resp.status === "success") {
            router.push("/admin/plans");
          }
        },
        () => {
          Loading(false);
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      addPlanFormSubmit();
    } else {
      addPlanFormSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEdit ? "Edit Plan" : "Add plan"}</h1>
        <button
          type="button"
          onClick={() => router.push(`/admin/plans`)}
          className={styles.backButton}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:*</label>
          <input
            type="text"
            id="name"
            name="planname"
            value={formData.planname}
            onChange={handleInputChange}
            placeholder="Enter the plan name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Various models:*</label>
          <CardGrid
            selectedModels={formData.selectedModels}
            onSelectionChange={handleModelSelection}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="validity">Frequency:*</label>
            <select
              id="validity"
              name="validity"
              value={formData.validity}
              onChange={handleInputChange}
            >
              <option hidden >Select</option>
              <option value="30">Month</option>
              <option value="365">Year</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="currency">Cost:*</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency.code}
              onChange={handleInputChange}
            >
              <option value="">Choose currency</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price:*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numberOfEcard">Card Number:*</label>
            <input
              type="number"
              id="numberOfEcard"
              name="numberOfEcard"
              value={formData.numberOfEcard}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="testDays">Test days:</label>
          <input
            type="number"
            id="testDays"
            name="testDays"
            value={formData.testDays}
            onChange={handleInputChange}
            placeholder="Enter test days"
          />
        </div>

        {/* <div className={styles.formGroup}>
          <label htmlFor="storageLimit">
            Storage limit:*
            <span className={styles.infoIcon} title="Maximum storage limit">
              ⓘ
            </span>
          </label>
          <input
            type="number"
            id="storageLimit"
            name="storageLimit"
            value={formData.storageLimit}
            onChange={handleInputChange}
            required
          />
        </div> */}

        <div className={styles.customSelectionToggle}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={formData.customSelection}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customSelection: e.target.checked,
                }))
              }
            />
            <span className={styles.slider}></span>
          </label>
          <span>Custom selection</span>
        </div>

        {formData.customSelection && (
          <CustomFields
            fields={formData.customFields}
            onChange={handleCustomFieldsChange}
          />
        )}

        <div className={styles.formGroup}>
          <label>Features:*</label>
          <FeaturesList
            selected={formData.features}
            onFeatureChange={handleFeaturesChange}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {isEdit ? "Update Plan" : "Submit"}
          </button>
          <button type="button" className={styles.discardButton}>
            {isEdit ? "Discard Changes" : "Discard"}
          </button>
        </div>
      </form>
    </div>
  );
}
