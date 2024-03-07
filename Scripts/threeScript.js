"use strict";

import * as THREE from "../three_js/three.module.js";
import { OrbitControls } from "../three_js/OrbitControls.js";
import * as dat from "../three_js/dat.gui.module.js";
import { GLTFLoader } from "../three_js/GLTFLoader.js";

//Main Object with information about the instructions.
// io = Instruction Object
import { io } from "./instructionObject.js";

const cvs = document.getElementById("cvs");

let orbitLock = true;

// use reduce() method to find the sum
let totalTime = io.stepsTime.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, 0);

const totalSteps = io.stepsTime.length;

let currentStep = 0;
let globalStep = 0;

let clips;
let clipDuration = 0;

let canvasHeight = 0.7;

const markers = io.stepsTime;

const sliderCont = document.querySelector(".anim-nav-slider-cont");

const lineContainer = document.querySelector(".line");

let currentLeft = 0;

let language = "norwegian";

let settingsActive = false;

// Create child elements with variable width
for (let i = 0; i < totalSteps; i++) {
  const child = document.createElement("div");
  child.classList.add("marker");
  child.id = "marker" + i;

  console.log(child.id);

  // Calculate the width as a percentage
  const widthPercentage = (io.stepsTime[i] / totalTime) * 100;
  child.style.width = `${widthPercentage}%`;

  if (child.id == "marker0") {
    child.style.border = "none";
    child.style.borderTopLeftRadius = "15px";
    child.style.borderBottomLeftRadius = "15px";
  } else if (child.id == `marker${totalSteps - 1}`) {
    child.style.borderTopRightRadius = "15px";
    child.style.borderBottomRightRadius = "15px";
  }

  lineContainer.appendChild(child);
}

function updateMarkerStyle(sliderVal) {
  console.log(sliderVal);

  for (let i = 0; i < totalSteps; i++) {
    const currentMarker = document.getElementById(`marker${i}`);
    currentMarker.style.backgroundColor = "#00ff0000";
  }

  const currentMarker = document.getElementById(`marker${sliderVal}`);
  currentMarker.style.backgroundColor = "#00ff0039";
}

updateMarkerStyle(0);

function updateStepNumber(sliderVal) {
  // Calculate the slider value that corresponds to the total time
  const totalTimeSliderVal = (totalTime / totalTime) * 100;

  // Calculate the corresponding step based on the totalTimeSliderVal

  let cumulativeTime = 0;

  for (let i = 0; i < io.stepsTime.length; i++) {
    cumulativeTime += io.stepsTime[i];
    const stepSliderVal = (cumulativeTime / totalTime) * totalTimeSliderVal;

    if (sliderVal <= stepSliderVal) {
      currentStep = i;
      break;
    }
  }
  // console.log("Current Step:", currentStep);
  sliderStepNmbr.innerText = currentStep;
}

let controls;

//THREE

let scene = null,
  renderer = null,
  camera = null;
let aspectRatio = window.innerWidth / (window.innerHeight * canvasHeight);

