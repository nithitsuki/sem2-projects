import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // Import GLTFLoader directly

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
renderer.setAnimationLoop(animate)
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
var carModel;
const loader = new GLTFLoader();
loader.load('static/3D-Models/rolls-royce_ghost.glb', (gltf) => {
  carModel = gltf.scene;
  console.log('Model loaded:', carModel); // Debug log
  carModel.scale.set(1, 1, 1); // Adjust scale
  carModel.rotation.x += 0.1;
  carModel.rotation.y += 1;
  carModel.rotation.z += 1;
  scene.add(carModel);
}, undefined, (error) => {
  console.error('Error loading model:', error); 
});

camera.position.z = 5;

// function animate() {
// 	renderer.render( scene, camera );
// }

function animate() {
    requestAnimationFrame(animate);
    if (carModel) {
        carModel.rotation.y += 0.005; // Increment rotation around the Y-axis
    }    
    renderer.render(scene, camera);
}

  // Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });