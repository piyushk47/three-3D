import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const premGenerator = new THREE.PMREMGenerator(renderer);
premGenerator.compileEquirectangularShader();

// Load HDRI environment map
let model;
new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/goegap_road_1k.hdr', function(texture) {
    const envMap = premGenerator.fromEquirectangular(texture).texture;
    // scene.background = envMap;
    scene.environment = envMap;
    texture.dispose();
    premGenerator.dispose();

    // Load the model after the HDRI is loaded
    const loader = new GLTFLoader();
  
    loader.load(
      '/DamagedHelmet.gltf',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened', error);
      }
    );
  });

window.addEventListener('mousemove', (e) => {
  if(model){
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.12);
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.12);
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.5,
      ease: "power2.out"
    });
  }
});

function animate() {
  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