function Init3DWorld() {
  // Set up your world scene
  scene = new THREE.Scene();
  scene.background = null;
  //scene.fog = new THREE.Fog(0xa0a0a0, 10, 1400);

  // Set up your scene light
  AddLights();

  // CAMERA

  // Perspective Camera
  camera = new THREE.PerspectiveCamera(48, aspectRatio, 0.01, 10000);

  //Ortographic Camera
  //camera = new THREE.OrthographicCamera( 10 / - 2, 10 / 2, 10 / 2, 10 / - 2, 0, 200 );

  camera.position.set(-10, 4, 10);
  camera.lookAt(0, 0, 0);

  // Setup your scene ground
  addVisualHelpers();

  // Setup your scene models
  LoadModels(scene);

  // Set up your world renderer
  const world = {
    canvas: cvs,
    antialias: true,
  };
  renderer = new THREE.WebGLRenderer(world, { alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(aspectRatio);
  renderer.setSize(window.innerWidth, window.innerHeight * canvasHeight);
  //renderer.shadowMap.enabled = true;

  //CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.target.set(0, 0, 0);
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.maxDistance = 50;

  controls.update();

  requestAnimationFrame(UpdateFrame);
}

function UpdateFrame() {
  renderer.render(scene, camera);
  requestAnimationFrame(UpdateFrame);
}

function AddLights() {
  //Directional Light 1 - Main Light
  let light = new THREE.DirectionalLight("#ffffff", 0.6);
  light.position.set(3, 4, 5);
  scene.add(light);

  //scene.add(new THREE.DirectionalLightHelper(light, 10, "#ff4400"));

  //Directional Light 2 - Secondary Light
  light = new THREE.DirectionalLight("#ffffff", 0.4);
  light.position.set(-3, -4, -5);
  scene.add(light);

  //scene.add(new THREE.DirectionalLightHelper(light, 10, "#ff4400"));

  //Ambient Light
  light = new THREE.AmbientLight(0x404040, 2.5); // soft white light
  scene.add(light);
}

function addVisualHelpers() {
  const grid = new THREE.GridHelper(100, 25, "#000000", "#9a9a9a");
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  //scene.add(grid);
  //scene.add(new THREE.AxesHelper(200))
}

function LoadModels() {
  const loader = new GLTFLoader();
  loader.load(`${io.title}.gltf`, GLTFLoadDone);
}

let mixer;

function GLTFLoadDone(GLTFStructure) {
  GLTFStructure.scene.traverse(GLTFEachObject);
  scene.add(GLTFStructure.scene);
  setInterval(AnimateObjects, 41, 66);

  // Animation System
  mixer = new THREE.AnimationMixer(GLTFStructure.scene);
  clips = GLTFStructure.animations;
  const clip = THREE.AnimationClip;

  clips.forEach(function (clip) {
    //mixer.clipAction( clip ).play();

    if (clipDuration < clip.duration) {
      clipDuration = clip.duration;
    }

    // console.log(clips);

    // console.log(clipDuration);
  });
}

// Function to update animation based on slider value
function updateAnimation(sliderVal, dragging) {
  const clip = THREE.AnimationClip;

  // Calculate the time within the animation based on slider value
  let currentTime = (sliderVal / 100) * clipDuration;

  clips.forEach(function (clip) {
    if (dragging) {
      mixer.clipAction(clip).play();
      mixer.timeScale = 1;
      mixer.clipAction(clip).time = currentTime;
    } else {
      mixer.clipAction(clip).paused = true;
    }
  });

  //console.log("Current Time: " + currentTime.toFixed(2));
}

//Running through each object in scene.
function GLTFEachObject(aObject) {
  //console.log(aObject);
  /* Adding cast shadow to objects
        if (aObject.isMesh) {
          aObject.castShadow = true;
          aObject.receiveShadow = true;
        } else if (aObject.isGroup) {
          aObject.castShadow = true;
        } */
}
/* --------------- SLIDER FUNCTION ------------*/

const widthElem = document.querySelector(".slider-width");
const sliderHead = document.querySelector(".slider-head");
const sliderStepNmbr = document.getElementById("sliderStepNmbr");

let sliderVal = 0;
let dragging = false;
let lastMouseX = 0; // Track the last recorded mouse X position

function moveHandler(event) {
  const currentX = event.clientX - sliderCont.getBoundingClientRect().left;
  const widthPercentage = (currentX / sliderCont.clientWidth) * 100;
  const clampedPercentage = Math.min(100, Math.max(0, widthPercentage));
  updateProgress(clampedPercentage);
  lastMouseX = currentX; // Update last recorded mouse X position
}

sliderCont.addEventListener("mousedown", function (event) {
  dragging = true;

  event.preventDefault();

  const initialX = event.clientX - sliderCont.getBoundingClientRect().left;
  lastMouseX = initialX;

  document.addEventListener("mousemove", moveHandler);
  document.addEventListener("mouseup", upHandler);
  document.addEventListener("mousemove", trackMouseMovement); // Add the new event listener

  moveHandler(event); // Call the moveHandler function immediately

  function upHandler() {
    dragging = false;
    updateAnimation(sliderVal, dragging);
    if (widthElem.style.width == "100%") {
      sliderStepNmbr.innerText = totalSteps;
    }
    updateMarkerStyle(globalStep);
    console.log("Global step: " + globalStep);
    console.log("Current step: " + currentStep);
    sliderStepNmbr.classList.remove("step-nmbr-drag");
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", upHandler);
    document.removeEventListener("mousemove", trackMouseMovement);
  }
});

function trackMouseMovement(event) {
  const currentX = event.clientX - sliderCont.getBoundingClientRect().left;
  if (!dragging || currentX !== lastMouseX) {
    dragging = false;
    updateMarkerStyle(sliderVal);
    updateAnimation(sliderVal, dragging);
    updateStepNumber(sliderVal);

    document.removeEventListener("mousemove", trackMouseMovement);
  }
  updateStep(sliderVal);
}

/* --------------- SLIDER CODE END ------------*/

/* --------------- BUTTON FUNCTION ------------*/

// Get references to the buttons
const previousButton = document.getElementById("previousBtn");
const nextButton = document.getElementById("nextBtn");

nextButton.addEventListener("click", nextStep);

function nextStep() {
  let i = sliderVal;

  let myInterval;

  if (globalStep < totalSteps) {
    globalStep++;
    updateStepTxt(globalStep);
    displayToolsAndScrews(globalStep);
    updateMarkerStyle(globalStep);
    myInterval = setInterval(goToNextStep, 20.56);
  }

  cvs.style.filter = "";

  function goToNextStep() {
    i += 0.25;

    //console.log(i);

    updateProgress(i, false);

    if (currentStep == globalStep || i >= 100) {
      clearInterval(myInterval);
      updateAnimation(sliderVal, false);
      sliderStepNmbr.classList.remove("step-nmbr-drag");
      sliderStepNmbr.innerText = globalStep;
    }
  }
}

const nextStepFunc = nextStep;

// Add event listeners to the buttons
previousButton.addEventListener("click", function () {
  prevStep(false);
});

function prevStep(quick) {
  let i = sliderVal;
  let myInterval;
  let speed = 20.56;

  if (quick === true) {
    speed = 5;
    //cvs.style.filter = "blur(2px)";
  } else {
    cvs.style.filter = "";
  }

  if (globalStep >= 1) {
    globalStep--;
    updateStepTxt(globalStep);
    updateMarkerStyle(globalStep);
    displayToolsAndScrews(globalStep);
    console.log("Global step: " + globalStep);
    myInterval = setInterval(goToPrevStep, speed);
  }

  function goToPrevStep() {
    i -= 0.25;
    updateProgress(i, false);

    if (currentStep < globalStep || i / 10 < 0) {
      clearInterval(myInterval);
      updateAnimation(sliderVal, false);
      sliderStepNmbr.classList.remove("step-nmbr-drag");
      sliderStepNmbr.innerText = globalStep;

      if (quick) {
        setTimeout(function () {
          nextStepFunc();
        }, 100);
      }
    }
  }
}

/* --------------- BUTTON CODE END ------------*/

/* ------------ SWIPING FUNCTION --------------- */

let touchStartX = 0;
let codeExecuted = false; // Flag to track code execution

document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  codeExecuted = false; // Reset the flag when a new swipe starts
});

