import {
  Users,
  Campaigns,
  Templates,
  TemplatePage,
  CampaignPage,
  TemplateSection,
  CampaignSection,
  CampaignVisit,
  CampaignLink,
  CampaignVisitDetail,
  CampaignPageVisit,
  CampaignPageVisitDetail,
  CampaignLinkDetail,
  OrderList,
  Plans,
  AdminSettings,
  Coupons,
} from "../../../models/DB";
import mongoose from "mongoose";
import { authMiddleware } from "../../../lib/authMiddleware";
import Common from "../../../helpers/Common";
import { uuid } from "uuidv4";
import CommonAPI from "../../../helpers/CommonAPI";
import md5 from "md5";
import randomstring from "randomstring";
import { defaultCurrency } from "../../../src/helper/currencies";
import Stripe from "stripe";
import BillingModel from "../../../models/OrderList";
import { expiredChecking } from "../../../utils/queries";
import { formatDurationUsingIntl } from "../../../utils/formatDurationUsingIntl";
const stripe = new Stripe(process?.env?.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  timeout: "10000",
  appInfo: { name: "2TalkLink", version: "1.0" },
});
const sendPlanEmail = async (user, templatePath, emailType, planDetails) => {
  const fs = require("fs");

  fs.readFile(templatePath, "utf8", async (err, htmlToSend) => {
    if (err) {
      console.error(err);
      return {
        status: "error",
        message: `User action succeeded, but error in sending ${emailType} email.`,
        data: err,
      };
    }

    const object = {
      "{member_name}": user.name,
      "{plan_name}": planDetails.planname,
      "{plan_expiry_date}": formatDurationUsingIntl(planDetails.validity),
      "{member_email}": user.email,
      "{payment_amount}": planDetails.price,
      "{renew_link}": `${process.env.APP_URL}/profile`,
    };

    const replaces = Common.replaceItemByObj(htmlToSend, object);
    const params = {
      to: user.email,
      subject:
        emailType === "purchase"
          ? "Thank You for Purchasing a Plan!"
          : emailType === "freePlan"
          ? "Welcome to the Free Plan"
          : "Your Plan Has Been Renewed!",
      html: replaces,
    };

    const emailData = await AdminSettings.findOne();
    const settings = emailData.emailSettings;

    let mailResponse;
    if (settings.name === "Mandrill") {
      mailResponse = await CommonAPI.sendMailUsingMandrill(params, settings);
    } else if (settings.name === "SMTP") {
      mailResponse = await CommonAPI.sendMailUsingSMTP(params, settings);
    } else if (settings.name === "Sendgrid") {
      mailResponse = await CommonAPI.sendMailUsingSendgrid(params, settings);
    }

    if (
      !mailResponse ||
      !mailResponse.accepted ||
      mailResponse.accepted.length === 0
    ) {
      return {
        status: "error",
        message: "Email sending failed.",
        data: mailResponse ? mailResponse.rejected : "Unknown error",
      };
    }

    return {
      status: "success",
      message: `${
        emailType === "purchase"
          ? "Purchase"
          : emailType === "freePlan"
          ? "Free Plan"
          : "Renewal"
      } email sent successfully.`,
      data: { email: user.email },
    };
  });
};

const routeHandler = {};

const dbtblPrefix = process.env.dbtblPrefix;

