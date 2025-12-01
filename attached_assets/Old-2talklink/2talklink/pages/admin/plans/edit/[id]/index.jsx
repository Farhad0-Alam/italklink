import { useState, useEffect } from "react";
import PlanForm from "../../_components/PlanForm";
import styles from "../../_styles/PageContainer.module.css";
import { common } from "../../../../../src/helper/Common";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";
export default function EditPlanPage() {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    query: { id },
  } = useRouter();

  const fetchPlans = async () => {
    setLoading(true);

    try {
      // Construct the URL from environment variable and the plan ID
      const url = `${process.env.API_URL}admin/getPlanById`;
      // console.log(url);

      // Get the access token from cookies
      const accessToken = Cookies.get("accessToken");
      // console.log(accessToken);

      if (!accessToken) {
        setLoading(false);
        setError("Access token is missing or expired");
      }

      // Send POST request to get the plan details
      const response = await axios.post(
        url,
        { planId: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Send token as Bearer token
          },
        }
      );

      // Return the response data
      setPlanData(response.data.data);
      setLoading(false);
    } catch (error) {
      // Log and rethrow the error for further handling
      setLoading(false);
      setError(error.response?.data?.message || "Failed to fetch plan");
    }
  };

  useEffect(() => {
    if (id)
      (async () => {
        try {
          fetchPlans();
        } catch {
          //
        }
      })();
  }, [id, Cookies.get("accessToken")]);

  if (loading) return <div className={styles.loadingContainer}>Loading...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.container}>
      <PlanForm existingPlan={planData} isEdit={true} />
    </div>
  );
}
