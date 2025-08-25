import { common } from "../../src/helper/Common";

export const expiredPlan = (callback) => {
  common.getAPI(
    {
      method: "POST",
      url: "user/getCurrentPlan",
      data: {},
    },
    (resp) => {
      if (resp.status === "success") {
        if (resp.data?.adminPlanStatus) {
          if (resp.data.isPlan && resp.data.isExpired) {
            callback(resp.data);
          }
        }
      }
    }
  );
};
export const getSingleUserBayedPlan = (callback) => {
  common.getAPI(
    {
      method: "POST",
      url: "user/getSingleUserBayedPlan",
      data: {},
    },
    (resp) => {
      if (resp.status === "success") {
        if (resp.data) {
          callback(resp.data);
        }
      }
    }
  );
};
export const expiredChecking = (date) => {
  const currentTime = new Date();
  return new Date(date) < currentTime;
};
