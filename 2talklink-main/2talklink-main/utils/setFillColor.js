export const setFillColor = (svg, color) => {
    let newSvg = svg.replace("fill=#111", `fill=${color}`)
    return newSvg
}