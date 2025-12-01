import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { common } from "../../../src/helper/Common";
import { useDispatch } from "react-redux";
import { socialIconUpdateACT } from "../../../src/redux/actions/editorAction";
export default function SocialIcons({
  cData,
  activeTab,
  styles,
  iconLinkList,
  changeSocialIconInput,
  saveSocialIcon,
  updateSocialIconStatus,
  setIconLinkList,
  props,
  handleTextareaChange,
}) {
  const dispatch = useDispatch();

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedIcons = Array.from(iconLinkList);
    const [reorderedItem] = reorderedIcons.splice(result.source.index, 1);
    reorderedIcons.splice(result.destination.index, 0, reorderedItem);
    const newData = {
      template_id: props.editorData._id,
      icon_data: reorderedIcons,
    };

    dispatch(socialIconUpdateACT(newData));
    setIconLinkList(reorderedIcons);
    updateSocialIconData(reorderedIcons);
  };

  // Update common data
  const updateSocialIconData = (newData) => {
    common.getAPI(
      {
        method: "POST",
        option: true,
        url: "editor/updateIconData",
        data: {
          template_id: props.editorData._id,
          icon_data: newData,
        },
      },
      (resp) => { }
    );
  };

  return (
    <section>
      <div
        className={
          "pu_tab_content " +
          (activeTab === "tab_socialsettings" ? "active" : "")
        }
        style={{ marginTop: 10 }}
      >
        <div className="pu_setting_content_header">
          <h3>Social Icons</h3>
        </div>
        <div className="pu_setting_content_body">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="socialIcons">
              {(provided) => (
                <div
                  className={styles.social_icon_link_list}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {iconLinkList.map((icon, index) => (
                    <Draggable
                      key={icon.id}
                      draggableId={icon.id}
                      index={index}
                    >
                      {(provided) => (
                        <>
                          <div
                            className={styles.social_icon_link_item}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div
                              className={styles.section_drag_icon}
                              {...(provided.dragprops
                                ? { ...provided.dragprops.dragHandleProps }
                                : null)}
                            >
                              <span></span>
                              <span></span>
                            </div>

                            <div
                              className={styles.social_icon_link_svg}
                              dangerouslySetInnerHTML={{
                                __html: icon.svg_code,
                              }}
                            ></div>
                            <div
                              className={
                                "pu_input_wrapper " + styles.input_wrapper
                              }
                            >
                              <label>
                                Enter
                                {icon.itype === "url"
                                  ? " " + icon.name + " "
                                  : " "}
                                <span style={{ textTransform: "capitalize" }}>
                                  {icon.itype}
                                </span>
                              </label>
                              <input
                                className={styles.social_icon_link_input}
                                type={
                                  icon.itype === "phone" ||
                                    icon.itype === "text" ||
                                    icon.itype === "connect"
                                    ? "tel"
                                    : "text"
                                }
                                placeholder={
                                  icon.itype === "url"
                                    ? "https://"
                                    : icon.itype === "phone"
                                      ? "+1"
                                      : icon.itype === "text"
                                        ? "Enter your text"
                                        : icon.itype === "connect"
                                          ? "Enter contact info" :
                                          icon.itype === "whatsapp" ? "Enter whatsapp number" : "yourname@company.com"
                                }
                                value={icon.value}
                                onChange={(e) => changeSocialIconInput(e, icon)}
                                onBlur={(e) => saveSocialIcon(e, icon)}
                              />
                              {/* Textarea added below the input box */}
                              {icon.itype === "connect" && (
                                <textarea
                                  style={{
                                    marginTop: ".7rem",
                                    resize: "none",
                                  }}
                                  className={styles.social_icon_link_input}
                                  placeholder="Your connection message here..."
                                  value={icon.message}
                                  onChange={(e) =>
                                    handleTextareaChange(e, icon)
                                  } // Create a function to handle the change
                                  onBlur={(e) => saveSocialIcon(e, icon)}
                                />
                              )}
                            </div>
                            <div className={styles.social_icon_link_action}>
                              <div className="pu_switch">
                                <input
                                  id={"userChk_" + index}
                                  type="checkbox"
                                  value={icon.status}
                                  defaultChecked={icon.status === 1}
                                  onClick={(e) =>
                                    updateSocialIconStatus(
                                      icon.id,
                                      icon.status === 1 ? 0 : 1
                                    )
                                  }
                                />
                                <label htmlFor={"userChk_" + index}>
                                  <span className="pu_switch_icon"></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </section>
  );
}
