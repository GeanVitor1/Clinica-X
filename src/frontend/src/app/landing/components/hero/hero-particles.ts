import * as THREE from 'three';

export class HeroParticles {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private animationId = 0;
  private mouse = new THREE.Vector2(9999, 9999);

  constructor(private canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 25;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: '#14b8a6',
      size: 0.3,
      transparent: true,
      opacity: 0.15,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
    });

    this.animate();
  }

  private animate() {
    this.particles.rotation.y += 0.001;
    const pos = (this.particles.geometry.attributes['position'] as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const dx = pos[i] - this.mouse.x * 10;
      const dy = pos[i + 1] - this.mouse.y * 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        pos[i] += dx * 0.02;
        pos[i + 1] += dy * 0.02;
      }
    }
    (this.particles.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  resize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
}
