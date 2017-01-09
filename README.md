This repository stores all the require files for my first 3D game written in 
THREE.js.


Description: The game contains two playable levels. When the player shoots 5 
mushrooms, level 1 automatically switches to level 2. In level 2, if the player 
shoots 5 mushrooms before any mushroom fall on the ground, the scene will 
switch to a win screen. Otherwise, the scene will switch to a lose screen.


How to setup this game?
1) Please download all the files in this repository in your local computer. 

2) Then open a terminal window (or a powershell window) and change directory. 
to be inside the folder that stores these files.

3) Then startup a python webserver on port 3000 in that folder by typing 
	python -m SimpleHTTPServer 3000
if you have python2, but if you have python3 use
	python3 -m http.server 3000
in the terminal (or the powershell window).

4) If you were successful and can view the files through Googlechrome at 
	http://localhost:3000 

5) click Rong1st_THREEJS_Game.html
Then you can start to play!


control keys for the game:
1) press P to play.

2) up arrow or w key for moving forward;
   down arrow or s key for moving backward;
   left arrow or a key for turning left;
   right arrow or d key for turning right;
   spacebar for shooting.

3) 1 key for viewing from the back of the avatar;
   2 key for viewing from the top of the avatar.

4) press R to replay.

5) press Q to quit.


