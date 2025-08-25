export const convertToLocalDateTime = (isoString) => {
    if (!isoString) return ""; // Handle empty or invalid values
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Extract "YYYY-MM-DDTHH:mm"
  };
  