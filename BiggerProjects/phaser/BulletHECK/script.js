var config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var prevtime = Date.now();
var counter = 0;
var points = 0;
var cpointE = 0;
var pointP = 0;
var angleA = 0;
var version = "0.01"
var distance = Math.random() * 180 + 20;
//console.log("Distance: " + distance);

function preload() {
  this.load.image('background', 'img/background.png');
  this.load.image('player', 'img/player.png');
  this.load.image('bullet', 'img/bullet.png');
  this.load.image('baseEnemy', 'img/baseEnemy.png');
  this.load.image('baseOrb', 'img/baseOrb.png');
  this.load.image('baseRammer', 'img/baseRammer.png');
  this.load.image('menu', 'img/menu.png');
}

class pBullet extends Phaser.GameObjects.Sprite {

    constructor (scene, x, y) {
      super(scene, x, y);
      Phaser.GameObjects.Sprite.call(this, scene, x, y, 'bullet');
      this.displayHeight = 6;
      this.displayWidth = 2; 
      this.damage = 1; 
      scene.physics.add.overlap(this, scene.baseEnemies, bcollide, null, this);
      scene.physics.add.overlap(this, scene.baseRammers, bcollide, null, this);
      scene.physics.add.existing(this);
    }

}

class eBullet extends Phaser.GameObjects.Sprite {

    constructor (scene, x, y) {
      super(scene, x, y);
      Phaser.GameObjects.Sprite.call(this, scene, x, y, 'baseOrb');
      this.displayHeight = 9;
      this.displayWidth = 9; 
      this.damage = 1; 
      scene.physics.add.existing(this);
    }

}

class baseEnemy extends Phaser.GameObjects.Sprite {

    constructor (scene, x, y) {
      super(scene, x, y);
      Phaser.GameObjects.Sprite.call(this, scene, x, y, 'baseEnemy');
      this.displayHeight = 30;
      this.displayWidth = 30; 
      this.angle = 180;
      this.health = Math.floor(Math.random()*4) + 3; 
      this.baseHealth = this.health; 
      this.fireTime = Date.now();
      scene.physics.add.overlap(this, killbox, enemyKill, null, this);
      scene.physics.add.existing(this);
      this.basicFireTimer = this.scene.time.addEvent({ 
        delay: Math.random()*2300 + 300, 
        callback: basicFire,
        args: [this],
        callbackScope: scene,
        loop: true
      });
    }
    preUpdate (time, delta) {
      super.preUpdate(time, delta); 
      /*if (this.fireTime - Date.now() < -2000) {
        this.fireTime = Date.now();
        basicFire.call(baseEnemy.constructor, this);
      }*/
      this.y += 0.5
    } 
}

class baseRammer extends Phaser.GameObjects.Sprite {

    constructor (scene, x, y) {
      super(scene, x, y);
      Phaser.GameObjects.Sprite.call(this, scene, x, y, 'baseRammer');
      this.displayHeight = 35;
      this.displayWidth = 35; 
      this.angle = 180;
      this.health = Math.floor(Math.random()*5) + 4; 
      this.baseHealth = this.health;
      scene.physics.add.existing(this);
      this.basicChargeTimer = this.scene.time.addEvent({ 
        delay: Math.random()*1200 + 1200, 
        callback: basicCharge,
        args: [this],
        callbackScope: scene,
        loop: true
      });
    }

    preUpdate (time, delta) {
      super.preUpdate(time, delta); 
      /*if (this.fireTime - Date.now() < -2000) {
        this.fireTime = Date.now();
        basicFire.call(baseEnemy.constructor, this);
      }*/
      cpointE = new Phaser.Geom.Point(this.x, this.y);
      pointP = new Phaser.Geom.Point(player.x, player.y);
      angleA = Phaser.Math.Angle.BetweenPoints(cpointE, pointP);
      this.rotation = (Phaser.Math.Angle.RotateTo(this.rotation, angleA+Math.PI/2));
      //console.log("AngleA: "+angleA+" Rotation: "+this.rotation);
    } 
}

//enemy destination
var target = new Phaser.Math.Vector2();
target.x = 100;
target.y = 100;