document.addEventListener("touchmove", (e) => {
  if (orbitLock) {
    if (!codeExecuted) {
      // Check if code hasn't been executed yet for this swipe
      const touchCurrentX = e.touches[0].clientX;
      const deltaX = touchCurrentX - touchStartX;

      if (deltaX > 200) {
        //console.log('Swiped right');
        let i = sliderVal;
        let myInterval;

        if (globalStep >= 1) {
          globalStep--;
          myInterval = setInterval(goToPrevStep, 20.56);
        }

        function goToPrevStep() {
          i -= 0.25;
          updateProgress(i, false);

          if (currentStep < globalStep || i / 10 < 0) {
            clearInterval(myInterval);
            updateAnimation(sliderVal, false);
            sliderStepNmbr.classList.remove("step-nmbr-drag");
            sliderStepNmbr.innerText = globalStep;
          }
        }
        codeExecuted = true; // Set the flag to prevent repeated execution
      } else if (deltaX < -200) {
        //console.log('Swiped left');
        let i = sliderVal;

        let myInterval;

        if (globalStep < totalSteps) {
          globalStep++;
          myInterval = setInterval(goToNextStep, 20.56);
        }

        function goToNextStep() {
          i += 0.25;

          updateProgress(i, false);

          if (currentStep == globalStep || widthElem.style.width == "100%") {
            clearInterval(myInterval);
            updateAnimation(sliderVal, false);
            sliderStepNmbr.classList.remove("step-nmbr-drag");
            sliderStepNmbr.innerText = globalStep;
          }
        }
        codeExecuted = true; // Set the flag to prevent repeated execution
      }
    }
  }
});

