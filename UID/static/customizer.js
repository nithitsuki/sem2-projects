import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader directly
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"; // Import RGBELoader for HDRI
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // Import OrbitControls
let carModel;

const cars = {
  ferrariF12: {
    path: "static/3D-Models/2013_ferrari_f12_berlinetta.glb",
    exterior_name:
      "bodyKit0_Paint_Geo_lodA_Ferrari_F12berlinetta_2014Paint_Material_0",
    scale: 100,
    offset: { x: 0, y: 0, z: 0 }, // Offset values for Ferrari F12
  },
  porsche918: {
    path: "static/3D-Models/2015_porsche_918_spyder.glb",
    exterior_name:
      "pKit1_Paint_Geo_lodA_Kit1_Paint_Geo_lodA_Porsche_918SpyderRewardRecycled_2015Paint_Material_pPorsche_918SpyderRewardRecycled_2015Paint_Material1_0",
    scale: 100,
    offset: { x: 0, y: 0, z: 0 }, // Offset values for Porsche 918
  },
  naranHyperCoupe: {
    path: "static/3D-Models/2020_naran_hyper_coupe.glb",
    exterior_name:
      "Naran_Hyper_Coupe_carobjcarpaint_chassis_UV2_Untitled_030_Default_Carpaint_0",
    scale: 100,
    offset: { x: 0, y: 0, z: 0 }, // Offset values for Naran Hyper Coupe
  },
  astonMartinVulcan: {
    path: "static/3D-Models/aston_martin_vulcan.glb",
    exterior_name: "LOD_A_HOOD_mm_ext001_CAR_PAINT_0",
    scale: 1,
    offset: { x: 0, y: 0, z: 0 }, // Offset values for Aston Martin Vulcan
  },
  mazdaMiata: {
    path: "static/3D-Models/mazda_miata_mx-5.glb",
    exterior_name: "RLA_miata_headlight_R_popup_RRpbrPaintPrimary_0",
    scale: 1,
    offset: { x: 0, y: -0.1, z: 0 }, // Offset values for Mazda Miata
  },
  rollsRoyceGhost: {
    path: "static/3D-Models/rolls-royce_ghost.glb",
    exterior_name: {
      1: "rrghost_body_rrghost_paint_0",
      2: "rrghost_fender_R_b_rrghost_paint_0",
    },
    scale: 1,
    offset: { x: 0, y: 0, z: 0 }, // Offset values for Rolls Royce Ghost
  },
};

// Ferrari_F12berlinetta_2014Paint_Material
let current_car = cars.porsche918;

function loadCarModel(car, scene, loader) {
  if (!car || !car.path) {
    console.error("Invalid car object or missing 'path' property.");
    return;
  }
  // Load the model using the provided loader
  loader.load(
    car.path, // Path to the GLB file
    (gltf) => {
      carModel = gltf.scene;
      console.log("Model loaded:", carModel);
      carModel.scale.set(car.scale, car.scale, car.scale); // Adjust scale
      carModel.position.set(car.offset.x, car.offset.y, car.offset.z); // Adjust position
      scene.add(carModel);
    },
    undefined, // Progress callback (not used here)
    (error) => {
      console.error("Error loading model:", error);
    }
  );
}
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
rgbeLoader.load("static/HDR environment/creepy_bathroom_4k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping; // Use reflection mapping
  scene.environment = texture; // Apply the environment map to the scene
});

let garageModel;
const loader = new GLTFLoader();
loader.load(
  "static/3D-Models/parking_garage.glb", // Replace with your garage model path
  (gltf) => {
    garageModel = gltf.scene;
    console.log("Garage model loaded:", garageModel); // Debug log
    garageModel.position.set(0, 1.8, 0);
    garageModel.scale.set(1, 1, 1); // Adjust scale if needed
    scene.add(garageModel);
  },
  undefined,
  (error) => {
    console.error("Error loading garage model:", error);
  }
);

// Load the car model
loadCarModel(current_car, scene, loader);

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
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function changeCarColor(car, carModel, color) {
  if (!car || !carModel) {
    console.error("Invalid car object or car model is not loaded.");
    return;
  }

  // Ensure the color is a valid THREE.Color
  const newColor = new THREE.Color(color);

  // Traverse the car model to find matching materials
  carModel.traverse((child) => {
    // Check if the child is a mesh and matches the exterior name
    if (child.isMesh && matchesExteriorName(child.name, car.exterior_name)) {
      // Update the material color
      if (child.material) {
        child.material.color.set(newColor); // Apply the new color
        child.material.needsUpdate = true; // Ensure the material updates in the renderer
      }
    }
  });
}

/**
 * Helper function to check if a name matches the exterior_name property.
 *
 * @param {string} name - The name of the mesh to check.
 * @param {string|Object} exteriorName - The exterior_name property from the car object.
 * @returns {boolean} - Whether the name matches the exterior_name.
 */
function matchesExteriorName(name, exteriorName) {
  if (typeof exteriorName === "string") {
    // Single exterior name
    return name === exteriorName;
  } else if (typeof exteriorName === "object") {
    // Multiple exterior names (e.g., { 1: "name1", 2: "name2" })
    return Object.values(exteriorName).some((exterior) => name === exterior);
  }
  return false;
}

const colorPicker = new iro.ColorPicker("#colorPickerContainer", {
  width: 200,
  color: "#ffffff", // Default color
  layout: [
    { component: iro.ui.Wheel },
    // { component: iro.ui.Slider, options: { sliderType: 'alpha' } },
    { component: iro.ui.Slider, options: { sliderType: "saturation" } },
    { component: iro.ui.Slider, options: { sliderType: "value" } },
  ],
});

// Event Listener for Color Change
colorPicker.on("color:change", (color) => {
  const hexColor = color.hexString;

  // Ensure the car model is loaded before attempting to change its color
  if (!carModel) {
    console.error("Car model is not loaded yet.");
    return;
  }

  // Call the changeCarColor function with the correct arguments
  changeCarColor(current_car, carModel, hexColor);
});

// Scene, Camera, Renderer, etc. remain unchanged...

// Function to unload the current car model
function unloadCarModel(scene, carModel) {
  if (carModel) {
    // Traverse the car model and dispose of its resources
    carModel.traverse((child) => {
      if (child.isMesh) {
        // Dispose of geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose of material(s)
        if (child.material) {
          if (Array.isArray(child.material)) {
            // Handle multi-materials
            child.material.forEach((material) => {
              if (material.map) material.map.dispose(); // Dispose of textures
              material.dispose(); // Dispose of material
            });
          } else {
            if (child.material.map) child.material.map.dispose(); // Dispose of texture
            child.material.dispose(); // Dispose of material
          }
        }
      }
    });

    // Remove the car model from the scene
    scene.remove(carModel);

    // Clear the reference to the car model
    carModel = null;

    console.log("Car model unloaded and resources disposed.");
  }
}

document.getElementById("carSelector").addEventListener("change", (event) => {
  const selectedCarKey = event.target.value; // Get the selected car key
  const selectedCar = cars[selectedCarKey]; // Get the corresponding car object
  if (!selectedCar) {
    console.error("Invalid car selection.");
    return;
  }
  unloadCarModel(scene, carModel);
  loadCarModel(selectedCar, scene, loader);
  current_car = selectedCar;
  console.log(`Switched to car: ${selectedCarKey}`);
});