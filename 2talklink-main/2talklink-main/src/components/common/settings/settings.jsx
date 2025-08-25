import { useEffect, useState, React } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { compose } from "redux";
import { setPageHeading } from "../../../redux/actions/commonAction";
import styles from "./Settings.module.css";
import { common } from "../../../helper/Common";

import { Loading } from "../../../helper/helper";
import "../../../../node_modules/cropperjs/dist/cropper.css";
import currencies from "../../../helper/currencies";
import { set } from "mongoose";
// import React from 'react';

const Settings = (props) => {
    let dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setPageHeading({
                pageHeading: "2TalkLink - Setting",
                title: "2TalkLink - Setting",
            })
        );
    }, [dispatch]);

    const store = useSelector((store) => store);

    const [stripeKey, setStripeKey] = useState("");
    const [stripeSecret, setStripeSecret] = useState("");
    const [currencyCode, setCurrencyCode] = useState({});
    const [isEnable, setIsEnabled] = useState(false);
    const [isAdsEnable, setIsAdsEnable] = useState(false);
    const [adScript, setAdScript] = useState("");
    const [adScriptCode, setAdScriptcode] = useState("");
    const [message, setMessage] = useState("");

    const handleCurrency = (currency) => {
        currencies.map((val) => {
            if (val.title === currency) {
                setCurrencyCode(val);
            }
        });
    };

    const handleSubmit = () => {
        if (isAdsEnable == true) {
            if (adScriptCode === "" || adScript === "") {
                setMessage("All fields are required");
                return false;
            }
        }
        const data = {
            user_id: store.userData.user_id,
            stripeKey: stripeKey,
            stripeSecret: stripeSecret,
            currency: currencyCode,
            isEnable: isEnable,
            isAdEnable: isAdsEnable,
            adScript: adScript,
            adScriptCode: adScriptCode,
        };

        Loading(true);
        common.getAPI(
            {
                method: "POST",
                url: "admin/updateSettings",
                data: data,
            },
            (resp) => {
                if (resp.status === "success") {
                }
            }
        );
    };
    useEffect(() => {
        getSettings();
    }, []);

    const getSettings = () => {
        const data = {
            user_id: store.userData.user_id,
        };
        Loading(true);
        common.getAPI(
            {
                method: "POST",
                url: "admin/getSettings",
                data: data,
            },
            (resp) => {
                if (resp.status === "success") {
                    setStripeKey(resp.data.stripeKey);
                    setStripeSecret(resp.data.stripeSecret);
                    setCurrencyCode(resp.data.currency);
                    setIsEnabled(resp.data.isEnabled);
                    setIsAdsEnable(resp.data.isAdEnabled);
                    setAdScript(resp.data.adScript);
                    setAdScriptcode(resp.data.adScriptCode);
                }
            }
        );
    };

    return (
        <>
            <div className="pu_container">
                <div className={styles.profile_wrapper}>
                    <div className={styles.profile_left}></div>

                    <div className={styles.profile_right}>
                        <form>
                            <div className={styles.profile_box}>
                                <div className={styles.profile_box_title}>
                                    <h3>Payment Settings</h3>
                                </div>
                            </div>
                            <div className={styles.profile_box}>
                                <div className={styles.profile_box_body}>
                                    <div className="pu_input_wrapper_list">
                                        <div className="pu_input_wrapper">
                                            <label>Stripe Key</label>
                                            <input
                                                type="text"
                                                className="pu_input"
                                                placeholder="Enter Key"
                                                value={stripeKey}
                                                onChange={(e) =>
                                                    setStripeKey(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="pu_input_wrapper_list">
                                        <div className="pu_input_wrapper">
                                            <label>Stripe Secret</label>
                                            <input
                                                type="text"
                                                className="pu_input"
                                                placeholder="Enter Secret Key"
                                                value={stripeSecret}
                                                onChange={(e) =>
                                                    setStripeSecret(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="pu_input_wrapper_list">
                                        <div
                                            className="pu_input_wrapper"
                                            style={{ marginBottom: 0 }}>
                                            <label>Select Currency</label>
                                            <select
                                                className=" pu_input"
                                                value={currencyCode.title || ""}
                                                onChange={(e) =>
                                                    handleCurrency(
                                                        e.target.value
                                                    )
                                                }>
                                                <option value={""}>
                                                    Select currency code
                                                </option>
                                                {currencies.map((code, i) => {
                                                    return (
                                                        <option key={i}>
                                                            {code.title}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    <br />
                                    <div className={styles.profile_box_title}>
                                        <div
                                            className={
                                                styles.profile_box_title
                                            }>
                                            <div className="pu_switch">
                                                <input
                                                    id={"planChk_0"}
                                                    type="checkbox"
                                                    checked={isEnable}
                                                    onChange={(e) =>
                                                        setIsEnabled(!isEnable)
                                                    }
                                                />
                                                <label htmlFor={"planChk_0"}>
                                                    <span className="pu_switch_icon"></span>
                                                    <span className="pu_switch_text">
                                                        {isEnable
                                                            ? `Plan Disable `
                                                            : "Plan Enable "}
                                                    </span>
                                                </label>
                                            </div>
                                            <div>
                                                <label>
                                                    {isEnable
                                                        ? `Disable `
                                                        : "Enable "}{" "}
                                                    all subscription related
                                                    functionality across the
                                                    site.
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    {isEnable ? (
                                        <div>
                                            <div
                                                className={
                                                    styles.profile_box_title
                                                }>
                                                <div className="pu_switch">
                                                    <input
                                                        id={"adsChk_0"}
                                                        type="checkbox"
                                                        checked={isAdsEnable}
                                                        onChange={(e) =>
                                                            setIsAdsEnable(
                                                                !isAdsEnable
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor={"adsChk_0"}>
                                                        <span className="pu_switch_icon"></span>
                                                        <span className="pu_switch_text">
                                                            {isAdsEnable
                                                                ? `Ads Disable `
                                                                : "Ads Enable "}
                                                        </span>
                                                    </label>
                                                    <input />
                                                </div>
                                                <div>
                                                    <label>
                                                        {isAdsEnable
                                                            ? `Disable`
                                                            : "Enable "}{" "}
                                                        ads for free users
                                                    </label>
                                                </div>
                                            </div>
                                            {isAdsEnable ? (
                                                <div
                                                    className="pu_input_wrapper"
                                                    style={{
                                                        marginTop: "18px",
                                                    }}>
                                                    <label>
                                                        This code will be added
                                                        in head section.
                                                    </label>
                                                    <input
                                                        rows="2"
                                                        className="pu_input"
                                                        placeholder="Enter Your Script Library."
                                                        value={adScript}
                                                        onChange={(e) =>
                                                            setAdScript(
                                                                e.target.value
                                                            )
                                                        }></input>
                                                    <br />
                                                    <br />
                                                    <label>
                                                        Add your ins script.
                                                    </label>
                                                    <textarea
                                                        rows="2"
                                                        className="pu_input"
                                                        placeholder="Enter Your ins Script."
                                                        value={adScriptCode}
                                                        onChange={(e) =>
                                                            setAdScriptcode(
                                                                e.target.value
                                                            )
                                                        }></textarea>
                                                    {message != "" ? (
                                                        <span
                                                            style={{
                                                                color: "red",
                                                            }}>
                                                            {message}
                                                        </span>
                                                    ) : (
                                                        ""
                                                    )}
                                                    {/* <input type="text" className="pu_input" placeholder='Enter Your Adsense Script' value={adScript} onChange={(e) => setAdScript(e.target.value)} /> */}
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    <button
                                        type="button"
                                        className="pu_btn"
                                        onClick={() => handleSubmit()}>
                                        Save Changes
                                    </button>
                                    <br />
                                    <br />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state.userData,
    };
};
export default compose(connect(mapStateToProps, null))(Settings);