/* ------------ SWIPING CODE END --------------- */

function updateProgress(value, btn) {
  widthElem.style.width = value + "%";
  sliderHead.style.marginLeft = value + "%";
  sliderVal = value;
  updateStepNumber(sliderVal);
  updateAnimation(sliderVal, true);
  if (btn !== false) {
    sliderStepNmbr.classList.add("step-nmbr-drag");
  }
}

//Function for animation
const clock = new THREE.Clock();
function AnimateObjects() {
  //Global Clock
  mixer.update(clock.getDelta());
}

//On window resize function
function onWindowResize() {
  camera.aspect = window.innerWidth / (window.innerHeight * canvasHeight);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight * canvasHeight);
}

window.addEventListener("resize", onWindowResize, false);

Init3DWorld(cvs);

const interactCont = document.querySelector(".interact-cont");

interactCont.style.height = window.innerHeight - cvs.innerHeight + "px";
//console.log(cvs.offsetHeight);

/*------- Menu buttons start ---------*/
const menuCont = document.querySelector(".menu-cont");

/*------ Settings Start ------- */
const settingButton = document.querySelector(".gear-btn");
const settingsCont = document.querySelector(".settings-cont");
const settingsBg = document.querySelector(".settings-bg");
const exitSettingsBtn = document.querySelector(".exit-settings-btn");

settingButton.addEventListener("mousedown", () => {
  if (!settingsActive) {
    settingsCont.style.display = "block";
    exitSettingsBtn.style.display = "block";
    settingsBg.style.display = "block";
    setTimeout(function () {
      settingsCont.style.opacity = 1;
      exitSettingsBtn.style.opacity = 1;
      settingsBg.style.transform =
        "scale(" + (window.innerWidth * window.innerHeight) / 7000 + ")";
    }, 10);
    menuCont.style.opacity = 0;
    settingsBg.style.zIndex = 10;
    settingsActive = true;
  }
});

exitSettingsBtn.addEventListener("click", function () {
  console.log(settingsActive);
  if (settingsActive) {
    settingsCont.style.opacity = 0;
    exitSettingsBtn.style.opacity = 0;
    settingsBg.style.zIndex = 8;
    settingsActive = false;
    settingsBg.style.transform = "scale(1)";
    setTimeout(function () {
      menuCont.style.opacity = 1;
      settingsCont.style.display = "none";
      exitSettingsBtn.style.display = "none";
      settingsBg.style.display = "none";
    }, 1000);
  }
});

//Language Selection

const langNorwegian = document.getElementById("norwegian");
const langEnglish = document.getElementById("english");

//Setting global language on startup.
langNorwegian.classList.toggle("active");

langNorwegian.addEventListener("click", function () {
  if (language != "norwegian") {
    const prevLang = document.getElementById(language);
    prevLang.classList.toggle("active");
    language = "norwegian";
    langNorwegian.classList.toggle("active");
  }
});

langEnglish.addEventListener("click", function () {
  if (language != "english") {
    const prevLang = document.getElementById(language);
    prevLang.classList.toggle("active");
    language = "english";
    langEnglish.classList.toggle("active");
  }
});

