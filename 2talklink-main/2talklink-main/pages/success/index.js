import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Loading } from "../../src/helper/helper";
import { common } from "../../src/helper/Common";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Mail } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { Dashboard } from "@mui/icons-material";
const styles = {
  container: {
    // background: "linear-gradient(135deg, #fceabb, #f8b500)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    // background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "100%",
    // boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#27ae60",
    marginBottom: "20px",
  },
  message: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "10px",
  },
  contact: {
    marginTop: "20px",
    fontSize: "15px",
    color: "#555",
  },
  link: {
    color: "#2980b9",
    textDecoration: "none",
    fontWeight: "500",
  },
  loaderBox: {
    textAlign: "center",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #27ae60",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "10px",
  },
  warningText: {
    fontSize: "15px",
    color: "#c0392b",
    marginBottom: "5px",
  },
};
const SuccessPage = () => {
  const router = useRouter();
  const [orderstatus, setORderstatus] = useState("");

  const store = useSelector((store) => store);
  const {
    session_id,
    plan_id,
    couponCode,
    vcard_number = 0,
    vcard_price = 0,
  } = router.query;

  useEffect(() => {
    if (session_id && plan_id) {
      handleSuccess(session_id, plan_id, couponCode, vcard_number, vcard_price);
    }
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
    document.head.appendChild(styleTag);
  }, [session_id]);

  const [isLoading, setIsLoading] = useState(true);

  const handleSuccess = (
    session_id,
    plan_id,
    couponCode,
    vcard_number,
    vcard_price
  ) => {
    let data = {
      session_id: session_id,
      user_id: store.userData.user_id,
      plan_id: plan_id,
    };
    if (vcard_number && vcard_price) {
      data = { ...data, customField: { vcard_number, vcard_price } };
    }
    if (couponCode !== "") {
      data.couponCode = couponCode;
    }
    Loading(true);
    common.getAPI(
      {
        method: "POST",
        url: "user/stripeSuccess",
        data: data,
      },
      (resp) => {
        if (resp.status === "success") {
          setIsLoading(false);
          setORderstatus(resp);
        }
      },
      (resp) => {
        if (resp.status === "error") {
          if (resp?.code === 500) {
            return window.location.reload();
          }
        }
      }
    );
  };

  return (
    <>
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem 1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              padding: "2rem",
            }}
          >
            <Loader2
              style={{
                animation: "spin 1s linear infinite",
                color: "#4f46e5",
                width: "48px",
                height: "48px",
              }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
                margin: "0",
              }}
            >
              Processing Your Payment
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#4b5563",
                margin: "0",
                maxWidth: "400px",
              }}
            >
              Please do not refresh or close this page until the payment is
              completed.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              padding: "1rem",
            }}
          >
            <CheckCircle
              style={{
                color: "#10b981",
                width: "64px",
                height: "64px",
              }}
            />
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  margin: "0 0 1rem 0",
                }}
              >
                <strong>Thank You for Your Payment!</strong>
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#4b5563",
                  margin: "0",
                  lineHeight: "1.6",
                }}
              >
                Your payment has been successfully processed, and your Package
                Plan is now active. You can start enjoying all the premium
                features of 2Talklink immediately.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "1.5rem",
                borderRadius: "8px",
                width: "100%",
                marginTop: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  margin: "0 0 1rem 0",
                }}
              >
                Need Help?
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#4b5563",
                  margin: "0 0 1.5rem 0",
                }}
              >
                If you have any questions or need assistance, feel free to
                contact our support team:
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="mailto:contact@2talklink.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "background-color 0.2s",
                  }}
                >
                  <Mail size={18} />
                  <span>Email Support</span>
                </a>
                <a
                  href="https://wa.me/8801724778142"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    backgroundColor: "#25D366",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "background-color 0.2s",
                  }}
                >
                  <MessageSquare size={18} />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "1.5rem",
                borderRadius: "8px",
                width: "100%",
                marginTop: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/dashboard">
                  <div
                    className="pu_btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.25rem",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Dashboard size={18} />
                    <span>Go to Dashboard</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default SuccessPage;
