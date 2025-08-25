import $ from "jquery";
import Router, { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Cookies from "js-cookie";
import Head from "next/head";
import Alert from "./common/Alert";

import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/actions/authAction";
import Header from "./common/header/Header";
import RemovePopup from "./common/removePopup";

let Layout = function ({ children }) {
  useEffect(() => {
    /* dropdown start */
    $(document).on("click", ".pu_dropdown_toggle", function () {
      $(this).parent().addClass("open");
    });
    $(document).on("click", ".pu_dropdown_link", function () {
      $(".pu_dropdown_wrapper").removeClass("open");
    });

    $(document).mouseup(function (e) {
      var container = $(".pu_dropdown_dd");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".pu_dropdown_wrapper").removeClass("open");
      }
    });
    /* dropdown end */

    /* color picker start */
    $(document).on("click", ".pu_color_picker_toggle", function () {
      $(this).parent().addClass("open");
    });
    $(document).mouseup(function (e) {
      var container = $(".pu_color_picker_dropdown");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".pu_color_picker_wrapper").removeClass("open");
      }
    });
    /* color picker end */
  }, []);

  let dispatch = useDispatch();
  const store = useSelector((store) => store);
  const router = useRouter();
  let adminUrl = router.pathname.split("/admin/").length >= 2 ? 1 : 0;
  let userUrl = router.pathname.split("/user/").length >= 2 ? 1 : 0;
  let adminDashboard = "/admin/dashboard";
  let userDashboard = "/dashboard";
  let isAuthPage = [
    "/",
    "/pricing",
    "/privacy-and-policy",
    "/terms-of-service",
    "/contact",
    "/auth/[auth]",
    "/verify/[id]",
    "/reset-password/[token]",
  ].includes(router.pathname);
  let tokenCookie = Cookies.get("accessToken")
    ? Cookies.get("accessToken")
    : false;
  let tokenData;
  if (tokenCookie) {
    tokenData = jwtDecode(tokenCookie);
  }

  if (
    router.pathname.split("/preview/[template_id]/[id]").length > 1 ||
    router.pathname === "/[link_preview]" ||
    router.pathname === "/[link_preview]/[id]"
  ) {
    //preview page
    return (
      <>
        <Head>
          <title>{store.common.title}</title>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            content="width=device-width, initial-scale=1.0"
            name="viewport"
          />
          <meta name="description" content={store.common.description} />
          <meta name="keywords" content={store.common.keywords} />
          <meta name="author" content="PixelNX Pvt. Ltd." />
          <meta name="MobileOptimized" content="320" />
          <link
            rel="shortcut icon"
            type="image/ico"
            href="/images/favicon.png"
          />
        </Head>
        <div className="pu_preloader">
          <div className="pu_preloader_inner">
            <img src="/images/favicon.png" width={140} alt="" />
            <p className="pu_preloader_text hide">Loading...</p>
          </div>
        </div>
        {children}
      </>
    );
  } else {
    if ((!tokenCookie || !store.userData.token) && !isAuthPage) {
      //member page withoud token
      dispatch(logout());
    } else if (
      store.userData.token &&
      tokenCookie &&
      store.userData.token != tokenCookie
    ) {
      dispatch(logout());
    } else {
      if (tokenCookie && store.userData.token && isAuthPage) {
        //check user login and access any auth pages
        //Router.push(store.userData.role == true?adminDashboard : userDashboard);
        if (tokenData?.role == 1) {
          Router.push(adminDashboard);
        } else if (tokenData?.role == 2) {
          if (router.pathname !== "/") {
            Router.push(adminDashboard);
          }
        }
      } else {
        if (tokenData?.role == 2 && adminUrl) {
          //restriction user for admin page access
          Router.push(userDashboard);
        } else if (tokenData?.role == 1 && userUrl) {
          //restriction admin for user page access
          Router.push(adminDashboard);
        }
      }
    }

    return (
      <>
        <Head>
          <title>{store.common.title}</title>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            content="width=device-width, initial-scale=1.0"
            name="viewport"
          />
          <meta name="description" content={store.common.description} />
          <meta name="keywords" content={store.common.keywords} />
          <meta name="author" content="PixelNX Pvt. Ltd." />
          <meta name="MobileOptimized" content="320" />
          <link
            rel="shortcut icon"
            type="image/ico"
            href="/images/favicon.png"
          />
        </Head>
        <div className="pu_preloader">
          <div className="pu_preloader_inner">
            <img src="/images/favicon.png" width={140} alt="" />
            <p className="pu_preloader_text hide">Loading...</p>
          </div>
        </div>

        <Alert />
        <div className="pu_main_wrapper">
          {isAuthPage ? (
            ""
          ) : (
            <>
              <Header />
            </>
          )}

          <div className={!isAuthPage ? "pu_content_wrapper" : ""}>
            {children}
          </div>
        </div>
        <RemovePopup />
      </>
    );
  }
};
export default Layout;
