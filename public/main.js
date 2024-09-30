// import our three.js reference
import * as THREE from 'https://unpkg.com/three/build/three.module.js'
import { Pane } from 'https://unpkg.com/tweakpane'

const app = {
  init() {
    const instructions = document.getElementById('instructions');
    const closeButton = document.getElementById('close-btn');

    closeButton.addEventListener('click', () => {
      instructions.style.display = 'none';
    });

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.z = 50

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(this.renderer.domElement)

    this.createLights()

    this.knotParams = {
      radius: 10,
      tube: 0.5,
      tubularSegments: 128,
      radialSegments: 16,
      p: 5,
      q: 21,
    }

    this.materialParams = {
      color: '#ff0000',
    }

    this.rotationSpeed = {
      x: 0.025,
      y: 0.025,
    }

    this.knot = this.createKnot()

    this.render = this.render.bind(this)
    this.render()

    this.pane = new Pane()
    this.addControls()
  },

  createLights() {
    const pointLight = new THREE.DirectionalLight(0xcccccc, 2)
    this.scene.add(pointLight)
  },

  createKnot() {
    const knotGeometry = new THREE.TorusKnotGeometry(
      this.knotParams.radius,
      this.knotParams.tube,
      this.knotParams.tubularSegments,
      this.knotParams.radialSegments,
      this.knotParams.p,
      this.knotParams.q
    )
    const mat = new THREE.MeshPhongMaterial({
      color: this.materialParams.color,
    })
    const knot = new THREE.Mesh(knotGeometry, mat)
    this.scene.add(knot)
    return knot
  },

  updateKnot() {
    this.scene.remove(this.knot)
    this.knot = this.createKnot()
  },

  addControls() {
    this.pane.addBinding(this.knotParams, 'radius', { min: 1, max: 20, step: 0.1, label: 'Knot Radius' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.knotParams, 'tube', { min: 0.1, max: 5, step: 0.1, label: 'Tube Thickness' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.knotParams, 'tubularSegments', { min: 10, max: 200, step: 1, label: 'Tubular Segments' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.knotParams, 'radialSegments', { min: 2, max: 64, step: 1, label: 'Radial Segments' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.knotParams, 'p', { min: 1, max: 10, step: 1, label: 'Number of Twists' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.knotParams, 'q', { min: 1, max: 30, step: 1, label: 'Number of Loops' }).on('change', () => {
      this.updateKnot()
    })

    this.pane.addBinding(this.materialParams, 'color', { label: 'Color' }).on('change', (ev) => {
      this.knot.material.color.set(ev.value)
    })

    this.pane.addBinding(this.rotationSpeed, 'x', { min: 0, max: 0.1, step: 0.001, label: 'Rotation Speed X' })
    this.pane.addBinding(this.rotationSpeed, 'y', { min: 0, max: 0.1, step: 0.001, label: 'Rotation Speed Y' })
  },

  render() {
    this.knot.rotation.x += this.rotationSpeed.x
    this.knot.rotation.y += this.rotationSpeed.y

    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.render)
  }
}
window.onload = () => app.init()
