'use strict'

var game = new Phaser.Game(400, 490, Phaser.AUTO, '');

var mainState = {
    preload: function() {
        game.stage.backgroundColor = '#71c5cf';

        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.audio('jump', 'assets/jump.wav');
    },
    create: function() {
        //enable physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.bird = game.add.sprite(100, 245, 'bird');
        this.bird.anchor.setTo(-0.2, 0.5);

        //enable gravity on the bird
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        this.pipes = game.add.group();
        this.pipes.enableBody = true; //add physics to the group
        this.pipes.createMultiple(20, 'pipe'); //create 20 pipes

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = -1;
        this.labelScore = game.add.text(20, 20, '0', {
            font: '30px arial',
            fill: '#ffffff'
        });

        this.jumpSnd = game.add.audio('jump');

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
    },
    update: function() {
        if (!this.bird.inWorld) {
            this.restartGame();
        }
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

        if (this.bird.angle < 20) {
            this.bird.angle += 1;
        }

    },
    hitPipe: function() {
        if (!this.bird.alive) {
            return;
        }
        this.bird.alive = false;

        //prevent new pipes appearing
        game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function(p) {
            p.body.velocity.x = 0;
        }, this);

    },
    jump: function() {
        if (!this.bird.alive) {
            return;
        }
        this.bird.body.velocity.y = -350;

        this.jumpSnd.play();

        game.add.tween(this.bird).to({
            angle: -20
        }, 100).start();

    },
    restartGame: function() {
        game.state.start('main');
    },
    addOnePipe: function(x, y) {
        //get the first dead pipe of out pipes group
        var pipe = this.pipes.getFirstDead();

        //set the new position of the pipe
        pipe.reset(x, y);

        //add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        //kill the pipe when its no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    addRowOfPipes: function() {
        //decide where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        //add the 6 pipes
        for (var i = 0; i < 8; i++) {
            if (i !== hole && i !== hole + 1) {
                this.addOnePipe(400, i * 60 + 10);
            }
        }

        this.score += 1;
        this.labelScore.text = this.score;
    }
};

game.state.add('main', mainState);
game.state.start('main');