/*------ Settings End ------- */

let cameraButton = document.querySelector(".camera-btn");
let cameraImg = document.querySelector(".lock-img");
cameraButton.addEventListener("mousedown", () => {
  if (orbitLock == true) {
    cameraImg.src = `./btn-imgs/unlocked-img.svg`;
    orbitLock = false;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.update();
  } else {
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.update();
    cameraImg.src = `./btn-imgs/locked-img.svg`;
    orbitLock = true;
  }
});
let replayButton = document.querySelector(".replay-btn");
let replayImg = document.querySelector(".replay-img");
replayButton.addEventListener("mousedown", () => {
  if (globalStep != 0) {
    //Styling Code
    replayImg.style.transition = "all 1s";
    replayImg.style.transform = "rotate(-360deg)";
    setTimeout(() => {
      replayImg.style.transition = "none";
      replayImg.style.transform = "rotate(0deg)";
    }, 1000);
    //Step Code
    prevStep(true);
  }
});

let fullScreenButton = document.querySelector(".fullScreen-btn");
let fullScreenImg = document.querySelector(".fullScreen-img");
let fullScreen = false;
fullScreenButton.addEventListener("mousedown", () => {
  if (fullScreen == false) {
    fullScreenImg.src = `./btn-imgs/fullScreen.svg`;
    fullScreen = true;
    interactCont.style.bottom = -(interactCont.offsetHeight + 5) + "px";
    canvasHeight = 1;
    menuCont.style.bottom = "2%";
    settingsBg.style.bottom = "2.5%";
    fullScreenButton.style.filter = "invert(1)";
    onWindowResize();
  } else {
    fullScreenImg.src = `./btn-imgs/SmallScreen.svg`;
    fullScreen = false;
    interactCont.style.bottom = 0;
    canvasHeight = 0.7;
    menuCont.style.bottom = "33%";
    settingsBg.style.bottom = "33.5%";
    fullScreenButton.style.filter = "";
    onWindowResize();
  }
});
/*------- Menu buttons end ---------*/

/*------- info-section start  ---------*/
//time
const timeButton = document.querySelectorAll(".time-info");
const timeInfoBox = document.querySelectorAll(".time-box");
//people
const peopleButton = document.querySelectorAll(".people-info");
const peopleInfoBox = document.querySelectorAll(".people-box");
//tool
const toolContMain = document.querySelector(".container-tool");
// screw
const screwContMain = document.querySelector(".container-screw");

/*------- display the tools for each step start  ---------*/
function displayToolsAndScrews() {
  toolContMain.innerHTML = "";
  screwContMain.innerHTML = "";
  const currentToolStep = io.stepTool.filter((_, i) => i == globalStep);
  const currentScrewStep = io.stepScrew.filter((_, i) => i == globalStep);
  if (currentToolStep.length > 0) {
    currentToolStep[0].forEach((tool) => {
      const htmlTool = ` 
      <div class="tool-cont">
      <div id="${tool}box" class="tool-box">${tool}</div>  
      <div id="${tool}btn" class="tool-info">
        <img src="btn-imgs/${tool}.svg" class="tool-img">
      </div>
      </div>
    `;
      toolContMain.insertAdjacentHTML("afterbegin", htmlTool);
    });
  }
  if (currentScrewStep.length > 0) {
    currentScrewStep[0].forEach((screw) => {
      console.log(screw);
      const htmlScrew = ` 
  <div class="screw-cont">
  <div id="${screw.screwSerialNr}box" class="screw-box">
  <img src="screw-img/${screw.screwSerialNr}.png"class="screw-picture"/>
  <div class="screw-separator" ></div>
  <div class="screw-content">
  ${screw.screwType} x ${screw.screwNr}
  <p class="screwSNr">${screw.screwSerialNr}</p>
  </div>
  </div>
  <div id="${screw.screwSerialNr}btn" class="screw-info">
    <img src="btn-imgs/${screw.screwType}.svg" class="screw-img">
  </div>
</div>
  `;
      screwContMain.insertAdjacentHTML("afterbegin", htmlScrew);
    });
  }

  // updating the toolButton and toolInfoBox every time this function runs
  const toolButton = document.querySelectorAll(".tool-info");
  const toolInfoBox = document.querySelectorAll(".tool-box");

  // updating the toolButton and toolInfoBox every time this function runs
  const screwButton = document.querySelectorAll(".screw-info");
  const screwInfoBox = document.querySelectorAll(".screw-box");

  //calling the onHover function to update it
  toolScrewButtons(toolButton, toolInfoBox);
  toolScrewButtons(screwButton, screwInfoBox);
}
displayToolsAndScrews();

