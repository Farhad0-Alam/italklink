export const generateCoverV1 = (primaryColor, secondaryColor) => {
  const svgString = `
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 390 234.4" style="enable-background:new 0 0 390 234.4;" xml:space="preserve">
        <style type="text/css">
          .st0{fill:${secondaryColor};}
          .st1{fill:${primaryColor};}
        </style>
        <path class="st0" d="M390,0v104.4c-10.3,18.8-41.5,77-117.3,97.7C178.8,227.8,58.1,173.5,0,63.6V0H390z"/>
        <path class="st1" d="M21.2,120c0,0,209.3,216.7,368.8,6.3v32.8C390,159.1,227.6,352.3,21.2,120z"/>
        <path d="M317.4,232.6"/>
      </svg>
    `;

  // URL encode the SVG string
  const encodedSvg = encodeURIComponent(svgString);

  // Return as a data URL
  return `url("data:image/svg+xml,${encodedSvg}")`;
};
export const generateCoverV3 = (gradientNumberOne, primaryColor, bgColor) => {
  // Construct the updated SVG string with valid XML
  const svgString = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  viewBox="0 0 390 365.3" style="enable-background:new 0 0 390 365.3;" xml:space="preserve">
<style type="text/css">
 .st0{fill:none;}
 .st1{fill:${gradientNumberOne};}
 .st2{fill:none;stroke:${bgColor};stroke-width:21;stroke-miterlimit:10;}
 .st3{fill:${primaryColor};}
</style>
<circle class="st0" cx="-917.9" cy="-199.1" r="75.7"/>
<path class="st1" d="M0,0v363.7c0,0,3.5-24,37.2-24c33.7,0,307.8,0,307.8,0s44.7-1.2,44.7,24V0H0z M196.1,195
 c-46.9,0-85.1-38.2-85.1-85.1c0-9.4,1.5-18.5,4.4-27c11.3-33.7,43.2-58.1,80.7-58.1c42.1,0,77.1,30.7,83.9,70.9
 c0.8,4.6,1.2,9.3,1.2,14.2C281.2,156.8,243,195,196.1,195z"/>
<g>
 
   
 <g>
   <circle class="st2" cx="196.1" cy="109.9" r="74.9"/>
 </g>
</g>
<g>
 <g>
   <path class="st3" d="M0.1,0c0,0,0.1,62.6,0.1,82.4v5.2c8-6.9,20.1-7.1,29.9-3.1c6.2,2.5,11.6,6.4,16.7,10.7
     c4.7,3.9,7.6,6.7,13.7,8.3c1.9,0.5,3.9,0.7,6,0.7c11.8,0,24.1-7.2,24.1-7.3c7.6-3.1,17.4-9.3,25-14c11.3-33.7,43.2-58.1,80.7-58.1
     c42.1,0,77.1,30.7,83.9,70.9c11.9,7.5,25.6,12.6,39.3,10.2c9.8-1.8,18.4-7.1,26.8-12.7c2.5-1.6,4.9-3.2,7.4-4.8
     c10.9-6.9,23.9-12.6,36.3-9c0,0,0,0,0.1,0V0H0.1z M70.4,86.3c-2.8,2-5.7-0.9-3.7-3.7C69.5,80.6,72.4,83.5,70.4,86.3z M100.2,36.2
     c-3.6,0-6.1-4.1-3.3-7.8c3.8-2.8,7.8-0.2,7.8,3.3C104.5,34.3,102.6,36.2,100.2,36.2z M109.3,76.8c-1.1,0-2-0.9-2-2
     c0-1.1,0.9-2,2-2s2,0.9,2,2C111.3,75.9,110.4,76.8,109.3,76.8z M289.6,49.2c-3.1,2.4-6.6-1.2-4.2-4.2
     C288.5,42.6,292,46.1,289.6,49.2z M310.3,101.8H302v-3.2h8.4V101.8z"/>
   <circle class="st3" cx="29.6" cy="101.4" r="3.8"/>
   <circle class="st3" cx="67.6" cy="123.4" r="2.5"/>
   <circle class="st3" cx="109.3" cy="154.3" r="3.9"/>
   <circle class="st3" cx="341.9" cy="129.5" r="3.2"/>
   <circle class="st3" cx="300.1" cy="150.7" r="2.6"/>
   <circle class="st3" cx="291.9" cy="119.3" r="3"/>
   <path class="st3" d="M92.8,109.9h5.8c0.9,0,1.6,0.7,1.6,1.6l0,0c0,0.9-0.7,1.6-1.6,1.6h-5.8c-0.9,0-1.6-0.7-1.6-1.6l0,0
     C91.1,110.6,91.9,109.9,92.8,109.9z"/>
 </g>
 <g>
   <path class="st3" d="M191.9,186.9c-39.1-2.1-70.7-33.7-72.8-72.8c-2.4-44.4,33.1-81.3,77-81.3v4c-41.6,0-75.2,35-73,77.1
     c2,37,31.9,67,69,69c42.1,2.3,77.1-31.4,77.1-73h4C273.2,153.8,236.3,189.2,191.9,186.9z"/>
 </g>
</g>
</svg>`;
  // URL encode the SVG string
  const encodedSvg = encodeURIComponent(svgString)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  // Return as a data URL
  return `url("data:image/svg+xml,${encodedSvg}")`;
};

export const generateCoverV4 = (gradientNumberOne, primaryColor) => {
  const svgString = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 337 301.3" style="enable-background:new 0 0 337 301.3;" xml:space="preserve">
<style type="text/css">
	.st0{fill:${gradientNumberOne};}
	.st1{fill:none;}
	.st2{fill:${primaryColor};}
</style>
<path class="st0" d="M0.4,0v272.3c0,0,125.2,28.7,168.4,28.7s168.6-25.6,168.6-25.6V0L0.4,0z"/>
<path class="st1" d="M-348.9-12.4"/>
<g>
	<path class="st2" d="M0,80.9c0,0,32.7-3.5,97,46.4c0,0,36.6,26.7,72.3,26.7s79.9-33,79.9-33s59.5-41.3,87.7-40.1V0H0V80.9z"/>
	<path class="st2" d="M105.2,139.2c0,0,33.7,24.5,65.3,24.5s62-24.5,62-24.5s-24.1,30.4-62,30.4S105.2,139.2,105.2,139.2z"/>
</g>
</svg>
`

  // URL encode the SVG string
  const encodedSvg = encodeURIComponent(svgString);

  // Return as a data URL
  return `url("data:image/svg+xml,${encodedSvg}")`;
};