routeHandler.updateProfile = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let validateFields = ["name"];
    let response = await Common.requestFieldsValidation(
      validateFields,
      postdata
    );
    if (response.status) {
      let where = {
        _id: user._id,
      };

      let set = {
        name: postdata.name,
      };

      if (typeof postdata.password != "undefined" && postdata.password != "") {
        set.password = md5(postdata.password);
      }

      await Users.updateOne(where, {
        $set: set,
      }).then(() => {
        if (set.password) {
          delete set.password;
        }
        res.json({
          status: "success",
          message: "We have updated profile successfully.",
          data: set,
        });
      });
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.updateUserPlan = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;

  try {
    const { ObjectId } = require("mongodb");
    let where = {
      _id: new ObjectId(postdata.id),
    };

    let set = {};
    let unset = {};

    // Check for the fields and update them
    if (postdata.validityDate) {
      set.validityDate = new Date(postdata.validityDate);
    } else {
      unset.validityDate = "";
    }

    if (postdata.planName) {
      set.planName = postdata.planName;
    } else {
      unset.planName = "";
    }

    if (postdata.plan) {
      set.plan = postdata.plan;
    } else {
      unset.plan = "";
    }

    if (postdata.freeTrialValidityDate) {
      set.freeTrialValidityDate = new Date(postdata.freeTrialValidityDate);
    } else {
      unset.freeTrialValidityDate = "";
    }

    if (typeof postdata.totalPlanCardCount !== "undefined") {
      set.totalPlanCardCount = parseInt(postdata.totalPlanCardCount, 10);
    } else {
      unset.totalPlanCardCount = "";
    }

    if (typeof postdata.currentCardCount !== "undefined") {
      set.currentCardCount = parseInt(postdata.currentCardCount, 10);
    } else {
      unset.currentCardCount = "";
    }

    if (typeof postdata.isFreePlan !== "undefined") {
      set.isFreePlan = postdata.isFreePlan;
    } else {
      unset.isFreePlan = "";
    }

    // If there are no fields to update or delete
    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
      return res.json({
        status: "error",
        message: "No valid fields to update.",
      });
    }

    // Use findOneAndUpdate with $set and $unset
    const updatedUser = await Users.findOneAndUpdate(
      where,
      {
        $set: set, // Update the provided fields
        $unset: unset, // Delete the missing fields
      },
      { new: true, returnDocument: "after" } // Return the updated document
    );

    if (!updatedUser) {
      return res.json({
        status: "error",
        message: "User not found or update failed.",
      });
    }

    // console.log(updatedUser);

    res.json({
      status: "success",
      message: "User plan updated successfully.",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.getSingleUserBayedPlan = async (req, res) => {
  // Retrieve the authenticated user's ID
  const userId = req?.vsuser?._id;

  if (!userId) {
    // Handle case when user ID is not available
    return res.status(400).json({
      status: "error",
      message: "User ID not provided",
    });
  }

  try {
    // Find user by ID and populate the "plan" field
    const user = await Users.findOne({ _id: userId });
    const planId = user?.plan?.toString();
    if (!user && !planId) {
      // Handle case when user is not found
      return res.status(404).json({
        status: "error",
      });
    }

    const plan = await Plans.findOne({ _id: planId });

    res.json({
      status: "success",
      data: plan,
    });
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error fetching user:", err);

    // Send a generic server error response
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.planPurchase = async (req, res) => {
  try {
    let { id, customField = null } = req.body;
    let postdata = req.body;
    let plan_id = id;
    let plandata = await Plans.findOne({ _id: plan_id });
    let amount = plandata.price;
    let extraCardNo = null;

    if (customField) {
      amount += customField?.vcard_price;
      extraCardNo = customField?.vcard_number;
    }

    let plan = plandata.planname;

    let user = req.vsuser;
    let email = user.email;

    if (postdata.couponCode) {
      let total;
      let coupon = await Coupons.findOne({
        couponCode: postdata.couponCode,
        status: 1,
      });
      if (coupon && amount > coupon.minAmount) {
        if (coupon.duration == "Once per user") {
          let userdata = await BillingModel.findOne({
            customer_id: user._id,
            couponCode: postdata.couponCode,
          });
          if (userdata) {
            return res.json({
              message: "Invalid coupon",
              status: "error",
            });
          }
        }
        if (coupon.discountType == "By Percentage") {
          let discounted = (amount * coupon.discount) / 100;
          total = amount - discounted;
          amount = total;
        } else {
          let discountPrice = coupon.discount;
          total = amount - discountPrice;
          amount = total;
        }
        if (amount < 0) {
          amount = 0;
        }
      } else {
        return res.json({
          message: "Invalid coupon",
          status: "error",
        });
      }
    }

    let curr_data = await AdminSettings.findOne({});
    let currency = defaultCurrency.code;
    if (curr_data?.currency?.code) {
      currency = curr_data.currency.code;
    }
    const searchParams = new URLSearchParams();
    if (postdata?.couponCode) {
      searchParams.set("couponCode", postdata?.couponCode);
    }
    if (customField?.vcard_number) {
      searchParams.set("vcard_number", customField?.vcard_number);
    }
    if (customField?.vcard_price) {
      searchParams.set("vcard_price", customField?.vcard_price);
    }
    const checkoutsession = await stripe.checkout.sessions.create({
      invoice_creation: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: currency,
            unit_amount: amount * 100,
            product_data: {
              name: plan,
              description: "2TalkLink",
            },
          },
          quantity: 1,
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      customer_email: email,
      mode: "payment",
      success_url: `${
        process.env.APP_URL
      }success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan_id}&${searchParams?.toString()}`,
      cancel_url: `${process.env.APP_URL}checkout?canceled=true`,
    });

    return res.json({
      status: "success",
      message: "stripe checkout",
      data: checkoutsession.url,
    });
  } catch (err) {
    console.error("Plan Purchase Error:", err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};
routeHandler.freePlanPurchase = async (req, res) => {
  try {
    let postdata = req.body;
    let plan_id = postdata.id;
    let plandata = await Plans.findOne({ _id: plan_id });
    if (plandata?.testDays !== 0) {
      let plan = plandata.planname;

      let user = req.vsuser;
      let email = user.email;

      let orderdetails = {
        invoice_id: `${uuid()}`,
        amount: 0,
        customer_id: user._id,
        validity: plandata.testDays,
        couponCode: postdata?.couponCode || "",
        title: "Free Plan",
        paymentStatus: "success",
        paymentMethod: "N/A",
        invoice_url: "N/A",
        currency: "N/A",
      };

      const ordersave = await OrderList.create(orderdetails);
      if (ordersave) {
        let userdata = await Users.findOne({ _id: user._id });
        let baseDate;
        const currentDate = new Date();
        if (userdata.validityDate && userdata.validityDate !== "") {
          const validityDate = new Date(userdata.validityDate);

          // Check if validityDate is in the past
          baseDate = validityDate > currentDate ? validityDate : currentDate;
        } else {
          baseDate = currentDate;
        }

        // Add validity days to the baseDate
        const newValidityDate = addDays(baseDate, plandata.testDays);
        if (userdata) {
          if (
            userdata.freeTrialValidityDate &&
            userdata.freeTrialValidityDate !== ""
          ) {
            await sendPlanEmail(
              userdata,
              "./email_template/freePlan.txt",
              "freePlan",
              { ...plandata, upgrade_link: process.env.APP_URL + "profile" }
            );

            await Users.findOneAndUpdate(
              { _id: user._id },
              {
                freeTrialValidityDate: newValidityDate,
                planName: plan,
                plan: plandata?._id,
                isFreePlan: true,
                $inc: { totalPlanCardCount: plandata?.numberOfEcard || 0 },
              }
            );
          } else {
            await sendPlanEmail(
              userdata,
              "./email_template/freePlan.txt",
              "freePlan",
              plandata
            );
            await Users.findOneAndUpdate(
              { _id: user._id },
              {
                freeTrialValidityDate: newValidityDate,
                plan: plandata?._id,
                planName: plan,
                isFreePlan: true,
                $inc: { totalPlanCardCount: plandata?.numberOfEcard || 0 },
              }
            );
          }
        }
      }

      return res.json({
        status: "success",
        data: ordersave,
      });
    } else {
      return res.json({
        status: "error",
        message: "Free Plan not available",
      });
    }
  } catch (err) {
    console.error("Plan Purchase Error:", err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.renewPlan = async (req, res) => {
  try {
    const { planId, couponCode } = req.body;
    const user = req.vsuser;

    // Fetch plan details
    const planData = await Plans.findOne({ _id: planId });
    if (!planData) {
      return res.json({ status: "error", message: "Plan not found" });
    }

    let amount = planData.price;
    const planName = planData.planname;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupons.findOne({
        couponCode,
        status: 1,
      });

      if (coupon && amount > coupon.minAmount) {
        if (coupon.duration === "Once per user") {
          const usage = await BillingModel.findOne({
            customer_id: user._id,
            couponCode,
          });
          if (usage) {
            return res.json({
              status: "error",
              message: "Coupon already used",
            });
          }
        }

        if (coupon.discountType === "By Percentage") {
          const discount = (amount * coupon.discount) / 100;
          amount -= discount;
        } else {
          amount -= coupon.discount;
        }

        if (amount < 0) {
          amount = 0;
        }
      } else {
        return res.json({
          status: "error",
          message: "Invalid coupon",
        });
      }
    }

    // Fetch currency settings
    const currData = await AdminSettings.findOne({});
    const currency = currData?.currency?.code || defaultCurrency.code;
    const searchParams = new URLSearchParams();
    if (couponCode) {
      searchParams.set("couponCode", couponCode);
    }
    if (planId) {
      searchParams.set("plan_id", planId);
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      invoice_creation: { enabled: true },
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount * 100,
            product_data: {
              name: `Renewal - ${planName}`,
              description: "2TalkLink Plan Renewal",
            },
          },
          quantity: 1,
        },
      ],
      phone_number_collection: { enabled: true },
      customer_email: user.email,
      mode: "payment",
      success_url: `${
        process.env.APP_URL
      }renew-success?session_id={CHECKOUT_SESSION_ID}&${searchParams?.toString()}`,
      cancel_url: `${process.env.APP_URL}renew?canceled=true`,
    });

    return res.json({
      status: "success",
      message: "Stripe checkout created",
      data: checkoutSession.url,
    });
  } catch (err) {
    console.error("Renew Plan Error:", err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.stripeSuccess = async (req, res) => {
  try {
    let postdata = req.body;
    let sessionid = postdata.session_id;
    let userid = postdata.user_id;
    let plan_id = postdata.plan_id;
    let customField = postdata?.customField || {};

    let plandata = await Plans.findOne({ _id: plan_id });
    let validity = plandata.validity;
    let planName = plandata.planname;

    // Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionid, {
      expand: ["invoice"],
    });
    // console.log("session = ", session);

    let invoiceId = session?.invoice?.id;

    // If invoice is null, check payment intent
    if (!invoiceId && session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      invoiceId = paymentIntent.invoice?.id;
    }

    if (!invoiceId) {
      return res.json({
        status: "error",
        message: "Invoice not found for session.",
        code: 500,
      });
    }

    // Send invoice
    const invoice = await stripe.invoices.sendInvoice(invoiceId);

    const pi_id = invoice.payment_intent;
    const pi_status = await stripe.paymentIntents.retrieve(pi_id);

    let orderdetails = {
      invoice_id: invoice.id,
      amount: invoice.amount_paid / 100,
      customer_id: userid,
      validity: validity,
      customField,
      shiping_details:
        invoice.shipping_details !== null
          ? invoice.shipping_details.address
          : "",
      couponCode: postdata?.couponCode != "" ? postdata.couponCode : "",
      title: invoice.lines.data[0].description,
      paymentStatus: pi_status.status,
      paymentMethod: "Stripe",
      invoice_url: invoice.hosted_invoice_url,
      currency: invoice.currency,
    };

    let exists = await OrderList.findOne({ invoice_id: invoice.id });
    if (exists) {
      return res.json({
        status: "success",
        data: exists,
      });
    } else {
      var ordersave = await OrderList.create(orderdetails);

      if (ordersave) {
        let userdata = await Users.findOne({ _id: userid });
        const cardNos = customField?.vcard_number || 0;

        let baseDate;
        const currentDate = new Date();
        if (userdata.validityDate && userdata.validityDate !== "") {
          const validityDate = new Date(userdata.validityDate);

          // Check if validityDate is in the past
          baseDate = validityDate > currentDate ? validityDate : currentDate;
        } else {
          baseDate = currentDate;
        }

        // Add validity days to the baseDate
        const newValidityDate = addDays(baseDate, plandata.validity);

        let validityDate = addDays(new Date(), userdata.validityDate);

        if (userdata) {
          if (userdata.validityDate && userdata.validityDate !== "") {
            validityDate = userdata.validityDate;
            let newDate = addDays(new Date(validityDate), validity);
            await sendPlanEmail(
              userdata,
              "./email_template/PlanPurchase.txt",
              "purchase",
              plandata
            );

            await Users.findOneAndUpdate(
              { _id: userid },
              {
                validityDate: newDate,
                planName,
                plan: plandata?._id,
                isFreePlan: false,
                $inc: {
                  totalPlanCardCount:
                    plandata?.numberOfEcard + Number(cardNos) || 0,
                },
                $unset: { freeTrialValidityDate: "" },
              }
            );
          } else {
            await sendPlanEmail(
              userdata,
              "./email_template/PlanPurchase.txt",
              "purchase",
              plandata
            );
            await Users.findOneAndUpdate(
              { _id: userid },
              {
                validityDate: newValidityDate,
                planName,
                plan: plandata?._id,
                isFreePlan: false,
                $inc: {
                  totalPlanCardCount:
                    plandata?.numberOfEcard + Number(cardNos) || 0,
                },
                $unset: { freeTrialValidityDate: "" },
              }
            );
          }
        }
      }
      return res.json({
        status: "success",
        data: ordersave,
      });
    }
  } catch (err) {
    console.error("Stripe Success Error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: err.message });
  }
};

routeHandler.stripeSuccessRenew = async (req, res) => {
  try {
    const { session_id, user_id, plan_id, couponCode = "" } = req.body;

    // Fetch plan data
    const plandata = await Plans.findOne({ _id: plan_id });
    if (!plandata)
      return res.json({ status: "error", message: "Invalid plan ID" });

    const { validity, planname } = plandata;

    // Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["invoice"],
    });
    // console.log("session = ", session);

    let invoiceId = session?.invoice?.id;

    // If invoice is null, check payment intent
    if (!invoiceId && session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      invoiceId = paymentIntent?.invoice?.id;
    }

    if (!invoiceId) {
      return res.json({
        status: "error",
        message: "Invoice not found for session.",
        code: 500,
      });
    }

    // Retrieve invoice and payment status
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    const pi_status = await stripe.paymentIntents.retrieve(
      invoice.payment_intent
    );
    // Check if order already exists
    const existingOrder = await OrderList.findOne({ invoice_id: invoice.id });
    if (existingOrder)
      return res.json({ status: "success", data: existingOrder });

    // Prepare order details
    const orderdetails = {
      invoice_id: invoice.id,
      amount: invoice.amount_paid / 100,
      customer_id: user_id,
      validity,
      shipping_details: invoice.shipping_details?.address || "",
      couponCode: couponCode || "",
      title: invoice.lines.data[0]?.description || "",
      paymentStatus: pi_status.status,
      paymentMethod: "Stripe",
      invoice_url: invoice.hosted_invoice_url,
      currency: invoice.currency,
    };

    // Save order
    const ordersave = await OrderList.create(orderdetails);
    if (!ordersave)
      return res.json({ status: "error", message: "Failed to save order." });

    // Update user validity
    const user = await Users.findOne({ _id: user_id });
    if (user) {
      const baseDate =
        user.validityDate && new Date(user.validityDate) > new Date()
          ? new Date(user.validityDate)
          : new Date();
      const newValidityDate = addDays(baseDate, validity);
      await sendPlanEmail(
        user,
        "./email_template/PlanRenewal.txt",
        "renewal",
        plandata
      );

      await Users.findOneAndUpdate(
        { _id: user_id },
        {
          validityDate: newValidityDate,
          planName: planname,
          isFreePlan: false,
          plan: plandata._id,
          $unset: { freeTrialValidityDate: "" },
        }
      );
    }

    return res.json({ status: "success", data: ordersave });
  } catch (err) {
    console.error("Stripe Success Renew Error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error: err.message });
  }
};

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

routeHandler.getCurrentPlan = async (req, res) => {
  let user = req.vsuser;
  try {
    let planName = "";
    let lastPaymentData = {};
    if (user?.planName) {
      planName = user.planName;
    } else {
      let lastPayment = await OrderList.findOne({ customer_id: user._id }).sort(
        { _id: -1 }
      );
      if (lastPayment) {
        planName = lastPayment.title;
        lastPaymentData = lastPayment;
      }
    }
    let planFeature = await AdminSettings.findOne({});

    let isPlan = planName ? true : false;
    let isExpired = expiredChecking(user.validityDate);
    let isFreePlanExpired = expiredChecking(user?.freeTrialValidityDate);
    const planData = await Plans.findOne({ _id: user.plan });

    let data = {
      planName,
      isPlan,
      isExpired,
      isFreePlanExpired,
      isFreePlan: user.isFreePlan,
      validityDate: user.validityDate,
      freeTrialValidityDate: user.freeTrialValidityDate,
      adminPlanStatus: planFeature?.isEnabled,
      lastPaymentData,
      planData,
    };

    return res.json({
      status: "success",
      data: data,
    });
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.getBillingHistory = async (req, res) => {
  let user = req.vsuser;
  try {
    let postdata = req.body;
    let page = parseInt(postdata.page || 1);
    let limit = parseInt(postdata.listPerPage || config.listPerPage);
    let skip = (page - 1) * limit;
    let query = { customer_id: user._id };
    let orders = await OrderList.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .catch((error) => {
        res.json({
          error: error,
          message: "There was an error!",
          status: "error",
        });
      });
    let totalOrders = await OrderList.find(query).countDocuments();
    let pageCounts = Math.ceil(totalOrders / limit);

    res.json({
      status: "success",
      message: "",
      data: orders,
      expireDate: user?.validityDate,
      totalOrders: totalOrders,
      perPage: limit,
      currentPage: page,
      pageCounts: pageCounts,
    });
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.removeProfileImage = (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    if (user.profilePicture && user.profilePicture != "") {
      CommonAPI.deleteObjects([user.profilePicture.key]);

      res.json({
        status: "success",
        message: "We have removed profile image successfully.",
      });
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.createCampaign = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let validateFields = ["link_name", "template_id"];
    let response = await Common.requestFieldsValidation(
      validateFields,
      postdata
    );
    if (response.status) {
      let pURL = postdata.link_name.trim();
      let pURLSlug = pURL.toLowerCase();
      pURLSlug = pURLSlug.replace(/[^A-Z0-9]+/gi, "-");
      let campaignExists = await Campaigns.findOne({ slug: pURLSlug });
      const userData = await Users.findById(user?._id);
      async function creatingLink() {
        await Users.findOneAndUpdate(
          { _id: userData?._id },
          { $inc: { currentCardCount: 1 } }
        );
        if (campaignExists && typeof campaignExists._id != "undefined") {
          res.json({
            status: "error",
            message:
              "Campaign is already exist with this URL. Please use another URL.",
          });
        } else {
          if (
            typeof postdata.template_id != "undefined" &&
            postdata.template_id != ""
          ) {
            let preTemplate = await Templates.findOne({
              _id: postdata.template_id,
            });
            if (preTemplate && typeof preTemplate._id != "undefined") {
              let newCampaign = {
                userId: user._id,
                title: pURL,
                slug: pURLSlug,
                catId: preTemplate.catId,
                profile: preTemplate.profile,
                usedTemplateId: preTemplate._id,
                packId: preTemplate.packId,
                themeId: preTemplate.themeId,
                html_theme_id: preTemplate.html_theme_id,
              };

              let userImage = "";
              if (typeof user.profilePicture !== "undefined") {
                userImage = user.profilePicture.key;
              }

              newCampaign.profile = {
                ...newCampaign.profile,
                name: user.name,
                image: userImage,
              };
              if (preTemplate.templateData) {
                newCampaign.templateData = preTemplate.templateData;
              }
              if (preTemplate.templateStyle) {
                newCampaign.templateStyle = preTemplate.templateStyle;
              }
              if (preTemplate.SocialIconData) {
                newCampaign.SocialIconData = preTemplate.SocialIconData;
              }
              await Campaigns.create(newCampaign).then(async (campaign) => {
                let templatePages = await TemplatePage.find({
                  templateId: preTemplate._id,
                  status: 1,
                });
                if (templatePages) {
                  templatePages.map(async (item, index) => {
                    let pageFields = {
                      userId: user._id,
                      templateId: campaign._id,
                      title: item.title,
                      slug: item.slug,
                      isDefault: item.isDefault,
                      sort: item.sort,
                    };
                    if (item.templateData) {
                      pageFields.templateData = item.templateData;
                    }

                    await CampaignPage.create(pageFields).then(
                      async (resultPage) => {
                        //console.log("success");
                        let Sections = await TemplateSection.find({
                          templateId: preTemplate._id,
                          pageId: item._id,
                          status: 1,
                        });
                        if (Sections) {
                          Sections.map(async (sitem, sindex) => {
                            let newSection = {
                              templateId: campaign._id,
                              pageId: resultPage._id,
                              userId: user._id,
                              title: sitem.title,
                              type: sitem.type,
                              isDefault: sitem.isDefault,
                              sort: sitem.sort,
                              sectionData: sitem.sectionData,
                            };

                            await CampaignSection.create(newSection).then(
                              (campSection) => {
                                // console.log("Success section");
                              }
                            );
                          });
                        }
                      }
                    );
                  });
                }

                res.json({
                  status: "success",
                  message: "We have created link successfully.",
                  data: { id: campaign._id },
                });
              });
            } else {
              res.json({
                status: "error",
                messgae: "We have not found the template.",
              });
            }
          } else {
            res.json({
              status: "error",
              message: "Something went wrong.",
            });
          }
        }
      }

      let isExpired = expiredChecking(user?.validityDate);
      let isFreePlanExpired = expiredChecking(user?.freeTrialValidityDate);

      if (!userData?.isFreePlan && isExpired && user.validityDate) {
        return res.json({
          status: "error",
          message:
            "Your plan has expired. Please upgrade your plan to continue.",
        });
      }

      if (
        (!userData?.isFreePlan || userData?.isFreePlan) &&
        isFreePlanExpired &&
        user?.freeTrialValidityDate
      ) {
        return res.json({
          status: "error",
          message:
            "Your free trial has expired. Please upgrade your plan to continue.",
        });
      }

      if (
        userData &&
        userData?.currentCardCount < userData?.totalPlanCardCount
      ) {
        if (
          userData?.isFreePlan &&
          !isFreePlanExpired &&
          user?.freeTrialValidityDate
        ) {
          await creatingLink();
          return;
        }

        if (!userData?.isFreePlan && !isExpired && user.validityDate) {
          return await creatingLink();
        }
      } else {
        return res.json({
          status: "error",
          message:
            "You have reached the maximum limit of your plan. Please upgrade your plan to continue.",
        });
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.getCampaigns = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let page = parseInt(postdata.page || 1);
    let limit = parseInt(postdata.listPerPage || config.listPerPage);
    let skip = (page - 1) * limit;
    let query = { userId: user._id };

    if (postdata.searchTerm != "") {
      postdata.searchTerm = postdata.searchTerm.trim();
      query = {
        userId: user._id,
        $text: { $search: postdata.searchTerm },
      };
    }

    let query2 = [
      { $match: query },
      {
        $lookup: {
          from: `${dbtblPrefix}campaignvisits`,
          localField: "_id",
          foreignField: "templateId",
          as: "campaignVisits",
        },
      },
      {
        $lookup: {
          from: `${dbtblPrefix}campaignlinks`,
          localField: "_id",
          foreignField: "templateId",
          as: "campaignClicks",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          status: 1,
          isCustomTheme: 1,
          userId: 1,
          title: 1,
          slug: 1,
          catId: 1,
          profile: 1,
          usedTemplateId: 1,
          packId: 1,
          themeId: 1,
          html_theme_id: 1,
          templateStyle: 1,
          SocialIconData: 1,
          createdAt: 1,
          updatedAt: 1,
          totalVisits: { $sum: "$campaignVisits.visitCount" },
          totalClicks: { $sum: "$campaignClicks.visitCount" },
        },
      },
    ];

    let campaigns = await Campaigns.aggregate(query2);
    /* let campaigns = await Campaigns.find(query)
			.limit(limit)
			.skip(skip)
			.sort({ createdAt: -1 })
			.catch((error) => {
				res.json({
					error: error,
					status: 'error',
					message: "There was an error!"
				});
			}); */

    let totalCampaigns = await Campaigns.find(query).countDocuments();
    let pageCounts = Math.ceil(totalCampaigns / limit);

    res.json({
      status: "success",
      message: "",
      data: campaigns,
      totalCampaigns: totalCampaigns,
      perPage: limit,
      currentPage: page,
      pageCounts: pageCounts,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.deleteCampaign = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let camId = postdata.id;
    let where = { _id: camId };

    let params = { userId: user._id, campaignId: camId };
    let delState = await Common.deleteCampaignDBData(params);
    await Users.findOneAndUpdate(
      { _id: user?._id, currentCardCount: { $gt: 0 } },
      { $inc: { currentCardCount: -1 } }
    );
    let shoulddelete = await CommonAPI.getAllkeysOfFolder(camId);
    if (shoulddelete && shoulddelete.status) {
      API.deleteObjects(shoulddelete.keys);
    }

    await Campaigns.deleteOne(where).then(() => {
      res.json({
        status: "success",
        message: "we have deleted link successfully.",
      });
    });
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.updateCampaignStatus = async (req, res) => {
  let postdata = req.body;
  try {
    let campaignId = postdata.id;
    let campaignStatus = postdata.campaignStatus;
    campaignStatus = parseInt(campaignStatus);

    let where = { _id: campaignId };
    await Campaigns.updateOne(where, {
      $set: { status: campaignStatus },
    }).then(() => {
      res.json({
        status: "success",
        message: "We have updated link status successfully.",
      });
    });
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.changeUsedTemplate = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let validateFields = ["id", "template_id"];
    let response = await Common.requestFieldsValidation(
      validateFields,
      postdata
    );
    if (response.status) {
      let campaignData = await Campaigns.findOne({ _id: postdata.id });
      if (campaignData && typeof campaignData._id != "undefined") {
        let preTemplate = await Templates.findOne({
          _id: postdata.template_id,
        });
        if (preTemplate && typeof preTemplate._id != "undefined") {
          let set = {
            packId: preTemplate.packId,
            usedTemplateId: preTemplate._id,
            templateStyle: preTemplate.templateStyle,
            html_theme_id: preTemplate.html_theme_id,
          };
          await Campaigns.updateOne(
            { _id: campaignData._id },
            {
              $set: set,
            }
          ).then(async () => {
            res.json({
              status: "success",
              message: "We have changed the template successfully.",
            });
          });
        } else {
          res.json({
            status: "error",
            messgae: "We have not found the template.",
          });
        }
      } else {
        res.json({
          status: "error",
          message: "The requested campaign is not exist.",
        });
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.getTemplates = async (req, res) => {
  let postdata = req.body;
  try {
    let page = parseInt(postdata.page || 1);
    let limit = parseInt(postdata.listPerPage || config.listPerPage);
    let skip = (page - 1) * limit;
    let query = { status: 1 };
    if (
      typeof postdata.searchTerm != "undefined" &&
      postdata.searchTerm != ""
    ) {
      postdata.searchTerm = postdata.searchTerm.trim();
      query = {
        status: 1,
        $text: { $search: postdata.searchTerm },
      };
    }
    if (
      typeof postdata.category_id != "undefined" &&
      postdata.category_id != ""
    ) {
      query.catId = postdata.category_id;
    }

    let templates = {};
    if (postdata.listPerPage == -1) {
      templates = await Templates.find(query)
        //.sort({ updatedAt: -1 })
        .catch((error) => {
          res.json({
            error: error,
            message: "There was an error!",
            status: "error",
          });
        });
    } else {
      templates = await Templates.find(query)
        .limit(limit)
        .skip(skip)
        //.sort({ updatedAt: -1 })
        .catch((error) => {
          res.json({
            error: error,
            message: "There was an error!",
            status: "error",
          });
        });
    }

    let totalTemplates = await Templates.find(query).countDocuments();
    let pageCounts = Math.ceil(totalTemplates / limit);

    res.json({
      status: "success",
      message: "",
      data: templates,
      totalTemplates: totalTemplates,
      perPage: limit,
      currentPage: page,
      pageCounts: pageCounts,
    });
  } catch (err) {
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.getDashboardAnalytics = async (req, res) => {
  let user = req.vsuser;
  try {
    let totalMonthlyVisitor = 0,
      totalWeeklyVisitor = 0,
      totalWeeklyClicks = 0;
    let today = new Date();

    let where = {
      userId: user._id,
    };
    let qurGroup = {
      $group: {
        _id: "$userId",
        totalVisitor: {
          $sum: "$visitCount",
        },
      },
    };
    let qurProject = {
      $project: {
        totalVisitor: 1,
      },
    };

    // Monthly Visitor
    let where2 = {
      createdAt: {
        $gte: new Date(new Date().setDate(today.getDate() - 30)),
        $lt: today,
      },
    };

    // Weekly Visitor
    let where3 = {
      createdAt: {
        $gte: new Date(new Date().setDate(today.getDate() - 7)),
        $lt: today,
      },
    };

    // Weekly Clicks
    let where4 = {
      createdAt: {
        $gte: new Date(new Date().setDate(today.getDate() - 7)),
        $lt: today,
      },
    };

    let query = [{ $match: where }, { $match: where2 }];
    query.push(qurGroup);
    query.push(qurProject);
    let monthlyVisitResult = await CampaignVisit.aggregate(query).exec();
    if (monthlyVisitResult && monthlyVisitResult.length) {
      totalMonthlyVisitor = monthlyVisitResult[0].totalVisitor;
    }

    let query2 = [{ $match: where }, { $match: where3 }];
    query2.push(qurGroup);
    query2.push(qurProject);
    let weeklyVisitResult = await CampaignVisit.aggregate(query2).exec();
    if (weeklyVisitResult && weeklyVisitResult.length) {
      totalWeeklyVisitor = weeklyVisitResult[0].totalVisitor;
    }

    let query3 = [{ $match: where }, { $match: where4 }];
    query3.push(qurGroup);
    query3.push(qurProject);
    let weeklyClickResult = await CampaignLink.aggregate(query3).exec();
    if (weeklyClickResult && weeklyClickResult.length) {
      totalWeeklyClicks = weeklyClickResult[0].totalVisitor;
    }

    let analyticsData = {
      totalMonthlyVisitor: totalMonthlyVisitor,
      totalWeeklyVisitor: totalWeeklyVisitor,
      totalWeeklyClicks: totalWeeklyClicks,
    };
    res.json({
      status: "success",
      message: "",
      data: analyticsData,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

routeHandler.moveCampaign = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;
  try {
    let validateFields = ["id", "user_id"];
    let response = await Common.requestFieldsValidation(
      validateFields,
      postdata
    );
    if (response.status) {
      let userData = await Users.findOne({ _id: postdata.user_id });
      if (userData && typeof userData._id != "undefined") {
        let campaignData = await Campaigns.findOne({
          _id: postdata.id,
          userId: user._id,
        });
        if (campaignData && typeof campaignData._id != "undefined") {
          let profile = campaignData.profile;
          if (campaignData.profile?.image) {
            let fileName = path.basename(campaignData.profile?.image);
            let subPath = `${postdata.user_id}`;
            subPath = subPath.concat(`/templates`);
            let imagetarget = `usercontent/${subPath}/${postdata.id}/${fileName}`;
            let newImage = await CommonAPI.copyObject(
              campaignData.profile?.image,
              imagetarget
            );
            if (newImage) {
              profile = {
                ...campaignData.profile,
                image: newImage.key,
              };
              await CommonAPI.deleteObjects([campaignData.profile.image]);
            }
          }
          let set = {
            userId: postdata.user_id,
            profile: profile,
          };
          await Campaigns.updateOne(
            { _id: postdata.id },
            {
              $set: set,
            }
          ).then(() => {
            //console.log("success");
          });
          await CampaignPage.updateMany(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("success");
          });
          await CampaignSection.updateMany(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("success");
          });
          await CampaignVisit.updateOne(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update visit");
          });
          await CampaignVisitDetail.updateMany(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update visitDetail");
          });
          await CampaignPageVisit.updateMany(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update visit page");
          });
          await CampaignPageVisitDetail.updateMany(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update visitDetail");
          });
          await CampaignLink.updateOne(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update link");
          });
          await CampaignLinkDetail.updateOne(
            { templateId: postdata.id },
            {
              $set: { userId: postdata.user_id },
            }
          ).then(() => {
            //console.log("Update linkDetail");
          });

          res.json({
            status: "success",
            message: "Campaign moved successfully.",
            data: imagetarget,
          });
        } else {
          res.json({
            status: "error",
            message: "Campaign is not exist.",
          });
        }
      } else {
        res.json({
          status: "error",
          message: "The requested user is not exist.",
        });
      }
    } else {
      res.json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

routeHandler.duplicateCampaign = async (req, res) => {
  let postdata = req.body;
  let user = req.vsuser;

  try {
    let validateFields = ["id"];
    let response = await Common.requestFieldsValidation(
      validateFields,
      postdata
    );

    if (!response.status) {
      return res.json({
        status: "error",
        message: "Required fields are missing.",
      });
    }

    const userData = await Users.findById(user?._id);

    if (!userData || userData.currentCardCount >= userData.totalPlanCardCount) {
      return res.json({
        status: "error",
        message:
          "You have reached the maximum limit of your plan. Please upgrade your plan to continue.",
      });
    }

    let campaignData = await Campaigns.findOne({
      _id: postdata.id,
      userId: user._id,
    });

    if (!campaignData || typeof campaignData._id === "undefined") {
      return res.json({
        status: "error",
        message: "The requested Campaign does not exist.",
      });
    }

    let rnString = randomstring.generate({
      length: 5,
      charset: "alphabetic",
      capitalization: "lowercase",
    });
    let name = `${campaignData.title} (Copy)`;
    let campSlug = `${campaignData.slug}-${rnString}`;

    campaignData._id = new mongoose.Types.ObjectId();
    campaignData.isNew = true;
    campaignData.createdAt = new Date().toISOString();
    campaignData.updateAt = new Date().toISOString();
    campaignData.title = name;
    campaignData.slug = campSlug;

    campaignData
      .save()
      .then(async (campaign) => {
        // Profile image copy
        if (
          campaign.profile?.image &&
          campaign.profile.image.indexOf("profileImage") !== -1
        ) {
          let profile = campaign.profile;
          let fileName = path.basename(profile.image);
          let subPath = `${user._id}/templates`;
          let imagetarget = `usercontent/${subPath}/${campaign._id}/${fileName}`;
          let newImage = await CommonAPI.copyObject(profile.image, imagetarget);
          if (newImage) {
            profile.image = newImage.key;
            await Campaigns.updateOne(
              { _id: campaign._id },
              { $set: { profile: profile } }
            );
          }
        }

        // Duplicate pages and sections
        let campaignPages = await CampaignPage.find({
          templateId: postdata.id,
        });

        if (campaignPages) {
          campaignPages.map(async (item) => {
            let prePageId = item._id;
            let npage = item;
            npage._id = new mongoose.Types.ObjectId();
            npage.isNew = true;
            npage.templateId = campaign._id;

            npage
              .save()
              .then(async (resultPage) => {
                let Sections = await CampaignSection.find({
                  templateId: postdata.id,
                  pageId: prePageId,
                });

                if (Sections) {
                  Sections.map(async (sitem) => {
                    let nSection = sitem;
                    nSection._id = new mongoose.Types.ObjectId();
                    nSection.isNew = true;
                    nSection.templateId = campaign._id;
                    nSection.pageId = resultPage._id;

                    nSection.save();
                  });
                }
              })
              .catch(() => {});
          });
        }

        await Users.findOneAndUpdate(
          { _id: userData?._id },
          { $inc: { currentCardCount: 1 } }
        );

        res.json({
          status: "success",
          message: "Duplicate link successfully.",
        });
      })
      .catch(() => {
        res.json({
          status: "error",
          message: "Something went wrong.",
        });
      });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
};

async function handler(req, res) {
  const { userSlug } = req.query;
  let routeFlag = true;

  if (req.method === "POST") {
    switch (userSlug) {
      case "updateProfile":
        await routeHandler.updateProfile(req, res);
        break;
      case "renewPlan":
        await routeHandler.renewPlan(req, res);
        break;
      case "freePlanPurchase":
        await routeHandler.freePlanPurchase(req, res);
        break;
      case "updateUserPlan":
        await routeHandler.updateUserPlan(req, res);
        break;
      case "stripeSuccess":
        await routeHandler.stripeSuccess(req, res);
        break;
      case "stripeSuccessRenew":
        await routeHandler.stripeSuccessRenew(req, res);
        break;
      case "getSingleUserBayedPlan":
        await routeHandler.getSingleUserBayedPlan(req, res);
        break;
      case "getBillingHistory":
        await routeHandler.getBillingHistory(req, res);
        break;
      case "planPurchase":
        await routeHandler.planPurchase(req, res);
        break;
      case "getCurrentPlan":
        await routeHandler.getCurrentPlan(req, res);
        break;
      case "removeProfileImage":
        await routeHandler.removeProfileImage(req, res);
        break;
      case "createCampaign":
        await routeHandler.createCampaign(req, res);
        break;
      case "getCampaigns":
        await routeHandler.getCampaigns(req, res);
        break;
      case "deleteCampaign":
        await routeHandler.deleteCampaign(req, res);
        break;
      case "updateCampaignStatus":
        await routeHandler.updateCampaignStatus(req, res);
        break;
      case "changeUsedTemplate":
        await routeHandler.changeUsedTemplate(req, res);
        break;
      case "getTemplates":
        await routeHandler.getTemplates(req, res);
        break;
      case "getDashboardAnalytics":
        await routeHandler.getDashboardAnalytics(req, res);
        break;
      case "moveCampaign":
        await routeHandler.moveCampaign(req, res);
        break;
      case "duplicateCampaign":
        await routeHandler.duplicateCampaign(req, res);
        break;
      default:
        routeFlag = false;
    }
  } else {
    routeFlag = false;
  }

  if (!routeFlag) {
    res.status(404).send("No route found.");
  }
}

export default authMiddleware(handler);
