import Link from "next/link";
import styles from "../../../../styles/pages/LandingPage.module.css";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { common } from "../../../helper/Common";
import { useEffect, useRef, useState } from "react";

const rootPages = [
  "/#play-ground",
  "/#core-feature",
  "/#how-it-work",
  "/#templates",
  "/",
];

export default function Header({ customBackground }) {
  const router = useRouter();
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const checkPlanFeature = () => {
    common.getAPI(
      {
        method: "POST",
        url: "auth/checkPlanFeature",
        data: {},
      },
      (resp) => {
        if (resp.status === "success") {
          setIsEnabled(resp.data.isEnabled);
        }
      }
    );
  };
  useEffect(() => {
    checkPlanFeature();
  }, []);
  const headerContainer = useRef();
  const headerNav = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerNav.current && !headerNav.current.contains(event.target)) {
        headerContainer.current.classList.remove(styles.openNav);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headerNav]);
  const navToggle = () => {
    headerContainer.current.classList.add(styles.openNav);
  };
  useEffect(() => {
    let tokenCookie = Cookies.get("accessToken")
      ? Cookies.get("accessToken")
      : false;
    if (tokenCookie) {
      setIsUserLogin(true);
    } else {
      setIsUserLogin(false);
    }
  }, [router.query]);

  const isRootPath = rootPages.includes(router.asPath);

  return (
    <>
      <div className={styles.header}>
        <div
          style={{ borderRadius: "50px", background: "#fff" }}
          className="pu_container"
          ref={headerContainer}
        >
          <div className={styles.header_inner}>
            <div className={styles.logo}>
              <Link href="/">
                <a>
                  <img src="/images/2TalkLink-Logo.png" width="150px" />
                </a>
              </Link>
            </div>
            <div className={styles.nav_toggle} onClick={() => navToggle()}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.833403 8.33236C0.612371 8.33236 0.400392 8.24456 0.244098 8.08826C0.0878049 7.93197 0 7.71999 0 7.49896V0.833403C0 0.612371 0.0878049 0.400392 0.244098 0.244098C0.400392 0.0878048 0.612371 0 0.833403 0H7.50063C7.72166 0 7.93364 0.0878048 8.08993 0.244098C8.24622 0.400392 8.33403 0.612371 8.33403 0.833403V7.49896C8.33403 7.71999 8.24622 7.93197 8.08993 8.08826C7.93364 8.24456 7.72166 8.33236 7.50063 8.33236H0.833403ZM12.501 8.33236C12.28 8.33236 12.068 8.24456 11.9117 8.08826C11.7554 7.93197 11.6676 7.71999 11.6676 7.49896V0.833403C11.6676 0.612371 11.7554 0.400392 11.9117 0.244098C12.068 0.0878048 12.28 0 12.501 0H19.1666C19.3876 0 19.5996 0.0878048 19.7559 0.244098C19.9122 0.400392 20 0.612371 20 0.833403V7.49896C20 7.71999 19.9122 7.93197 19.7559 8.08826C19.5996 8.24456 19.3876 8.33236 19.1666 8.33236H12.501ZM0.833403 20C0.612371 20 0.400392 19.9122 0.244098 19.7559C0.0878049 19.5996 0 19.3876 0 19.1666V12.4994C0 12.2783 0.0878049 12.0664 0.244098 11.9101C0.400392 11.7538 0.612371 11.666 0.833403 11.666H7.50063C7.72166 11.666 7.93364 11.7538 8.08993 11.9101C8.24622 12.0664 8.33403 12.2783 8.33403 12.4994V19.1666C8.33403 19.3876 8.24622 19.5996 8.08993 19.7559C7.93364 19.9122 7.72166 20 7.50063 20H0.833403ZM12.501 20C12.28 20 12.068 19.9122 11.9117 19.7559C11.7554 19.5996 11.6676 19.3876 11.6676 19.1666V12.4994C11.6676 12.2783 11.7554 12.0664 11.9117 11.9101C12.068 11.7538 12.28 11.666 12.501 11.666H19.1666C19.3876 11.666 19.5996 11.7538 19.7559 11.9101C19.9122 12.0664 20 12.2783 20 12.4994V19.1666C20 19.3876 19.9122 19.5996 19.7559 19.7559C19.5996 19.9122 19.3876 20 19.1666 20H12.501Z"
                  fill="#F9913A"
                />
              </svg>
              <span>Menu</span>
            </div>
            <div className={styles.nav} ref={headerNav}>
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                {isRootPath && (
                  <>
                    <li>
                      <Link href="#core-feature">Core Feature</Link>
                    </li>
                    <li>
                      <Link href="#templates">Templates</Link>
                    </li>
                    <li>
                      <Link href="#how-it-work">How It Work</Link>
                    </li>
                    <li>
                      <Link href="#play-ground">Play Ground</Link>
                    </li>
                  </>
                )}
                {isEnabled ? (
                  isUserLogin ? (
                    <li>
                      <Link href="/checkout">Pricing</Link>
                    </li>
                  ) : (
                    <li>
                      <Link href="/pricing">Pricing</Link>
                    </li>
                  )
                ) : (
                  ""
                )}
              </ul>
            </div>
            <div className={styles.header_action}>
              {isUserLogin ? (
                <Link href="/dashboard">
                  <a className="pu_btn">Dashboard</a>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <a className={"pu_btn pu_btn_link " + styles.pu_btn_link}>
                      Sign In
                    </a>
                  </Link>
                  <Link href="/auth/registration">
                    <a className="pu_btn">Sign Up</a>
                  </Link>
                </>
              )}
            </div>
            <div
              className={"pu_dropdown_wrapper " + styles.header_action_mobile}
            >
              <div
                className={"pu_dropdown_toggle " + styles.header_action_avatar}
                data-toggle="dropdown"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 6.42847C13.9404 6.42847 12.9047 6.74266 12.0237 7.33131C11.1427 7.91996 10.4561 8.75663 10.0506 9.73552C9.64514 10.7144 9.53905 11.7916 9.74576 12.8307C9.95247 13.8699 10.4627 14.8245 11.2119 15.5737C11.9611 16.3229 12.9157 16.8331 13.9548 17.0398C14.994 17.2465 16.0712 17.1404 17.0501 16.735C18.0289 16.3295 18.8656 15.6429 19.4543 14.7619C20.0429 13.8809 20.3571 12.8452 20.3571 11.7856C20.3571 10.3648 19.7927 9.0022 18.788 7.99754C17.7834 6.99288 16.4208 6.42847 15 6.42847ZM15 14.9999C14.3642 14.9999 13.7428 14.8114 13.2142 14.4582C12.6856 14.105 12.2736 13.603 12.0304 13.0157C11.7871 12.4283 11.7234 11.782 11.8474 11.1585C11.9715 10.535 12.2776 9.96229 12.7271 9.51277C13.1766 9.06324 13.7494 8.75711 14.3729 8.63308C14.9964 8.50906 15.6427 8.57271 16.23 8.816C16.8174 9.05928 17.3194 9.47126 17.6725 9.99985C18.0257 10.5284 18.2143 11.1499 18.2143 11.7856C18.2134 12.6378 17.8745 13.4549 17.2719 14.0575C16.6693 14.6601 15.8522 14.999 15 14.9999Z"
                    fill="#F9913A"
                  />
                  <path
                    d="M15 0C12.0333 0 9.13319 0.879735 6.66645 2.52796C4.19971 4.17618 2.27713 6.51886 1.14181 9.25975C0.00649925 12.0006 -0.290551 15.0166 0.288227 17.9263C0.867006 20.8361 2.29562 23.5088 4.3934 25.6066C6.49119 27.7044 9.16394 29.133 12.0736 29.7118C14.9834 30.2905 17.9994 29.9935 20.7403 28.8582C23.4811 27.7229 25.8238 25.8003 27.472 23.3335C29.1203 20.8668 30 17.9667 30 15C29.9955 11.0231 28.4137 7.21047 25.6016 4.39841C22.7895 1.58635 18.9769 0.0045372 15 0V0ZM8.57143 26.1182V24.6429C8.57228 23.7906 8.9112 22.9736 9.51382 22.3709C10.1164 21.7683 10.9335 21.4294 11.7857 21.4286H18.2143C19.0665 21.4294 19.8836 21.7683 20.4862 22.3709C21.0888 22.9736 21.4277 23.7906 21.4286 24.6429V26.1182C19.4777 27.2574 17.2591 27.8577 15 27.8577C12.7409 27.8577 10.5223 27.2574 8.57143 26.1182V26.1182ZM23.5629 24.5636C23.5415 23.1582 22.9689 21.8175 21.9685 20.8303C20.968 19.843 19.6198 19.2884 18.2143 19.2857H11.7857C10.3802 19.2884 9.03197 19.843 8.03153 20.8303C7.03108 21.8175 6.4585 23.1582 6.43715 24.5636C4.49418 22.8287 3.124 20.5445 2.50804 18.0136C1.89208 15.4826 2.0594 12.8243 2.98783 10.3906C3.91627 7.95683 5.56203 5.8625 7.70719 4.38489C9.85235 2.90728 12.3957 2.1161 15.0005 2.1161C17.6054 2.1161 20.1487 2.90728 22.2939 4.38489C24.4391 5.8625 26.0848 7.95683 27.0132 10.3906C27.9417 12.8243 28.109 15.4826 27.493 18.0136C26.8771 20.5445 25.5069 22.8287 23.5639 24.5636H23.5629Z"
                    fill="#F9913A"
                  />
                </svg>
              </div>
              <div className={"pu_dropdown_dd " + styles.profile_dropdown}>
                <ul>
                  <li>
                    <Link href="/auth/login">
                      <a className="pu_dropdown_link">Sign In</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/registration">
                      <a className="pu_dropdown_link">Sign Up</a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={customBackground && { background: customBackground }}
        className={styles.headerHacks}
      ></div>
    </>
  );
}
