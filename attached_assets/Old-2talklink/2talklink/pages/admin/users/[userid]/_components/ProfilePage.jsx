import React, { useEffect, useState } from "react";
import styles from "../_styles/ProfilePage.module.css";
import ProfileSection from "./ProfileSection";
import PlanDetailsForm from "./PlanDetailsForm";
import { common } from "../../../../../src/helper/Common";
import { useRouter } from "next/router";
const initialUserDetails = {
  name: "John Doe",
  email: "john.doe@example.com",
  status: "Active",
  createdAt: "2023-01-01",
  updatedAt: "2023-06-15",
  avatarUrl: "/placeholder.svg?height=100&width=100",
};

const initialPlanDetails = {
  planName: "",
  validityDate: "",
  plan: "",
  totalPlanCardCount: "",
  currentCardCount: "",
  isFreePlan: "",
  freeTrialValidityDate: "",
};

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    status: "",
    profilePicture: {},
    createdAt: "",
    updatedAt: "",
  });

  const [planDetails, setPlanDetails] = useState(initialPlanDetails);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const { userid } = router.query || {};

  const fetchUsers = async (userid) => {
    common.getAPI(
      {
        method: "POST",
        url: "admin/getUser",
        data: { id: userid },
      },
      (resp) => {
        if (resp.status === "success") {
          setUserDetails(resp.data);
          const plan = resp.data;
          // console.log(plan);

          const planObj = {
            currentCardCount: plan.currentCardCount,
            freeTrialValidityDate: plan.freeTrialValidityDate,
            isFreePlan: plan.isFreePlan,
            plan: plan.plan,
            planName: plan.planName,
            totalPlanCardCount: plan.totalPlanCardCount,
            validityDate: plan.validityDate,
          };
          setPlanDetails(planObj);
        }
      }
    );
  };

  useEffect(() => {
    fetchUsers(userid);
  }, [userid]);

  const handlePlanUpdate = (updatedPlan) => {
    common.getAPI(
      {
        method: "POST",
        url: "user/updateUserPlan",
        data: { ...updatedPlan, id: userid },
      },
      (resp) => {
        if (resp.status === "success") {
          setPlanDetails(updatedPlan);
          setMessage({
            type: "success",
            text: "Plan details updated successfully!",
          });
        }
      },
      (err) => {
        // console.log(err);
      }
    );
  };

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.pageTitle}>User Profile</h1>
      <div className={styles.content}>
        <ProfileSection userDetails={userDetails} />
        <PlanDetailsForm
          planDetails={planDetails}
          onSubmit={handlePlanUpdate}
          setMessage={setMessage}
        />
      </div>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
