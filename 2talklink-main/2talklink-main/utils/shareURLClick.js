const shareURLClick = (pageUrl) => {
  if (pageUrl) {
    let shareData = {
      title: props.name,
      text: props.tagline,
      url: pageUrl,
    };
    navigator.share(shareData);
  }
};

export default shareURLClick;
