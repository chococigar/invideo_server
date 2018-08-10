global.XMLHttpRequest = require("xhr2");

var posenet = require('@tensorflow-models/posenet');
const tf = require('@tensorflow/tfjs');

const {Image, createCanvas} = require('canvas');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"

//import * as posenet from '@tensorflow-models/posenet';
const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;

async function estimatePoseOnImage(imageElement) {
  // load the posenet model from a checkpoint
  const net = await posenet.load(1.01);
  console.log("line 19")

  const pose = await net.estimateSinglePose(imageElement, imageScaleFactor, flipHorizontal, outputStride);

  return pose;
}

var x = dom.window.document.createElement("video");
x.setAttribute("src", "./squatlegraise.mp4");
x.setAttribute("width", "304");
x.setAttribute("height", "228");
x.setAttribute("alt", "squats");


const videoElement = x//document.getElementById('cat');

const pose = estimatePoseOnImage(videoElement);

console.log(pose);