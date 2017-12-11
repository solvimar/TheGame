window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, "game");

  game.state.add("Main", App.Main);
  game.state.start("Main");
};

var App ={};

App.Main = function(game){

}

App.Main.prototype = {
    preload : function(){
        this.game.load.image("sky", "assets/sky.png");
        this.game.load.image("ground", "assets/platform.png");
        this.game.load.image("star", "assets/star.png");
        this.game.load.spritesheet("dude", "assets/dude.png", 32, 48);
        this.game.load.image("cloud", "assets/cloud-example.jpg");
        this.game.load.spritesheet("cactus", "assets/cactus2.png", 100, 100);        
    },

    create: function(){
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.add.sprite(0,0,"sky");
        this.clouds = this.game.add.tileSprite(0, 0, 800, 600, "cloud");
        //this.game.add.sprite(100,100,"star");
        this.game.add.sprite(100,100,"cactus");
        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;
        this.ground = this.platforms.create(0,this.game.world.height - 64, "ground");
        this.ground.scale.setTo(2,2);
        this.ground.body.immovable =true;
        
        //this.movingBackground=this.game.add.tileSprite(0,0,800,600,"sky");
        this.character = new Character(this.game,25,this.game.world.height-150,"dude");
        this.obstacles = new StarObstacle(this.game,this.game.world.width,this.game.world.height-100,"star");
    },
    update : function(){
        this.clouds.tilePosition.x-=2;
        if (this.obstacles.obstacle.body.x<0) {
        this.obstacles = new StarObstacle(this.game, this.game.world.width, this.game.world.height - 100, "star");
            
        }
        
        this.obstacles.obstacle.body.velocity.x=-300;

        var player = this.character.player;
        this.hitPlatform = this.game.physics.arcade.collide(this.character.player,this.platforms);
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.character.player.body.velocity.x = 0;
        this.character.player.animations.play("right");
        if (this.obstacles.obstacle.body.x<170 && this.character.player.body.touching.down && this.hitPlatform) {
            this.character.player.body.velocity.y = -250;
        }
    }
};

var Character = function(game,x, y,img){
   // Phaser.Sprite.call(this,game,x,y,"dude");
    this.x = x;
    this.y = y;
    this.player = game.add.sprite(x,y,img);
    //  We need to enable physics on the player
    game.physics.arcade.enable(this.player);

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.0;
    this.player.body.gravity.y = 600;
    this.player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    
};

var StarObstacle = function(game,x,y,img){
    this.obstacle = game.add.sprite(x,y,img);
    game.physics.arcade.enable(this.obstacle);
    this.obstacle.body.collideWorldBounds = false;
    this.obstacle.scale.setTo(2, 2);
}

/*
    Obstacle class
*/



/*

if (this.cursors.left.isDown) {
    this.character.player.body.velocity.x = -150;
    if (player.body.touching.down)
        this.character.player.animations.play("left");
    else
        player.frame = 1;
} else if (this.cursors.right.isDown) {
    this.character.player.body.velocity.x = 150;
    if (player.body.touching.down)
        this.character.player.animations.play("right");
    else
        player.frame = 6;
} else {
    this.character.player.animations.stop();
    this.character.player.frame = 4;
}

if (this.cursors.up.isDown && this.character.player.body.touching.down && this.hitPlatform) {
    this.character.player.body.velocity.y = -200;
}

*/