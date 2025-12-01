import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { common } from "../../helper/Common";
import svg from "../../helper/svg";
import styles from "../../../styles/pages/Plan.module.css";
import { Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setPageHeading } from "../../redux/actions/commonAction";
import Cookies from "js-cookie";
import Popup from "./popup/Popup";
import { AlertMsg } from "../../helper/helper";
import PricingCard from "../plan-card/PricingCard";

let tokenCookie = Cookies.get("accessToken")
  ? Cookies.get("accessToken")
  : false;

const Plan = () => {
  const router = useRouter();
  const headerContainer = useRef();
  const headerNav = useRef();
  const userData = useSelector((store) => store.userData);

  let dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageHeading({
        pageHeading: "2TalkLink - Plans",
        title:
          "2TalkLink - Run Your Own SaaS Platform for Building Bio URL , Mini Sites, Digital Cards",
      })
    );
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [planList, setPlanList] = useState([]);
  const [currency, setCurrency] = useState({});
  const [perPage, setPerPage] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const colorClasses = ["plan1", "plan2", "plan3"];
  const [addCouponPopup, setAddCouponPopup] = useState(false);

  const [planID, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planValidity, setPlanValidity] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [customField, setCustomField] = useState(null);
  const [numberOfEcard, setNumberOfEcard] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [expandInput, setExpandInput] = useState(false);
  useEffect(() => {
    fetchPlan();
    fetchCoupons();
    getCurrentPlan();
    getCurrentUser();
  }, []);

  const fetchPlan = async (page, listPerPage = perPage, nchange = false) => {
    common.getAPI(
      {
        method: "POST",
        url: "auth/getPlans",
        data: {
          page: page,
          listPerPage: listPerPage,
          searchTerm: searchTerm,
          status: 1,
        },
      },
      (resp) => {
        if (resp.status === "success") {
          if (resp.data.isEnabled == false) {
            router.push("/dashboard");
          }
          setPlanList(resp.data);
          setCurrency(resp.currency);
          setPerPage(listPerPage);
          setTotalPageCount(resp.pageCounts);
        }
      }
    );
  };

  /* search plan start */
  const handleSearchKeyupEvent = async (e) => {
    let t = e.target;
    let searchTerm = t.value;
    setSearchTerm(searchTerm);
    if (e.keyCode === 13) {
      fetchPlan(1);
    }
  };
  /* search plan end */
  const handlePageChange = (event, value) => {
    setPageNo(value);
    fetchPlan(value);
  };

  /* menu toggle outside click start */

  /* menu toggle outside click start */
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerNav.current && !headerNav.current.contains(event.target)) {
        headerContainer.current.classList.remove("ddd");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headerNav]);

  const addcouponFormSubmit = (e) => {
    e.preventDefault();
  };

  const fetchCoupons = async () => {
    // common.getAPI(
    //     {
    //         method: "POST",
    //         url: 'auth/getCoupons',
    //         data: { status : 1}
    //     },
    //     (resp) => {
    //         if (resp.status === 'success') {
    //             setCouponList(resp.data);
    //         }
    //     }
    // );
  };

  const applyCouponCode = () => {
    if (couponCode == "") {
      setTotalPrice(planPrice);
      setSavedAmount("");
    } else
      common.getAPI(
        {
          method: "POST",
          url: "auth/getCoupons",
          data: {
            status: 1,
            couponCode: couponCode,
            userId: userData.user_id,
          },
        },
        (resp) => {
          if (resp.status === "success") {
            if (resp.data[0] !== undefined) {
              let total;
              if (planPrice > resp.data[0].minAmount) {
                if (resp.data[0].discountType == "By Percentage") {
                  let discounted = (planPrice * resp.data[0].discount) / 100;
                  total = planPrice - discounted;
                  setSavedAmount(
                    `Coupon Applied Successfully! You saved ${currency.symbol} ${discounted}`
                  );
                  if (total < 0) {
                    setTotalPrice(0);
                  } else {
                    setTotalPrice(total);
                  }
                } else {
                  let discountPrice = resp.data[0].discount;
                  total = planPrice - discountPrice;
                  setSavedAmount(
                    `Coupon Applied Successfully! You saved ${currency.symbol} ${discountPrice}`
                  );
                  if (total < 0) {
                    setTotalPrice(0);
                  } else {
                    setTotalPrice(total);
                  }
                }
              } else {
                let type = "error";
                let title = "Opps!";
                let message = "Invalid coupon";
                AlertMsg(type, title, message);
              }
            }
          }
        }
      );
  };

  const handlePlanPurchase = () => {
    if (!tokenCookie) {
      router.push("/auth/registration");
    } else {
      let data = { id: planID, customField };
      if (couponCode !== "") {
        data.couponCode = couponCode;
      }

      common.getAPI(
        {
          method: "POST",
          url: "user/planPurchase",
          data: data,
        },
        (resp) => {
          if (resp.status === "success") {
            return (window.location.href = resp.data);
          }
          if (resp.status === "error") {
            AlertMsg(resp.message);
          }
        }
      );
    }
  };
  const handleFreePlan = (planId) => {
    setFreePlanLoading(true);
    if (!tokenCookie) {
      router.push("/auth/registration");
    } else {
      common.getAPI(
        {
          method: "POST",
          url: "user/freePlanPurchase",
          data: { id: planId },
        },
        (resp) => {
          if (resp.status === "success") {
            router.push(`/profile`);
            AlertMsg("success", "Success", "Free Plan activated successfully.");
            setFreePlanLoading(false);
          }
          if (resp.status === "error") {
            setFreePlanLoading(false);
            AlertMsg(resp.message);
          }
        },
        (err) => {
          setFreePlanLoading(false);
        }
      );
    }
  };

  const SelectedPlan = (id, name, price, validity, numberOfEcard) => {
    if (!tokenCookie) {
      router.push("/auth/registration");
    }
    setPlanId(id);
    setPlanName(name);
    setPlanPrice(price);
    setTotalPrice(price);
    setNumberOfEcard(numberOfEcard);
    setPlanValidity(validity);
    setAddCouponPopup(true);
  };

  const couponPopupCloseHandler = (e) => {
    setAddCouponPopup(false);
    //Reset popup form start
    setTimeout(() => {
      setPlanId("");
      setPlanName("");
      setPlanPrice("");
      setPlanValidity("");
      setExpandInput("");
      setSavedAmount("");
      setCouponCode("");
    }, 100);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setSavedAmount("");
    setTotalPrice(planPrice);
  };

  const [currentPlan, setCurrentPlan] = useState({});

  const getCurrentPlan = () => {
    common.getAPI(
      {
        method: "POST",
        url: "user/getCurrentPlan",
        data: {},
      },
      (resp) => {
        if (resp.status === "success") {
          if (resp.data?.adminPlanStatus) {
            setCurrentPlan(resp.data?.planData);
          }
        }
      },
      (err) => { },
      true
    );
  };
  const getCurrentUser = () => {
    common.getAPI(
      {
        method: "POST",
        url: "auth/getUserById",
        data: { userId: userData.user_id },
      },
      (resp) => {
        if (resp.status === "success") {
          setCurrentUserData(resp.data);
        }
      },
      (err) => {
        // console.log(err);
      },
      true
    );
  };
  const [currentUserData, setCurrentUserData] = useState(null);
  const [freePlanLoading, setFreePlanLoading] = useState(false);

  return (
    <>
      <Head>
        <title>Plans</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta
          name="description"
          content="Connect and manage all your social links in one place. Organize your social handles into a single tap. Get a link and work smart."
        />
        <meta
          name="keywords"
          content="pixaurl, pixaurl.com, pixa url, biolink, bio link, miniwebsite, mini website, social link, personal link, portfolio link, bio link generator"
        />
        <meta name="author" content="PixelNX Pvt. Ltd." />
        <meta name="MobileOptimized" content="320" />
      </Head>

      <div className="pu_container">
        <div className={styles.heading}>
          <h3>Ready to Start With 2TalkLink?</h3>
          <p>Choose the Perfect Plan for You and Your Business</p>
        </div>
        {/* <div className="pu_pagetitle_wrapper">
               <div className="pu_pagetitle_right">
                  <div className="pu_search_wrapper">
                     <input type="text" placeholder="Search" onKeyUp={handleSearchKeyupEvent} />
                     <span className="pu_search_icon">{svg.search_icon}</span>
                  </div>
               </div>
            </div> */}
        <div className={styles.plan_list_wrapper}>
          <div className={styles.template_list_inner}>
            {/* {planList.length ? (
              <>
                <div className={styles.plan_list}>
                  {planList.map((temp, index) => (
                    <div
                      key={temp._id}
                      className={`${styles.plan_item} ${
                        styles[colorClasses[index % colorClasses.length]]
                      }`}
                    >
                      <div className={styles.plan_name_wrap}>
                        {temp.planname}
                      </div>
                      <div
                        style={{ marginBottom: "14px", display: "block" }}
                        className={styles.plan_price_wrap}
                      >
                        {currency.symbol} {temp.price}
                      </div>
                      <div className={styles.plan_desc_wrap}>
                        <div
                          className="paragraph-container ql-editor ql-snow"
                          dangerouslySetInnerHTML={{
                            __html: temp.description,
                          }}
                        />
                      </div>
                      <div className={styles.plan_desc_wrap}>
                        <p>Valid upto {temp.validity} days.</p>
                        <button
                          className="pix-btn"
                          onClick={(e) =>
                            currentUserData?.plan
                              ? router.push("/profile")
                              : SelectedPlan(
                                  temp._id,
                                  temp.planname,
                                  temp.price,
                                  temp.validity
                                )
                          }
                        >
                          {currentPlan?._id === temp?._id
                            ? "Go To Profile"
                            : "Buy"}
                        </button>

                        {currentUserData?.isFreePlan === null &&
                        !currentUserData?.plan &&
                        temp?.testDays !== 0 ? (
                          <button
                            className="pix-btn"
                            disabled={freePlanLoading}
                            onClick={(e) => handleFreePlan(temp?._id)}
                          >
                            {currentPlan?._id === temp?._id
                              ? "Current Plan"
                              : "Free Plan"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null} */}
            {planList.length ? (
              <>
                <div className={styles.plan_list}>
                  {planList?.map((plan) => (
                    <PricingCard
                      currentUserData={currentUserData}
                      SelectedPlan={SelectedPlan}
                      currentPlan={currentPlan}
                      classes={styles}
                      plan={plan}
                      setCustomField={setCustomField}
                      setTotalPrice={setTotalPrice}
                      freePlanLoading={freePlanLoading}
                      handleFreePlan={handleFreePlan}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {planList.length == 0 ? (
              <div className="pu_noData">
                <span>{svg.noData}</span>
                <h3>No Plans Found.</h3>
                <p>There is no Plans available with this filter.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Popup
        heading=""
        show={addCouponPopup}
        onClose={couponPopupCloseHandler}
        maxWidth={"465px"}
      >
        <div className={styles.coupon_wrapper}>
          <h2>{planName}</h2>
          <p>{userData.email}</p>
          <div className={styles.apply_couple_toggle_wrap}>
            Have a coupon ?{" "}
            <span
              className={`${styles.apply_couple_toggle} ${expandInput ? styles.rotate_icon : ""
                }`}
              onClick={() => setExpandInput(!expandInput)}
            >
              {svg.expand_arrow}
            </span>
          </div>
          {expandInput && (
            <div className={"pu_input_wrapper " + styles.coupon_apply_inp}>
              <input
                type="text"
                placeholder="Enter coupon code"
                className="pu_input"
                name="discount"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                type="button"
                className={"pu_btn " + styles.coupon_btn_apply}
                onClick={(e) => applyCouponCode()}
              >
                Apply
              </button>
            </div>
          )}
          {savedAmount && (
            <Alert
              sx={{
                fontSize: "12px",
                fontFamily: "Poppins",
                marginBottom: "10px",
                backgroundColor: "rgba(58, 223, 149, 0.15)",
              }}
              onClose={() => removeCoupon()}
            >
              {savedAmount}
            </Alert>
          )}
          <div className={styles.amount_wrap}>
            {/* <span>{savedAmount}</span> */}
            <h3>
              Your Total: {currency.symbol} {totalPrice}{" "}
            </h3>
            <p>Valid upto {planValidity} days</p>
            <p>Total e-cards: {numberOfEcard}</p>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="pu_btn"
              style={{ width: "100%" }}
              onClick={(e) => handlePlanPurchase()}
            >
              Buy now
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default Plan;