function create() {
  this.baseEnemies = this.add.group();
  this.baseRammers = this.add.group();
  this.eBullets = this.add.group();
  var timer = this.time.addEvent({ 
    delay: 5000, 
    callback: createBaseE,
    callbackScope: this,
    loop: true
  });

  var ramtimer = this.time.addEvent({ 
    delay: 20000, 
    callback: createRamE,
    callbackScope: this,
    loop: true
  });

  this.pointsText = this.add.text(10, 10, "Points: " + points, { fontFamily: '"font1"', fontSize: '30px' });
  versionText = this.add.text(10, 40, "Version: " + version, { fontFamily: '"font1"', fontSize: '15px'});
  this.physics.world.setBoundsCollision(true, true, true, true);
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.add.image(0, 0, 'background').setOrigin(0, 0);
  cursors = this.input.keyboard.createCursorKeys();

  //killbox for enemies 
  killbox = this.physics.add.sprite(600, 10, 'bullet');
  killbox.setPosition(300, 830);
  killbox.displayHeight = 10;
  killbox.displayWidth = 600; 

  //player
  player = this.physics.add.sprite(15, 16, 'player');
  player.displayHeight = 33;
  player.displayWidth = 30; 
  player.setCollideWorldBounds(true);
  player.setPosition(200, 300);
  player.body.setSize(6, 6);
  player.body.offset.x = 5;
  player.body.offset.y = 4;
  this.physics.add.overlap(player, this.eBullets, gameOver, null, this);
  this.physics.add.overlap(player, this.baseRammers, gameOver, null, this);
};

function basicFire(child) {
  if (this.baseEnemies.countActive(true) > 0) {
    bullet = this.add.existing(new eBullet(this, child.x, child.y));
    bullet.body.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.body.world.on('worldbounds', function(body){
    if (body.gameObject === this) {
        this.destroy();
      } 
    }, bullet);
      bullet.body.setSize(12, 12);
      //bullet.body.offset.x = 0;
      this.eBullets.add(bullet);
      //bullet.body.setVelocityY(200);
      pointE = new Phaser.Geom.Point(bullet.x, bullet.y);
      pointP = new Phaser.Geom.Point(player.x, player.y);
      angleA = Phaser.Math.Angle.BetweenPoints(pointE, pointP);
      child.rotation = (Phaser.Math.Angle.RotateTo(child.angle, angleA)+1.5);
      this.physics.moveTo(bullet, player.x, player.y, 220);
      }
}

function basicCharge(child) {
  if (this.baseRammers.countActive(true) > 0) {
      this.physics.moveTo(child, player.x, player.y, 210);
      }
}

 //enemy 
function createBaseE() {
  basicboi = this.add.existing(new baseEnemy(this, Math.random()*590, -12));
  this.baseEnemies.add(basicboi);
  basicboi.body.setSize(15, 15);
  /*if (enemy.x < (distance - 10) && counter == 0) {
    this.physics.moveTo(basicboi, distance, 100, 1000, distance);
  } else {
    enemy.body.setVelocityX(0);
    enemy.body.setVelocityY(30);
    counter = 1;
  }*/
}

function createRamE() {
  basicRam = this.add.existing(new baseRammer(this, Math.random()*590, -12));
  this.baseRammers.add(basicRam);
  basicRam.body.setSize(13, 13);
  basicRam.body.offset.x = 1.5;
  basicRam.body.offset.y = 1;
}

function resetBullet(e) {
	// Destroy the bullet
	e.destroy();
  console.log("deleted");
}

function bcollide(bullet, enemy) {
  bullet.destroy();
  enemy.health -= bullet.damage;
  if (enemy.health < 1) {
    enemy.destroy();
    if (enemy.basicFireTimer != null) {
      enemy.basicFireTimer.remove(false);
      a = enemy.basicFireTimer.delay
    } 
    if (enemy.basicChargeTimer != null) {
      enemy.basicChargeTimer.remove(false);
      a = enemy.basicChargeTimer.delay
    }
    //old formula
    //value = Math.round((Math.round(enemy.baseHealth) * 6) /(enemy.basicFireTimer.delay/200));
    value = Math.round(2+(enemy.baseHealth*4)*(200/a));
    points += value;
    console.log("Health: " + Math.round(enemy.baseHealth) + " Delay: " + a + " Points: " + value);
  }
}

function enemyKill(enemy, death) {
  enemy.destroy();
  enemy.basicFireTimer.remove(false);
}

function gameOver() {
  this.scene.pause();
  menu = this.physics.add.sprite(600, 800, 'menu');
  menu.setPosition(300, 400);
  menu.displayHeight = 600;
  menu.displayWidth = 400; 
}

function update() {
  var time = Date.now(); 
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    //player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    //player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    //player.anims.play('turn');
  }

  if (cursors.down.isDown) {
    player.setVelocityY(160);

    //player.anims.play('left', true);
  } else if (cursors.up.isDown) {
    player.setVelocityY(-160);

    //player.anims.play('right', true);
  } else {
    player.setVelocityY(0);

    //player.anims.play('turn');
  }
  
  //enemy movement
  this.pointsText.setText("POINTS: " + points);
  this.pointsText.setDepth(1);
  versionText.setDepth(1);
  //player weapon stuff
  if (this.spaceKey.isDown) {
    if (time - prevtime >= 500) {
      bullet = this.add.existing(new pBullet(this, player.x, player.y));
      bullet.body.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;
      bullet.body.world.on('worldbounds', function(body) {
      if (body.gameObject === this) {
          this.destroy();
        } 
      }, bullet);
      bullet.body.setVelocityY(-250);
      prevtime = Date.now(); 
    }   
  };
}