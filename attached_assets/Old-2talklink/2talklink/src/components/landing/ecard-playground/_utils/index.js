export const localStorageConfig = {
  TALK_LINK_PLAY_GROUND: "TalkLinkPlayGround",
  TALK_LINK_PLAY_GROUND_META_DATA: "TalkLinkPlayGroundMetadata",
  TALK_LINK_PALY_GROUND_SCORE: "TalkLinkPlayGroundScore",
};

export const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getLocalStorageData = (key) =>
  JSON.parse(localStorage.getItem(key));
