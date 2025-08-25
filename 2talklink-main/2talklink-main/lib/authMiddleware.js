import dbConnect from "./dbConnect";
import Common from "../helpers/Common";
import moment from "moment";
import Users from "../models/User";
export const authMiddleware = (handlerFn) => async (req, res) => {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).json({
      status: "error",
      message: "Authorization token must be provided.",
    });
  }

  try {
    await dbConnect();

    let token = req.headers.authorization;
    if (token.includes("Bearer ")) {
      token = token.replace("Bearer ", "");
    }

    const user = await Common.getUserByJwt(token);

    if (user) {
      if (user?.validityDate) {
        var planDate = moment(user?.validityDate);
        var freePlanDate = moment(user?.freeTrialValidityDate);
        var now = moment();
        // console.log({ paid: now > planDate, free: now > freePlanDate });

        if (now > planDate) {
          // await Users.findOneAndUpdate(
          //   { _id: user._id },
          //   // { totalPlanCardCount: 0, currentCardCount: 0 }
          // );
        }
      }
      if (user?.freeTrialValidityDate) {
        var freePlanDate = moment(user.freeTrialValidityDate);
        var now = moment();
        if (now > freePlanDate) {
          await Users.findOneAndUpdate(
            { _id: user._id },
            { isFreePlan: false }
          );
        }
      }
    }

    if (!user) {
      res.send({
        status: "error",
        message:
          "We couldn't identify you as a valid user. (invalid jwt token)",
      });
    } else {
      if (!user.status) {
        res.send({
          status: "error",
          message: `Access Denied! (Reason: Account is deactivated.})`,
        });
        return;
      }

      if (req.url.includes("/admin/")) {
        req._IS_ADMIN_ACCOUNT = true;
      } else {
        req._IS_ADMIN_ACCOUNT = false;
      }

      user.main_user = {
        id: user._id,
      };
      req.vsuser = user;

      return handlerFn(req, res);
    }
  } catch (err) {
    res.send({
      status: "error",
      message: "We couldn't identify you as a valid user.",
    });
  }
};
