
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Globe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Three.js variables
    let camera: THREE.OrthographicCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let mesh: THREE.Mesh;
    let mesh2: THREE.Mesh;
    
    // Initialize the scene
    const init = () => {
      // Create renderer
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(300, 300); // Set initial size
      renderer.setPixelRatio(2);
      
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }
      
      // Create scene
      scene = new THREE.Scene();
      
      // Create camera
      camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -10, 10);
      
      // Load textures
      const textureLoader = new THREE.TextureLoader();
      
      // Create spheres with textures
      const texture = textureLoader.load('https://s33.postimg.cc/zaty10vot/out.png');
      const texture2 = textureLoader.load('https://s33.postimg.cc/x69kzy9hp/middle.png');
      
      // Replace "ROUND" with "JOBS" by creating a custom texture
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 120px Arial';
        context.textAlign = 'center';
        context.fillStyle = 'white';
        context.fillText('JOBS', canvas.width / 2, canvas.height / 2);
        
        const jobsTexture = new THREE.CanvasTexture(canvas);
        texture2.image = canvas;
        texture2.needsUpdate = true;
      }
      
      // Create materials
      const material = new THREE.MeshBasicMaterial({
        map: texture
      });
      
      const material2 = new THREE.MeshBasicMaterial({
        map: texture2
      });
      
      material.transparent = true;
      material2.transparent = true;
      
      // Create geometries and meshes
      const geometry = new THREE.SphereGeometry(9.98, 50, 50);
      mesh = new THREE.Mesh(geometry, material);
      
      const geometry2 = new THREE.SphereGeometry(10, 50, 50);
      mesh2 = new THREE.Mesh(geometry2, material2);
      
      // Set initial rotation
      mesh2.rotation.y = -Math.PI / 2;
      mesh.rotation.y = -Math.PI / 2;
      
      // Add to scene
      scene.add(mesh2);
      scene.add(mesh);
    };
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      render();
    };
    
    // Render function
    const render = () => {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
        if (mesh2) mesh2.rotation.y -= 0.0009;
        if (mesh) mesh.rotation.y += 0.0009;
      }
    };
    
    // Mouse/touch movement handler
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      const isTouchEvent = 'touches' in event;
      const pageX = isTouchEvent ? (event as TouchEvent).touches[0].pageX : (event as MouseEvent).pageX;
      const pageY = isTouchEvent ? (event as TouchEvent).touches[0].pageY : (event as MouseEvent).pageY;
      
      const pos = (((360 * (pageX - window.innerWidth / 2) / window.innerWidth) * Math.PI / 180) / 2) - Math.PI / 2;
      const pos2 = ((360 * (pageY - window.innerHeight / 8) / window.innerHeight) * Math.PI / 180) - Math.PI / 2;
      
      if (mesh2) {
        mesh2.rotation.y = -pos - Math.PI;
        mesh2.rotation.x = pos2 / 10;
      }
      
      if (mesh) {
        mesh.rotation.y = pos;
        mesh.rotation.x = pos2 / 10;
      }
    };
    
    // Initialize
    init();
    animate();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchstart', handleMouseMove, { passive: false });
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      
      if (mesh2) {
        mesh2.geometry.dispose();
        (mesh2.material as THREE.Material).dispose();
      }
      
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center"
      style={{
        touchAction: 'pan-left, pan-right, pan-up, pan-down',
      }}
    >
      <style jsx>{`
        div :global(canvas) {
          width: 300px !important;
          height: 300px !important;
          clip-path: circle(calc(50% - 1px));
        }
      `}</style>
    </div>
  );
};

export default Globe3D;
