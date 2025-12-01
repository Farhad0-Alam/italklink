import { getRandomNumberInRange } from "./getRandomNumberInRange";

export const extractGradientColor = (gradientString) => {
  const colorMatches = gradientString.match(/#\w+/g);

  if (colorMatches) {
    const colorArray = colorMatches;
    return colorArray[getRandomNumberInRange(0, 0)]
  }
}