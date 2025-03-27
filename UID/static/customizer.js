import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader directly
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"; // Import RGBELoader for HDRI
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // Import OrbitControls

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Set a sky blue background color
document.body.appendChild(renderer.domElement);

// Add OrbitControls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth movement

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright directional light
directionalLight.position.set(0, 3, 0); // Position the light
scene.add(directionalLight);
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 1); // Size of the helper
scene.add(lightHelper);

// Load HDRI Environment Map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('static/HDR environment/creepy_bathroom_4k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping; // Use reflection mapping
  scene.environment = texture; // Apply the environment map to the scene
});

let garageModel;
const loader = new GLTFLoader();
loader.load(
  'static/3D-Models/parking_garage.glb', // Replace with your garage model path
  (gltf) => {
    garageModel = gltf.scene;
    console.log('Garage model loaded:', garageModel); // Debug log
    garageModel.position.set(0,1.8,0)
    garageModel.scale.set(1, 1, 1); // Adjust scale if needed
    scene.add(garageModel);
  },
  undefined,
  (error) => {
    console.error('Error loading garage model:', error);
  }
);

// Load the car model
let carModel;
// const loader = new GLTFLoader();
loader.load(
  'static/3D-Models/mazda_miata_mx-5.glb',
  (gltf) => {
    carModel = gltf.scene;
    console.log('Model loaded:', carModel); // Debug log
    carModel.scale.set(1, 1, 1); // Adjust scale
    carModel.position.set(0,-0.1,0)
    scene.add(carModel);
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
  }
  
);

// Camera Position
camera.position.set(1.5, 1.5, 2.2); // Adjust camera position

const gridHelper = new THREE.GridHelper(10, 10); // Size: 10 units, Divisions: 10
gridHelper.position.y = -0.01; // Slightly below the ground plane to avoid z-fighting
scene.add(gridHelper);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update OrbitControls
  renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if(carModel){changeCarColor(0x0000ff);}
});

function changeCarColor(color) {
  if (carModel) {
    carModel.traverse((child) => {
      // Check if the child is a mesh and matches the exterior name
      if (child.isMesh && child.name === 'RLA_miata_headlight_R_popup_RRpbrPaintPrimary_0') {
        // Update the material color
        if (child.material) {
          child.material.color.set(color); // Apply the new color
          child.material.needsUpdate = true; // Ensure the material updates in the renderer
        }
      }
    });
  }
}
const colorPicker = new iro.ColorPicker('#colorPickerContainer', {
  width: 300,
  color: '#ff0000', // Default color
  layout: [
    { component: iro.ui.Wheel },
    // { component: iro.ui.Slider, options: { sliderType: 'alpha' } },
    { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
    { component: iro.ui.Slider, options: { sliderType: 'value' } },

  ],
});

// Event Listener for Color Change
colorPicker.on('color:change', (color) => {
  const hexColor = color.hexString;
  changeCarColor(hexColor)
});