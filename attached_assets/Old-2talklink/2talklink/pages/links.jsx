import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LinkList from "../src/components/common/linklist/LinkList";
import { setPageHeading } from "../src/redux/actions/commonAction";
import { common } from "../src/helper/Common";
import PlanAlert from "../src/components/common/PlanAlert";

const MyLinks = () => {
  let dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPageHeading({
        pageHeading: "2TalkLink - My Links",
        title: "2TalkLink - My Links",
      })
    );
  }, [dispatch]);
  const [linkCount, setLinkCount] = useState("0");
  const [totalLinkCount, setTotalLinkCount] = useState("0");
  const [showAlertBar, setShowAlertBar] = useState(false);

  const alertBarCloseHandler = () => {
    setShowAlertBar(false);
  };
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
            if (resp.data.isPlan && resp.data.isExpired) {
              setShowAlertBar(true);
            }
          }
          if (
            resp.data.isPlan &&
            resp.data.isFreePlanExpired &&
            !resp.data?.isFreePlan
          ) {
            setShowAlertBar(true);
            return;
          }
        }
      }
    );
  };

  useEffect(() => {
    getCurrentPlan();
  }, []);

  return (
    <div className="pu_container">
      <PlanAlert show={showAlertBar} onClose={alertBarCloseHandler} />
      <div className="pu_pagetitle_wrapper">
        <h3>
          You've created ({linkCount}) links out of ({totalLinkCount}). You can
          still add ({totalLinkCount - linkCount}) more
        </h3>
        <div className="pu_pagetitle_right">
          {/* <div className="pu_search_wrapper">
                        <input type="text" placeholder="Search"/>
                        <span className="pu_search_icon">{svg.search_icon}</span>
                    </div> */}
          <Link href="/templates">
            <a className="pu_btn">Add New</a>
          </Link>
          {/* <CreateLink>
                    </CreateLink> */}
        </div>
      </div>
      <LinkList
        isDuplicateDisable={totalLinkCount - linkCount <= 0}
        setLinkCount={setLinkCount}
        setTotalLinkCount={setTotalLinkCount}
      />
    </div>
  );
};
export default MyLinks;
