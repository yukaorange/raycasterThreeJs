import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import * as dat from "lil-gui";
// import { init } from "browser-sync";

/**
 *2022/12/13
 *レイキャスティングでマウス検知がうまくいかない。
 *原因特定できないので、一旦中断
 */

export function webgl() {
  init();
  async function init() {
    // Scene
    const scene = new THREE.Scene();

    // debugger
    const gui = new dat.GUI({ width: 300 });

    // Canvas
    const canvas = document.querySelector(".webgl");

    // sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = sizes.height / 2 / Math.tan(fovRad);
    const camera = new THREE.PerspectiveCamera(
      fov,
      sizes.width / sizes.height,
      0.1,
      10000
    );
    camera.position.z = dist;
    scene.add(camera);

    gui.add(camera.position, "x").min(-50).max(500);
    gui.add(camera.position, "y").min(-2000).max(0);

    // Controls
    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // resize
    canvas.addEventListener("resize", () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // mosuewheel
    window.addEventListener("wheel", onMouseWheel);
    let y = 0;
    let position = 0;
    function onMouseWheel(event) {
      y = event.deltaY * 0.07;
    }

    // mousemove
    let mouseX = 0;
    let mouseY = 0;
    let objs = 0;
    window.addEventListener("mousemove", (event) => {
      mouseX = (event.clientX / sizes.width) * 2 - 1;
      mouseY = -(event.clientY / sizes.height) * 2 + 1;
      const mouse = new THREE.Vector3(mouseX, mouseY, 1);
      //mouseの座標系をオブジェクト座標系に変換
      mouse.unproject(camera);
      // 始点、向きベクトルを渡してレイを作成
      // Raycastとは、ある場所から透明な光線ベクトルを放ち、光線に当たったオブジェクトの情報を得る機能のこと。
      // .sub():ベクトルの引き算
      // .normalize():単位ベクトル作成。
      const raycaster = new THREE.Raycaster(
        camera.position,
        mouse.sub(camera.position).normalize()
      );

      // 交差判定
      // 引数は取得対象となるMeshの配列を渡す。以下はシーン内のすべてのオブジェクトを対象に。
      objs = raycaster.intersectObjects(scene.children);
      console.log(objs);
    });

    // imageArray
    const imageArray = [];
    imageArray.push("./images/life.jpg");
    imageArray.push("./images/note.jpg");
    imageArray.push("./images/wave.jpg");
    imageArray.push("./images/syber.jpg");

    // 画像ローダー
    async function textureLoader(url) {
      const texLoader = new THREE.TextureLoader();
      const texture = await texLoader.loadAsync(url);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.MirroredRepeatWrapping;
      return texture;
    }

    //メッシュ作成関数
    async function createMesh(url) {
      const geometry = new THREE.PlaneGeometry(
        sizes.width / 3,
        sizes.height / 3,
        100,
        100
      );
      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: {
            value: 0,
          },
          uTexture: {
            value: await textureLoader(url),
          },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);

      return mesh;
    }

    //乱数生成関数
    const getRandomInt = (min, max) => {
      const int = Math.floor(Math.random() * (max + 1 - min)) + min;
      return int;
    };

    //時間取得
    const clock = new THREE.Clock();

    //生成 & アニメーション開始
    const meshArray = [];
    await Mesh();
    async function Mesh() {
      for (let i = 0; i < 2; i++) {
        // Mesh
        const mesh = await createMesh(imageArray[i]);
        mesh.position.set(getRandomInt(1, 120), (sizes.height / 2) * -i);
        scene.add(mesh);
        meshArray.push(mesh);
      }
    }
    animate();
    //loopアニメーション
    function animate() {
      position += y;
      camera.position.y = -position;
      y *= 0.9;
      //時間経過
      // const elapsedTime = clock.getElapsedTime();
      // meshArray.forEach((mesh) => {
      //   mesh.material.uniforms.uTime.value = elapsedTime;
      // });

      //raycasting
      // ホバーしているオブジェクトが0個以上あるか判定。
      if (objs.length > 0) {
        console.log(objs[0]);
        // ホバーしたオブジェクトを配列で得る。
        // オブジェクトを回転する
        // objs[0].object.rotation.y += 0.02;
        // objs[0].object.rotation.x += 0.02;
        objs[0].object.rotation.z += 0.02;
      }

      // controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }
  }
}