/*------- display the tools for each step end  ---------*/

/*------- info buttons hover start  ---------*/
function toolScrewButtons(btn, box) {
  btn.forEach((btn, i) => {
    const btnId = document.getElementById(box[i].id.replace("box", "btn"));
    btn.addEventListener("mouseover", () => {
      if (!box[i].classList.contains("active")) {
        box[i].classList.add("active");
      }
    });
    btn.addEventListener("mouseout", () => {
      if (
        box[i].classList.contains("active") &&
        !btnId.classList.contains("active")
      ) {
        box[i].classList.remove("active");
      }
    });

    btn.addEventListener(`mousedown`, () => {
      if (!btnId.classList.contains("active")) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
        if (mobileAndTabletCheck()) {
          box[i].classList.remove("active");
        }
      }
    });
  });
}

/*------- info buttons hover start  ---------*/
function infoButtons(btn, box) {
  let infoClicked = false;
  btn.forEach((btn, i) => {
    btn.addEventListener("mouseover", () => {
      console.log(btn);
      if (infoClicked == false) {
        box[i].classList.toggle("active");
      }
    });
    btn.addEventListener("mouseout", () => {
      if (infoClicked == false) {
        box[i].classList.remove("active");
      }
    });

    btn.addEventListener(`mousedown`, () => {
      if (infoClicked == false) {
        btn.classList.toggle("active");
        infoClicked = true;
      } else {
        btn.classList.toggle("active");
        infoClicked = false;
        if (mobileAndTabletCheck()) {
          box[i].classList.remove("active");
        }
      }
    });
  });
}
infoButtons(timeButton, timeInfoBox);
infoButtons(peopleButton, peopleInfoBox);

/*------- info buttons hover end ---------*/

/*------- info-section end  ---------*/

//Mobile Check

const infoCont = document.querySelector(".info-cont");

window.mobileAndTabletCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const stepTxt = document.getElementById("stepTxt");

function updateStepTxt(currentStep) {
  if (currentStep === undefined) {
    stepTxt.innerText = io.stepTxt[globalStep];
  } else {
    //console.log(currentStep);
    stepTxt.innerText = io.stepTxt[currentStep];
  }
}

//Mobile = true, Pc = false.
if (window.mobileAndTabletCheck()) {
  stepTxt.style.fontSize = "3rem";
  infoCont.style.transform = "scale(2.2)";
  infoCont.style.transformOrigin = "top right";
  menuCont.style.transform = "scale(1.8)";
  menuCont.style.transformOrigin = "bottom right";
} else {
}

const workers = document.getElementById("workers");
workers.innerText = io.workers;

const peopleBox = document.querySelector(".people-box");
peopleBox.innerText = "Anbefalt " + io.workers + " personer";

// Function to update and display the current step
function updateStep(sliderVal) {
  // Get the total length of all steps directly inline
  const totalStepLength = io.stepsTime.reduce((total, time) => total + time, 0);

  // Get the current value of the slider directly inline
  const sliderValue = sliderVal;

  // Calculate the current step based on the slider value and step lengths
  let currentPosition = 0;

  for (let i = 0; i < io.stepsTime.length; i++) {
    const stepLength = (io.stepsTime[i] / totalStepLength) * 100;

    if (
      sliderValue >= currentPosition &&
      sliderValue <= currentPosition + stepLength
    ) {
      globalStep = i;
      break;
    }

    currentPosition += stepLength;
  }
  updateStepTxt(currentStep);
}
