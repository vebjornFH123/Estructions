"use strict";

export const io = {
  title: "OLSEROD_v3",
  totalSteps: 4, //Total Amount of Steps in animation.
  totalTime: 5.5, //in seconds
  stepsTime: [2, 0.5, 1, 2], //Time for each step in Seconds.
  stepTxt: [
    "Introduksjon",
    "step 1",
    "step 2",
    "step 3",
    "step 4",
    "step 5",
    "step 6",
    "step 7",
    "step 8",
    "step 9",
    "step 10",
  ],
  workers: 2,
  stepTool: [
    ["Hand"],
    [],
    ["Hand"],
    ["Allen Wrench"],
    ["Hand"],
    ["Hand"],
    ["Screw Driver"],
    ["Hand"],
    ["Hand"],
    ["Screw Driver"],
  ],
  stepScrew: [
    [{ screwType: "Plastic Screw", screwNr: "2", screwSerialNr: "10091763" }],
    [],
    [{ screwType: "Plastic Screw", screwNr: "2", screwSerialNr: "195312" }],
    [{ screwType: "Plastic Screw", screwNr: "2", screwSerialNr: "131996" }],
    [],
    [],
    [{ screwType: "Plastic Screw", screwNr: "4", screwSerialNr: "10092086" }],
    [
      { screwType: "Plastic Screw", screwNr: "12", screwSerialNr: "10005471" },
      { screwType: "Plastic Screw", screwNr: "4", screwSerialNr: "10005485" },
    ],
    [{ screwType: "Plastic Screw", screwNr: "4", screwSerialNr: "194765" }],
  ],
  specialMat: [
    {
      //Special Matierial
      material1: [
        //Special Material Object
        false, //If needed in 3D Object
        "ObjectName", //Name of Object that needs special material
        "Glass", //Type of Material
        "rgb(0,0,0)", //Color of Material in rgb as string.]
      ],
    },
  ],
};
