// quiz3.js  recreate the blender Quiz 3 in javascript with threejs
// created by Tim Hickey 11/22/2106

// first we declare the global variables that will be used
// in all of the methods in this program  (init, animate, and render)
var
    level='splash', // this determine which scene gets rendered!
    renderer,

    splashScene,splashCamera,  // scene and camera for opening credits

    successSound,  // sound when ball hits monkey!

    level1Scene,  level1Camera, level1Camera2,// scene and camera for level 1
    whichCamera = "1",

    avatarMesh, // a mesh of the robot-like Avatar from Quiz3.blend
    mushroomMesh, // we make copies of this later in the game

    score, // this keeps track of the number of mushroom's height

    textProps, // this holds the text properties for the scoreboard
    font, // this is the font used to create the text mesh objects
    textMesh, // this is the text mesh object equal to the score

    // these are the state variables which determine how the level1Camera moves
    angularVelocity, // how quickly it rotates when a left/right arrow is pressed
    angle, // the current direction of the level1Camera
    velocity, // the local velocity of the level1Camera
    direction, // the direction the level1Camera is pointing (as a vector)
    vdirection, // the direction in global coordinates,

    clock,  // a clock so we can calculate how long since the last redraw

    level2Scene,  level2Camera, level2Camera2,// scene and camera for level 2
    whichCamera2 = "1",

    avatarMesh2, // a mesh of the robot-like Avatar from Quiz3.blend
    mushroomMesh2, // we make copies of this later in the game

    score2, // this keeps track of the number of mushroom's height

    textProps2, // this holds the text properties for the scoreboard
    font2, // this is the font used to create the text mesh objects
    textMesh2, // this is the text mesh object equal to the score

    // these are the state variables which determine how the level1Camera moves
    angularVelocity2, // how quickly it rotates when a left/right arrow is pressed
    angle2, // the current direction of the level1Camera
    velocity2, // the local velocity of the level1Camera
    direction2, // the direction the level1Camera is pointing (as a vector)
    vdirection2, // the direction in global coordinates,

    clock2, // a clock so we can calculate how long since the last redraw
    winScene,winCamera,
    loseScene,loseCamera;

createRenderer(); // create the renderer and put it on the screen
initSplashScene();  // set up the Splash Scene (Press P to Play)
initLevel1();  // set up the main level1Scene (shooting balls at monkeys)
initLevel2();  // set up the main level2Scene (shooting balls at monkeys)
initWinScene();
initLoseScene();
animate();  // draw the current scene, update the model, update the Physics, and repeat


function createRenderer(){
  // create a renderer, using the GPU chip, and specify its size, in pixels, add to webpage
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.setClearColor(new THREE.Color(0x000fff, 0.4));

  // add the renderer screen to the body of the webpage
  document.body.appendChild(renderer.domElement);
}


function animate() {
    // this is the standard gameloop,
    // draw the scene and wait for the next request to repeat
    render();
    requestAnimationFrame(animate);
}

function render() {
  // draw the appropriate scene from the appropriate camera and update models if needed
  if (level=="splash"){
    renderer.render(splashScene,splashCamera);
  } else if (level=="win"){
    renderer.render(winScene,winCamera);
  } else if (level=="lose"){
    renderer.render(loseScene,loseCamera);
  } else if (level=="level1") {
    updateAvatar();  // move the level1Camera according to its linear and angular velocity
    if (whichCamera=="1") {
      renderer.render(level1Scene, level1Camera); // draw the level1Scene on the screen from the level1Camera
    } else {
      renderer.render(level1Scene, level1Camera2);
    }
    level1Scene.simulate();  // run the Physijs simulator
  } else {
    updateAvatar2();  // move the level1Camera according to its linear and angular velocity
    if (whichCamera2=="1") {
      renderer.render(level2Scene, level2Camera); // draw the level1Scene on the screen from the level1Camera
    } else {
      renderer.render(level2Scene, level2Camera2);
    }
    level2Scene.simulate();  // run the Physijs simulator
  }
}


