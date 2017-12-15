window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, "game");

  game.state.add("Main", App.Main);
  game.state.start("Main");
};

var App ={};

App.Main = function(game){
	this.STATE_INIT = 1;
	this.STATE_START = 2;
	this.STATE_PLAY = 3;
	this.STATE_GAMEOVER = 4;
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
        //create the autoScrolls
        this.clouds = this.game.add.tileSprite(0, 0, 800, 600, "cloud");
        this.clouds.autoScroll(-100,0);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;

        // get world width
        this.worldWidth = this.game.world.width;
        
        this.ground = this.platforms.create(0,this.game.world.height - 64, "ground");
        this.ground.scale.setTo(2,2);
        this.ground.body.immovable =true;
        
        this.GA = new GeneticAlgorithm(10,4);
        
        //this.character = new Character(this.game,25,this.game.world.height-150,"dude");
        this.characterGroup  = []
        for(var i = 0; i < this.GA.max_units; i++){
            this.characterGroup.push(new Character(this.game,25,this.game.world.height-150 ,"dude",i));
        }

        // CREATE OBSTACLE
        this.obstacleGroup = []
        var firstRand = randInteger(this.game,this.game.world.width,this.game.world.width/2 * 3);
        for(var i = 0; i < 2; i++){
            this.obstacleGroup.push(new Cactus(this.game,firstRand+i*400,490,"cactus",0.5,0.5));
        }
        //this.obstacle = new Cactus(this.game,100,100,"cactus",0.5,0.5);
        //this.obstacle.getHeight();
        
        //this.obstacle = new Cactus(this.game,100,200,"cactus",0.2,0.2);
        //this.obstacle.getHeight();
        //console.log(this.obstacle);
        this.state = this.STATE_INIT;
    },
    update : function(){
      
        switch(this.state){
            case this.STATE_INIT:
                //initialize the genetic algorithm
                this.GA.reset();
                this.GA.createPopulation();
                
                this.state = this.STATE_START;
                break;
            case this.STATE_START:
                //start and reset the game
                this.target = {x0:0,x1:1};
                

                this.state = this.STATE_PLAY;
                break;
            case this.STATE_PLAY: 
                // play Flappy Bird game by using genetic algorithm AI+
                
                
                for(var i = 0; i < this.characterGroup.length;i++){
                    //console.log(this.characterGroup[i]);
                    if(this.characterGroup[i].player.alive){
                      //console.log(this.characterGroup[i]);                        
                        //inputs for the ANN
                        this.target.x0 = getDistBetween(this.characterGroup[i].getX(),this.obstacleGroup[0].getX());
                        this.target.x1 = getDistBetween(this.characterGroup[i].getX(),this.obstacleGroup[1].getX());
                        // multiple characters
                        this.playerGroundColl = [];
                        this.playerCactusColl = [];
                        for(var j = 0; j < this.characterGroup.length;j++){
                            //player - ground collision
                            this.playerGroundColl.push(this.game.physics.arcade.collide(this.characterGroup[j].player,this.platforms));
                            this.characterGroup[i].player.animations.play("right");
                            //player - cactus collision
                            this.playerCactusColl.push(this.game.physics.arcade.overlap(this.characterGroup[j].player, this.obstacleGroup[0].cactus,collhandler(i),null,this));
                            if(this.playerCactusColl[j]) {
                                this.characterGroup[0].eliminate();
                                this.characterGroup.splice(0,1)
                            }
                        }
                        /*
                        * obstacle updates 
                        */
                        if(this.obstacleGroup[0].getX() < 0){
                            this.obstacleGroup.splice(0,1);
                            var newRand = randInteger(this.game,this.worldWidth,this.worldWidth/2 * 3);
                            //console.log(this.obstacleGroup[0].cactus.body.x);
                            if(getDistBetween(newRand,this.obstacleGroup[0].cactus.body.x) < 200) newRand+=200;
                            this.obstacleGroup.push(new Cactus(this.game,newRand,490,"cactus",0.5,0.5));
                        }
                        //console.log(this.characterGroup[i]);
                       this.GA.activateBrain(this.characterGroup[i], this.target);
                    }
                    
                }
                    
                break;
            case this.STATE_GAMEOVER: 
                // when all birds are killed evolve the population
                break;
        }

        /*
        * player updates
        */
        //single character
/*
        player = this.character.player;
        this.hitPlatform = this.game.physics.arcade.collide(this.character.player,this.platforms);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.character.player.body.velocity.x = 0;
        this.character.player.animations.play("right");
*/

        //console.log(this.playerCactusColl);


        /**
         * semi debugging here
         */

        /*
        var tmp = 9;
        if (this.cursors.up.isDown /*&& this.characterGroup[tmp].player.body.touching.down && this.playerGroundColl[tmp])
        {
            //console.log(this.characterGroup[0].player.body.x);
           // this.characterGroup[tmp].player.body.velocity.y = -300;
            console.log(this.characterGroup);
            this.characterGroup[0].eliminate();
            this.characterGroup.splice(0,1)
        }
        */
        //var hit = this.game.physics.arcade.collide(player, this.obstacleGroup[0].cactus, collhandler,null, this);
        
        
        //console.log(getDistBetween(player.body.x, this.obstacleGroup[0].cactus.body.x));
    }
};
//for handling collisions
function collhandler(i){
    //console.log(i);
}
var Character = function(game,x, y,img,index){
    this.x = x;
    this.y = y;
    this.index = index;
    this.player = game.add.sprite(x,y,img);
    //  We need to enable physics on the player
    game.physics.arcade.enable(this.player);
    //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.0;
    this.player.body.gravity.y = 600;
    this.player.body.collideWorldBounds = true;
    this.player.alive = true;
    //  Our two animations, walking left and right.
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
};
Character.prototype.eliminate = function(){
    this.player.alive = false;
    this.player.body = null;
    this.player.kill();
}
Character.prototype.getX = function(){
    return this.player.body.x;
}
Character.prototype.jump = function(){
    if(this.player.body.touching.down)
        this.player.body.velocity.y = -350;
}
/*
    Obstacle class
*/
var Cactus = function(game,x, y,img,scale){
    this.cactus = game.add.sprite(x,y,img);
    game.physics.arcade.enable(this.cactus);
    this.cactus.scale.setTo(scale,scale);
    this.cactus.body.velocity.x = -200
    this.cactus.animations.frame = 2;
};

Cactus.prototype.getX = function(){
    return this.cactus.body.x;
}
Cactus.prototype.getHeight = function(){
    console.log(this.cactus.scale.x * this.cactus.body.height);
}


function randInteger(game,min,max){
    return game.rnd.integerInRange(min,max)
}
function getDistBetween(x, y){
    return Math.abs(x - y);
}