function initSplashScene(){
  // this draws a simple scene of a textured box where the texture says
  // Quiz 3, Press P to play
  // when the user presses P it switches the level to level1
  splashScene = new THREE.Scene();
  splashCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  splashCamera.position.z = 0;
  splashCamera.position.x=0;
  splashCamera.position.y=200;
  splashCamera.lookAt({x:0,y:0,z:0})
  splashScene.add(splashCamera);
  var groundGeometry = new THREE.BoxGeometry(180,10,120);
  var groundMaterial= new THREE.MeshLambertMaterial({color: 0xffffff}); //THREE.MeshLambertMaterial({color: 0xffffff});
  // next we create a gold_leaf texture
  var texture = new THREE.TextureLoader().load( "textures/start1.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1,1 );
  //console.dir(texture);
  // now we attach the texture to the boxMaterial
  groundMaterial.map = texture;
  var groundMesh = new THREE.Mesh(groundGeometry,groundMaterial);
  splashScene.add(groundMesh);

  var pointLight = new THREE.PointLight(0xffffff,1,1000);
  pointLight.position.set(0,100,0);
  pointLight.castShadow=true;
  splashScene.add(pointLight);

  splashEventListener =
        function(event){
          //console.log("keydown");
          if (level != "splash") return;
          switch( event.keyCode ) {
            // you can lookup the key codes at this site http://keycode.info/

            case 80: /*P*/
              //document.removeEventListener('keydown',splashEventListener);
              level="level1";
              score=0;
              updateScore();
              //render();
              //animate();
              break;
              }
            };
  document.addEventListener('keydown',splashEventListener);

}

function initLevel1() {
    // set up the level1Scene
    initlevel1Scene();
    initlevel1Cameras();
    whichCamera = "1";

    initLights();
    loadFont(); // used to create text objects for the score

    // create the objects and add them to the level1Scene
    var groundMesh = createGroundMesh();
    var aquaboxMesh = createAquaBoxMesh();
    createMushroomMesh();// this is used to clone copies of mushroom later
    level1Scene.add(groundMesh);
    level1Scene.add(aquaboxMesh);
    createAvatarMesh();

    //createRenderer();
    initializeLevel1State(); // initial velocity and direction of the avatar

    createController();  // how to handle key press events, etc.

    createSound('/sounds/onlineMusic.mp3').play(); //add background music
    successSound = createSound('/sounds/good.wav'); // load the sound effect

    // start the monkeys marching across the level1Scene every 3 seconds
    setInterval(
      function(){launchMushroom();},
      3000);
}


function initializeLevel1State(){
  clock = new THREE.Clock();
  //console.log("created clock");
  velocity={x:0,y:0,z:0};
  // initialize the score and the initial direction of the level1Camera
  score=0;
  angle=0;
  angularVelocity=0;
  direction = new THREE.Vector3(0,0,-1);
}


function updateAvatar(){
  var delta=clock.getDelta();
  var speed = 100;
  var angularSpeed = 1;

  // here we update the current angle we are facing based on the
  // angular velocity (typically 1,0, or -1) and the speed of rotation.
  angle += angularSpeed*angularVelocity*delta;

  // here is where we convert from local coordinates (velocity.xyz)
  // to global coordinates (vdirections.xyz) using the angle we are facing
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  direction.x=-s;
  direction.y=0;
  direction.z=-c;
  vdirection={};
  vdirection.x = c*velocity.x + s*velocity.z;
  vdirection.y = velocity.y;
  vdirection.z = -s*velocity.x + c*velocity.z;

  // next we update the position of the avatar by
  // moving in the specified direction and speed over delta seconds
  avatarMesh.position.x += delta*vdirection.x*speed;
  avatarMesh.position.y += delta*vdirection.y*speed;
  avatarMesh.position.z += delta*vdirection.z*speed;

  // here we change the rotation of the avatar to look where we are going!
  avatarMesh.rotation.y=angle;

  // now we set the position and rotation of the camera
  // it will follow the avatar (200 units behind! and 100 units above)
  level1Camera.position.x = avatarMesh.position.x - 200*direction.x;
  level1Camera.position.y = avatarMesh.position.y - 200*direction.y + 100;
  level1Camera.position.z = avatarMesh.position.z - 200*direction.z;
  level1Camera.rotation.y = angle;
}


function initlevel1Scene(){
  // Configure Physi.js  so that we can use Physics in our game
  Physijs.scripts.worker = "libs/physijs_worker.js";
  Physijs.scripts.ammo = "ammo.js";

  // create a new Scene, similar to a Scene in Blender
  // but use Phyijs instead to handle Physics
  level1Scene = new Physijs.Scene();
  // set the gravity in the level1Scene
  level1Scene.setGravity(new THREE.Vector3(0,-10,0));
}


function initlevel1Cameras(){
  // create a level1Camera and set its parameters...
  level1Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  level1Camera.position.z = 500;
  level1Camera.position.x=0;
  level1Camera.position.y=200;
  level1Scene.add(level1Camera);
  //level1Camera.lookAt({x:0,y:0,z:0});

  level1Camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  level1Camera2.position.z = 0;
  level1Camera2.position.x=0;
  level1Camera2.position.y=2000;
  level1Camera2.lookAt({x:0,y:0,z:0})
  level1Scene.add(level1Camera2);
}


function initLights(){
  // NEW -- this is where we create a spot light, facing down
  var spotLight = new THREE.SpotLight(0xffff00);
  spotLight.position.set(0,400,0);
  spotLight.castShadow=true;
  spotLight.intensity=0.4;
  level1Scene.add(spotLight);

  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.castShadow = true;
  spotLight2.position.set(100,100,200);
  level1Scene.add(spotLight2);
}


function createGroundMesh(){
  // next we create the ground
  var groundGeometry = new THREE.BoxGeometry(1200,10,1200);
  var groundMaterial= new THREE.MeshPhongMaterial(); //THREE.MeshLambertMaterial({color: 0xffffff});
  var groundPhysMat =
    new Physijs.createMaterial(groundMaterial,0.9,0.3);
  // next we create a gold_leaf texture
  var texture = new THREE.TextureLoader().load( "textures/carpet1.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4,4 );
  //console.dir(texture);
  // now we attach the texture to the boxMaterial
  groundMaterial.map = texture;

  // the third parameter is the mass, and setting it to zero means it is a static object
  var groundMesh = new Physijs.BoxMesh(groundGeometry,groundPhysMat,0);

  groundMesh.receiveShadow=true;
  groundMesh.position.x = 200;
  return groundMesh;
}


function createAvatarMesh(){
  var cubeGeom = new THREE.BoxGeometry(1,1,1);
  var avatarMat= new THREE.MeshPhongMaterial({color:0x00ff00});
  var cubeMesh = new THREE.Mesh(cubeGeom,avatarMat);

  var loader = new THREE.JSONLoader();
  loader.load("models/Quiz3c.json", function(result){
    // result is a Geometry object, with bones!
    //console.dir(result);
    //result = cubeGeom;

    avatarMesh = new THREE.Mesh(result,avatarMat);
    avatarMesh.scale.set(10,10,10);// = {x:50,y:50,z:50};
    level1Scene.add(avatarMesh);
    console.dir(avatarMesh);
  })
}


function createMushroomMesh(){
  // create a global mushroomMesh object which can be cloned multiple times later in the game
  loader = new THREE.ColladaLoader();

  loader.load("models/mushroom.dae", function(result){
    mushroomMesh = result.scene.children[0].children[0].clone();
    // using console.dir(result) lets us see where the Mesh is in the scene
    // that's how I figured out to use results.scene.children[0].children[0]

    var mushroomMat= new THREE.MeshPhongMaterial({color:0xff0000}); //THREE.MeshLambertMaterial({color: 0xffffff});
    var mushroomPhysMat =
      new Physijs.createMaterial(mushroomMat,0.9,0.3);

    mushroomMesh = new Physijs.BoxMesh(mushroomMesh.geometry,mushroomPhysMat,1);
    mushroomMesh.scale.set(25,25,25);
    mushroomMesh.position.y=250;
    mushroomMesh.position.x=300;
    mushroomMesh.position.z= -200;
    mushroomMesh.rotateX(-Math.PI/2);
    mushroomMesh.castShadow=true;
    mushroomMesh.receiveShadow=true;
    mushroomMesh.name="mushroom";
  });
}


function launchMushroom(){
  // this creates and throws a monkey from the specified location (-300,50,-300)
  // at the specified velocity (200,0,0)
  throwMushroom(-300,50,-300,200,0,0);
}


function createAquaBoxMesh(){
  // create a box of mass 10 and position (100,100,0) and size 50
  // and have it fall ...
  var aquaboxGeom = new THREE.BoxGeometry(100,100,100);
  var aquaboxMat = new THREE.MeshPhongMaterial({color:0x00ffff});
  var aquaboxMesh = new THREE.Mesh(aquaboxGeom,aquaboxMat);
  aquaboxMesh.position.x=-300;
  aquaboxMesh.position.y=50;
  aquaboxMesh.position.z=-300;
  //scene.add(aquaboxMesh);
  return aquaboxMesh;
}


function createController(){
  // here is one way of adding interactivity to a page
  // we add an keypress event listener --

document.addEventListener('keydown',
      function(event){
        //console.log("keydown");
        switch( event.keyCode ) {
          // you can lookup the key codes at this site http://keycode.info/

          case 49: /*1*/
            whichCamera = '1'; //pressing 1 to set the camera as Level1Camera!
            break;

          case 50: /*2*/
              whichCamera = '2'; ////pressing 2 to set the camera as Level1Camera2!
              break;

          case 38: /*up*/
          case 87: /*W*/
              velocity.z=-1;
              //console.log("Wdown");
              break;

          case 37: /*left*/
              angularVelocity = 1;
              break;
          case 65: /*A*/
              velocity.x=-1;
              break;

          case 40: /*down*/
          case 83: /*S*/
              velocity.z=1;
              break;

          case 39: /*right*/
              angularVelocity = -1;
              break;
          case 68: /*D*/
              velocity.x=1;
              break;

          case 82: /*R*/
              velocity.y=1;
              break;

          case 70: /*F*/
              velocity.y=-1;
              break;

          case 81: /*Q*/
              level = "splash";
              break;

          case 84: /*T*/

            break;

          case 32: /* spacebar */
            shootSphere(300*direction.x,300*direction.y,300*direction.z);
            console.log(direction.x+" "+direction.y+" "+direction.z);

          break;

          case 90: /* Zkey */

            break;

        }

      }, false);

document.addEventListener('keyup',
          function(event){
            switch( event.keyCode ) {

                    case 38: /*up*/
                    case 87: /*W*/
                    velocity.z= 0;
                    //console.log("Wup");
                    break;

                    case 37: /*left*/
                    angularVelocity=0;
                    break;

                    case 65: /*A*/
                    velocity.x=0;
                    break;

                    case 40: /*down*/
                    case 83: /*S*/
                    velocity.z=0;
                    break;

                    case 39: /*right*/
                    angularVelocity = 0;
                    break;

                    case 68: /*D*/
                    velocity.x=0;
                    break;

                    case 82: /*R*/
                    velocity.y=0;
                    break;

                    case 70: /*F*/
                    velocity.y=0;
                    break;
            }
          }, false);
}


function loadFont() {
  // load the font and create the score object using that font
				var loader = new THREE.FontLoader();
				loader.load( 'libs/optimer_regular.typeface.json',
           function ( response ) {
             font = response;
             createTextMesh(0,font);
				   }
        );
}


function updateScore(){
  textMesh.geometry = new THREE.TextGeometry(score,textProps);
}


function createScore(){
  // this creates the score object but first loads the font if necessary...
  if (font) {
    createTextMesh(0,font);
  } else {
    var loader = new THREE.FontLoader();
    loader.load( 'libs/optimer_regular.typeface.json',
       function ( response ) {
         font = response;
         createTextMesh(0,font);
       }
    );
  }
}


function createTextMesh(val,font){
  textProps =
        {
            font: font,
            size: 100,
            height: 10,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 1
          };

  var textGeom = new THREE.TextGeometry(val,textProps);
  var textMat = new THREE.MeshPhongMaterial({color:0xfff000});
  //var textPhysMat = Physijs.createMaterial(textMat,0.2,0.9);
  //textMesh = new Physijs.SphereMesh(textGeom,textPhysMat);
  textMesh = new THREE.Mesh(textGeom,textMat);
  textMesh.position.set(0,100,-400);
  //  textMesh.angularVelocity.set(0,4,0);
  level1Scene.add(textMesh);
}


function shootSphere(vx,vy,vz){
  // throws a sphere in the specified direction/speed
  // first we create the ball as a Physijs object
  var ballGeom = new THREE.SphereGeometry(10,32,32);
  var ballMat = new THREE.MeshPhongMaterial({color:0x00ffff});
  var ballPhysMat = Physijs.createMaterial(ballMat,0.2,0.9);
  var ballMesh = new Physijs.SphereMesh(ballGeom,ballPhysMat);
  // all Physijs objects can have names
  ballMesh.name="ball";
  // then we add it to the level1Scene
  level1Scene.add(ballMesh);
  // this makes it disappear after 5000 milliseconds (5 seconds)
  setTimeout(function(){level1Scene.remove(ballMesh)},5000);
  // now we set its launching position to be near the level1Camera
  var cp = avatarMesh.position; //level1Camera.position;
  ballMesh.position.set(cp.x,cp.y+60,cp.z);
  // changing position manually means we have to tell Physijs
  // not to try to use its usual methods to figure out where
  // the ballMesh will be
  ballMesh.__dirtyPosition=true;
  ballMesh.setLinearVelocity(new THREE.Vector3(vx,vy,vz));

  ballMesh.addEventListener('collision',
      function(other_object,relative_velocity,relative_rotation,contact_normal){
        //console.dir([other_object,relative_velocity,relative_rotation,contact_normal]);
        if (other_object.name=="mushroom"){
          level1Scene.remove(ballMesh);
          //teleport(myMushroomMesh,0,-200,0);
        }
  });
  return;
}


function throwMushroom(px,py,pz, vx,vy,vz){
  // throws a sphere in the specified direction/speed


  var myMushroomMesh = mushroomMesh.clone();
  //myMushroom.rotateY(Math.PI);

  // all Physijs objects can have names
  myMushroomMesh.name="mushroom";
  //console.dir(ballMesh);
  // then we add it to the level1Scene
  level1Scene.add(myMushroomMesh);

  // this makes it disappear after 10000 milliseconds (10 seconds)
  setTimeout(function(){level1Scene.remove(myMushroomMesh)},10000);

  // now we set its launching position to be near the level1Camera
  var cp = level1Camera.position;
  myMushroomMesh.position.set(px,py,pz);
  // changing position manually means we have to tell Physijs
  // not to try to use its usual methods to figure out where
  // the ballMesh will be
  myMushroomMesh.__dirtyPosition=true;
  myMushroomMesh.setLinearVelocity(new THREE.Vector3(vx,vy,vz));
  myMushroomMesh.setAngularVelocity(new THREE.Vector3(0,4,0));

  myMushroomMesh.addEventListener('collision',
      function(other_object,relative_velocity,relative_rotation,contact_normal){
        //console.dir([other_object,relative_velocity,relative_rotation,contact_normal]);
        if (other_object.name=="ball"){
          score += 1;
          updateScore();
          successSound.play();
          level1Scene.remove(myMushroomMesh);
          if (score>=5) level="level2"
          //teleport(myMushroomMesh,0,-200,0);
        }
  });
}


function teleport(mesh,x,y,z){
    mesh.position.set(x,y,z);
    mesh.setLinearVelocity(new THREE.Vector3(0,0,0));
    mesh.setAngularVelocity(new THREE.Vector3(0,0,0));
    mesh.__dirtyPosition = true;
    mesh.__dirtyRotation = true;
}


function createSound(path) {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', path);
  return audioElement;
}


function updateAvatar2(){
  var delta=clock.getDelta();
  var speed = 100;
  var angularSpeed = 1;

  // here we update the current angle we are facing based on the
  // angular velocity (typically 1,0, or -1) and the speed of rotation.
  angle2 += angularSpeed*angularVelocity2*delta;

  // here is where we convert from local coordinates (velocity.xyz)
  // to global coordinates (vdirections.xyz) using the angle we are facing
  var c = Math.cos(angle2);
  var s = Math.sin(angle2);
  direction2.x=-s;
  direction2.y=0;
  direction2.z=-c;
  vdirection2={};
  vdirection2.x = c*velocity2.x + s*velocity2.z;
  vdirection2.y = velocity2.y;
  vdirection2.z = -s*velocity2.x + c*velocity2.z;
//console.log(direction2.x+" "+direction2.y+" "+direction2.z);

  // next we update the position of the avatar by
  // moving in the specified direction2 and speed over delta seconds
  avatarMesh2.position.x += delta*vdirection2.x*speed;
  avatarMesh2.position.y += delta*vdirection2.y*speed;
  avatarMesh2.position.z += delta*vdirection2.z*speed;

  // here we change the rotation of the avatar to look where we are going!
  avatarMesh2.rotation.y=angle2;

  // now we set the position and rotation of the camera
  // it will follow the avatar (200 units behind! and 100 units above)
  level2Camera.position.x = avatarMesh2.position.x - 200*direction2.x;
  level2Camera.position.y = avatarMesh2.position.y - 200*direction2.y + 100;
  level2Camera.position.z = avatarMesh2.position.z - 200*direction2.z;
  level2Camera.rotation.y = angle2;
}


function initLevel2() {
    // set up the level2Scene
    initlevel2Scene();
    initlevel2Cameras();
    whichCamera2 = "1";

    initLights2();
    loadFont2(); // used to create text objects for the score

    // create the objects and add them to the level1Scene
    var groundMesh = createGroundMesh2();
    var aquaboxMesh = createAquaBoxMesh();
    var backgroundMesh = createBackgroundMesh();
    level2Scene.add(backgroundMesh);

    createMushroomMesh2();// this is used to clone copies of mushroom later
    level2Scene.add(groundMesh);
    level2Scene.add(aquaboxMesh);
    createAvatarMesh2();

    //createRenderer();
    initializeLevel2State(); // initial velocity and direction of the avatar

    createController2();  // how to handle key press events, etc.

    createSound('/sounds/onlineMusic.mp3').play(); //add background music
    successSound = createSound('/sounds/good.wav'); // load the sound effect

    // start the monkeys marching across the level2Scene every 9 seconds
    setInterval(
      function(){launchMushroom2();},
      9000);

    groundMesh.addEventListener('collision',
      function(other_object,relative_velocity,relative_rotation,contact_normal){
            //console.dir([other_object,relative_velocity,relative_rotation,contact_normal]);
          if (other_object.name=="mushroom2"){
              level="lose";
          }
    });
}


function initlevel2Scene(){
  // Configure Physi.js  so that we can use Physics in our game
  Physijs.scripts.worker = "libs/physijs_worker.js";
  Physijs.scripts.ammo = "ammo.js";

  // create a new Scene, similar to a Scene in Blender
  // but use Phyijs instead to handle Physics
  level2Scene = new Physijs.Scene();
  // set the gravity in the level1Scene
  level2Scene.setGravity(new THREE.Vector3(0,-10,0));
}


function initlevel2Cameras(){
  // create a level1Camera and set its parameters...
  level2Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  level2Camera.position.z = 400;
  level2Camera.position.x=0;
  level2Camera.position.y=50;
  level2Scene.add(level2Camera);
  level2Camera.lookAt({x:0,y:20,z:0});

  level2Camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  level2Camera2.position.z = 0;
  level2Camera2.position.x=0;
  level2Camera2.position.y=2000;
  level2Camera2.lookAt({x:0,y:0,z:0})
  level2Scene.add(level2Camera2);
}


function initLights2(){
  // NEW -- this is where we create a spot light, facing down
  var spotLight = new THREE.SpotLight(0xffff00);
  spotLight.position.set(0,400,0);
  spotLight.castShadow=true;
  spotLight.intensity=0.4;
  level2Scene.add(spotLight);

  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.castShadow = true;
  spotLight2.position.set(100,100,200);
  level2Scene.add(spotLight2);
}


function loadFont2() {
  // load the font and create the score object using that font
				var loader = new THREE.FontLoader();
				loader.load( 'libs/optimer_regular.typeface.json',
           function ( response ) {
             font2 = response;
             createTextMesh2(0,font2);
				   }
        );
}


function createGroundMesh2(){
  // next we create the ground
  var groundGeometry = new THREE.BoxGeometry(1200,10,1200);
  var groundMaterial= new THREE.MeshPhongMaterial(); //THREE.MeshLambertMaterial({color: 0xffffff});
  var groundPhysMat =
    new Physijs.createMaterial(groundMaterial,0.9,0.3);
  // next we create a gold_leaf texture
  var texture = new THREE.TextureLoader().load( "textures/cherry_light.jpg" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 4,4 );
  //console.dir(texture);
  // now we attach the texture to the boxMaterial
  groundMaterial.map = texture;

  // the third parameter is the mass, and setting it to zero means it is a static object
  var groundMesh = new Physijs.BoxMesh(groundGeometry,groundPhysMat,0);

  groundMesh.receiveShadow=true;
  groundMesh.position.x = 200;
  return groundMesh;
}


function createBackgroundMesh(){
  // next we create the ground
  var backgroundGeometry = new THREE.BoxGeometry(1000,1000,10);
  var backgroundMaterial= new THREE.MeshPhongMaterial(); //THREE.MeshLambertMaterial({color: 0xffffff});
  var backgroundPhysMat =
    new Physijs.createMaterial(backgroundMaterial,0.9,0.3);
  // next we create a gold_leaf texture
  var texture2 = new THREE.TextureLoader().load( "textures/cutey.jpg" );
  texture2.wrapS = THREE.RepeatWrapping;
  texture2.wrapT = THREE.RepeatWrapping;
  texture2.repeat.set( 1,1 );
  // now we attach the texture to the boxMaterial
  backgroundMaterial.map = texture2;

  // the third parameter is the mass, and setting it to zero means it is a static object
  var backgroundMesh = new Physijs.BoxMesh(backgroundGeometry,backgroundPhysMat,0);

  backgroundMesh.receiveShadow=true;
  backgroundMesh.position.y = 500;
  backgroundMesh.position.z = -500;
  return backgroundMesh;
}


function createMushroomMesh2(){
  // create a global mushroomMesh object which can be cloned multiple times later in the game
  loader = new THREE.ColladaLoader();

  loader.load("models/mushroom.dae", function(result){
    mushroomMesh2 = result.scene.children[0].children[0].clone();
    // using console.dir(result) lets us see where the Mesh is in the scene
    // that's how I figured out to use results.scene.children[0].children[0]

    var mushroomMat= new THREE.MeshPhongMaterial({color:0xff0000}); //THREE.MeshLambertMaterial({color: 0xffffff});
    var mushroomPhysMat =
      new Physijs.createMaterial(mushroomMat,0.9,0.3);

    mushroomMesh2 = new Physijs.BoxMesh(mushroomMesh2.geometry,mushroomPhysMat,1);
    mushroomMesh2.scale.set(25,25,25);
    mushroomMesh2.position.y=250;
    mushroomMesh2.position.x=300;
    mushroomMesh2.position.z= -200;
    mushroomMesh2.rotateX(-Math.PI/2);
    mushroomMesh2.castShadow=true;
    mushroomMesh2.receiveShadow=true;
    mushroomMesh2.name="mushroom2";
  });
}


function createAvatarMesh2(){
  var cubeGeom2 = new THREE.BoxGeometry(1,1,1);
  var avatarMat2= new THREE.MeshPhongMaterial({color:0xfff000});
  var cubeMesh2 = new THREE.Mesh(cubeGeom2,avatarMat2);

  var loader = new THREE.JSONLoader();
  loader.load("models/pitcher.json", function(result){
    // result is a Geometry object, with bones!
    //console.dir(result);
    //result = cubeGeom;

    avatarMesh2 = new THREE.Mesh(result,avatarMat2);
    avatarMesh2.rotateX(-Math.PI/2);
    avatarMesh2.position.y = 60;
    avatarMesh2.scale.set(25,25,25);
    level2Scene.add(avatarMesh2);
  })
}


function initializeLevel2State(){
  clock2 = new THREE.Clock();
  //console.log("created clock");
  velocity2={x:0,y:0,z:0};
  // initialize the score and the initial direction of the level1Camera
  score2=0;
  angle2=0;
  angularVelocity2=0;
  direction2 = new THREE.Vector3(0,0,-1);
}


function createController2(){
  // here is one way of adding interactivity to a page
  // we add an keypress event listener --

document.addEventListener('keydown',
      function(event){
        //console.log("keydown");
        switch( event.keyCode ) {
          // you can lookup the key codes at this site http://keycode.info/

          case 49: /*1*/
            whichCamera2 = '1'; //pressing 1 to set the camera as Level1Camera!
            break;

          case 50: /*2*/
              whichCamera2 = '2'; ////pressing 2 to set the camera as Level1Camera2!
              break;

          case 38: /*up*/
          case 87: /*W*/
              velocity2.z=-1;
              //console.log("Wdown");
              break;

          case 37: /*left*/
              angularVelocity2 = 1;
              break;
          case 65: /*A*/
              velocity2.x=-1;
              break;

          case 40: /*down*/
          case 83: /*S*/
              velocity2.z=1;
              break;

          case 39: /*right*/
              angularVelocity2 = -1;
              break;
          case 68: /*D*/
              velocity2.x=1;
              break;

          case 82: /*R*/
              velocity2.y=1;
              break;

          case 70: /*F*/
              velocity2.y=-1;
              break;

          case 81: /*Q*/
              level = "splash";
              break;

          case 84: /*T*/
            //teleport(myMushroomMesh2,0,-200,0);
            break;

          case 32: /* spacebar */
            shootSphere2(300*direction2.x,300*direction2.y,300*direction2.z);
            console.log(direction2.x+" "+direction2.y+" "+direction2.z);

          break;

          case 90: /* Zkey */

            break;
        }
      }, false);

document.addEventListener('keyup',
          function(event){
            switch( event.keyCode ) {

                    case 38: /*up*/
                    case 87: /*W*/
                    velocity2.z= 0;
                    //console.log("Wup");
                    break;

                    case 37: /*left*/
                    angularVelocity2=0;
                    break;

                    case 65: /*A*/
                    velocity2.x=0;
                    break;

                    case 40: /*down*/
                    case 83: /*S*/
                    velocity2.z=0;
                    break;

                    case 39: /*right*/
                    angularVelocity2 = 0;
                    break;

                    case 68: /*D*/
                    velocity2.x=0;
                    break;

                    case 82: /*R*/
                    velocity2.y=0;
                    break;

                    case 70: /*F*/
                    velocity2.y=0;
                    break;
            }
          }, false);
}


function shootSphere2(vx,vy,vz){
  // throws a sphere in the specified direction/speed
  // first we create the ball as a Physijs object
  var ballGeom = new THREE.SphereGeometry(10,32,32);
  var ballMat = new THREE.MeshPhongMaterial({color:0x000fff});
  var ballPhysMat = Physijs.createMaterial(ballMat,0.2,0.9);
  var ballMesh2 = new Physijs.SphereMesh(ballGeom,ballPhysMat);
  // all Physijs objects can have names
  ballMesh2.name="ball2";
  // then we add it to the level1Scene
  level2Scene.add(ballMesh2);
  // this makes it disappear after 5000 milliseconds (5 seconds)
  setTimeout(function(){level2Scene.remove(ballMesh2)},5000);
  // now we set its launching position to be near the level1Camera
  var cp = avatarMesh2.position; //level1Camera.position;
  ballMesh2.position.set(cp.x+25,cp.y-25,cp.z);
  // changing position manually means we have to tell Physijs
  // not to try to use its usual methods to figure out where
  // the ballMesh will be
  ballMesh2.__dirtyPosition=true;
  ballMesh2.setLinearVelocity(new THREE.Vector3(vx,vy,vz));

  ballMesh2.addEventListener('collision',
      function(other_object,relative_velocity,relative_rotation,contact_normal){
        //console.dir([other_object,relative_velocity,relative_rotation,contact_normal]);
        if (other_object.name=="mushroom2"){
          level2Scene.remove(ballMesh2);
        }
  });
  return;
}


function launchMushroom2(){
  // this creates and throws a monkey from the specified location (-300,50,-300)
  // at the specified velocity (200,0,0)
  throwMushroom2(-300,50,-300,200,0,0);
}


function throwMushroom2(px,py,pz, vx,vy,vz){
  // throws a mushroom2 in the specified direction/speed
  var myMushroomMesh2 = mushroomMesh2.clone();
  myMushroomMesh2.rotateY(Math.PI/2);

  // all Physijs objects can have names
  myMushroomMesh2.name="mushroom2";
  //console.dir(ballMesh);
  // then we add it to the level2Scene
  level2Scene.add(myMushroomMesh2);

  // this makes it disappear after 10000 milliseconds (10 seconds)
  setTimeout(function(){level2Scene.remove(myMushroomMesh2)},10000);

  // now we set its launching position to be near the level1Camera
  var cp = level2Camera.position;
  myMushroomMesh2.position.set(px,py,pz);
  // changing position manually means we have to tell Physijs
  // not to try to use its usual methods to figure out where
  // the ballMesh will be
  myMushroomMesh2.__dirtyPosition=true;
  myMushroomMesh2.setLinearVelocity(new THREE.Vector3(vx,vy,vz));
  myMushroomMesh2.setAngularVelocity(new THREE.Vector3(0,4,0));

  myMushroomMesh2.addEventListener('collision',
      function(other_object,relative_velocity,relative_rotation,contact_normal){
        //console.dir([other_object,relative_velocity,relative_rotation,contact_normal]);
        if (other_object.name=="ball2"){
          score2 += 1;
          updateScore2();
          successSound.play();
          level2Scene.remove(myMushroomMesh2);
          if (score2>=5) level="win"
          //teleport(myMushroomMesh2,0,-200,0);
        }
  });
}


function updateScore2(){
  textMesh2.geometry = new THREE.TextGeometry(score2,textProps2);
}


function createTextMesh2(val,font2){
  textProps2 =
        {
            font: font2,
            size: 100,
            height: 10,
            curveSegments: 4,
            bevelThickness: 2,
            bevelSize: 1.5,
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 1
          };

  var textGeom2 = new THREE.TextGeometry(val,textProps2);
  var textMat2 = new THREE.MeshPhongMaterial({color:0x00ff00});
  //var textPhysMat = Physijs.createMaterial(textMat,0.2,0.9);
  //textMesh = new Physijs.SphereMesh(textGeom,textPhysMat);
  textMesh2 = new THREE.Mesh(textGeom2,textMat2);
  textMesh2.position.set(0,100,-400);
  //  textMesh.angularVelocity.set(0,4,0);
  level2Scene.add(textMesh2);
}


function initWinScene(){
  // this draws a simple scene of a textured box where the texture says
  // You win, Press R to replay
  // when the user presses R it switches the level to level1
  winScene = new THREE.Scene();
  winCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  winCamera.position.z = 0;
  winCamera.position.x=0;
  winCamera.position.y=200;
  winCamera.lookAt({x:0,y:0,z:0})
  winScene.add(winCamera);
  var groundGeometry = new THREE.BoxGeometry(180,10,120);
  var groundMaterial= new THREE.MeshPhongMaterial({color:0xffffff}); //THREE.MeshLambertMaterial({color: 0xffffff});
  // next we create a gold_leaf texture
  var texture = new THREE.TextureLoader().load( "textures/win2.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1,1 );
  //console.dir(texture);
  // now we attach the texture to the boxMaterial
  groundMaterial.map = texture;
  var groundMesh = new THREE.Mesh(groundGeometry,groundMaterial);
  winScene.add(groundMesh);

  var pointLight = new THREE.PointLight(0xffffff,1,1000);
  pointLight.position.set(0,100,0);
  pointLight.castShadow=true;
  winScene.add(pointLight);

  winEventListener =
        function(event){
          //console.log("keydown");
          if (level != "win") return;
          switch( event.keyCode ) {
            // you can lookup the key codes at this site http://keycode.info/

            case 82: /*R*/
              //document.removeEventListener('keydown',splashEventListener);
              level="splash";
              score=0;
              updateScore();
              score2=0;
              updateScore2();
              break;
              }
            };
  document.addEventListener('keydown',winEventListener);
}


function initLoseScene(){
  // this draws a simple scene of a textured box where the texture says
  // You Lose, Press P to replay
  // when the user presses R it switches the level to level1
  loseScene = new THREE.Scene();
  loseCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  loseCamera.position.z = 0;
  loseCamera.position.x=0;
  loseCamera.position.y=200;
  loseCamera.lookAt({x:0,y:0,z:0})
  loseScene.add(loseCamera);
  var groundGeometry = new THREE.BoxGeometry(180,10,120);
  var groundMaterial= new THREE.MeshLambertMaterial({color: 0xffffff});
  // next we create a gold_leaf texture
  var texture = new THREE.TextureLoader().load( "textures/lose1.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1,1 );
  //console.dir(texture);
  // now we attach the texture to the boxMaterial
  groundMaterial.map = texture;
  var groundMesh = new THREE.Mesh(groundGeometry,groundMaterial);
  loseScene.add(groundMesh);

  var pointLight = new THREE.PointLight(0xffffff,1,1000);
  pointLight.position.set(0,100,0);
  pointLight.castShadow=true;
  loseScene.add(pointLight);

  loseEventListener =
        function(event){
          //console.log("keydown");
          if (level != "lose") return;
          switch( event.keyCode ) {
            // you can lookup the key codes at this site http://keycode.info/

            case 82: /*R*/
              //document.removeEventListener('keydown',splashEventListener);
              level="splash";
              score=0;
              updateScore();
              score2=0;
              updateScore2();
              }
            };
  document.addEventListener('keydown',loseEventListener);
}
