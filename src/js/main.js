window.onload = function() {
    'use strict';

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

    function preload() {
        game.load.image('sky', '../assets/sky.png');
        game.load.image('ground', '../assets/platform.png');
        game.load.image('star', '../assets/star.png');
        game.load.spritesheet('dude', '../assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', '../assets/baddie.png', 32, 32);
        game.load.audio('jump', '../assets/jump.wav');
    }

    var platforms,
        player,
        cursors,
        stars,
        score = 0,
        scoreTxt,
        baddies,
        jumpSound;

    function create() {

        //enable physics for the game
        game.physics.startSystem(Phaser.Physics.ARCADE);

        jumpSound = game.add.audio('jump');

        // the background
        game.add.sprite(0, 0, 'sky');

        //platform group contains the 2 ladges and the ground
        platforms = game.add.group();

        //enable physics for all objects within this group
        platforms.enableBody = true;

        //the ground
        var ground = platforms.create(0, game.world.height - 64, 'ground');

        //scale to fit the screen
        ground.scale.setTo(2, 2);

        //prevent the ground falling when jump on it
        ground.body.immovable = true;

        //the two ledges
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;
        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;

        //the player
        player = game.add.sprite(32, game.world.height - 150, 'dude');

        //enable physics for the player
        game.physics.arcade.enable(player);

        player.body.bounce.y = 0.2;
        player.body.gravity.y = 450;
        player.body.collideWorldBounds = true;
        player.animations.add('left', [0, 1, 2, 3], 4, true);
        player.animations.add('right', [5, 6, 7, 8], 4, true);

        //start from frame 4, witch faces the cemara
        player.frame = 4;

        //input handle
        cursors = game.input.keyboard.createCursorKeys();

        //the stars
        stars = game.add.group();

        stars.enableBody = true;

        for (var i = 0; i < 12; i++) {
            var star = stars.create(i * 70, 0, 'star');
            star.body.gravity.y = 350;
            star.body.bounce.y = 0.3 + Math.random() * 0.2;
        };

        //the baddie
        baddies = game.add.group();
        baddies.enableBody = true;

        for (var i = 0; i < 3; i++) {
            var baddie = baddies.create(i * game.world.width / 3 - 15, 0, 'baddie');
            baddie.body.gravity.y = 350;
            baddie.animations.add('left', [0, 1], 10, true);
            baddie.animations.add('right', [2, 3], 10, true);
            baddie.body.collideWorldBounds = true;
            baddie.animations.play('right');
            baddie.body.velocity.x = 70;
            baddie.name = 'baddie' + i;
        }

        //the score
        scoreTxt = game.add.text(16, 16, 'score:0', {
            fontSize: '12px',
            fill: '#00f'
        });

    }

    function update() {
        //collide the player and stars with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(stars, platforms);
        game.physics.arcade.collide(baddies, platforms, boundBaddie, null, this);
        game.physics.arcade.collide(player, stars, collectStar, null, this);
        game.physics.arcade.overlap(player, baddies, gameover, null, this);

        //reset the velocity of the player
        player.body.velocity.x = 0;

        if (!player.alive) return;

        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -150;

            player.animations.play('left');
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 150;

            player.animations.play('right');
        } else {
            //  Stand still
            player.animations.stop();
        }

        if (cursors.up.isDown && player.body.touching.down) {
            jumpSound.play();
            player.body.velocity.y = -320;
        }

        if (cursors.down.isDown && !player.body.touching.down) {
            player.body.velocity.y = 300;
        }
    }

    function collectStar(player, star) {
        star.kill();
        score += 1;
        scoreTxt.text = 'score:' + score;
    }

    function boundBaddie(baddie, ledge) {

        if (!baddie.alive) {
            baddie.body.velocity.x = 0;
        } else {
            //animate the baddie
            if (baddie.body.x < 5 || baddie.body.x < (ledge.body.x - 15)) {
                baddie.animations.play('right');
                baddie.body.velocity.x = 70;
            }
            if (baddie.body.x > (ledge.body.x + ledge.body.width - 15) || baddie.body.x > (game.world.width - 35)) {
                baddie.animations.play('left');
                baddie.body.velocity.x = -70;
            }
        }
    }

    function gameover(player, baddie) {
        player.animations.stop();
        player.alive = false;
        baddie.animations.stop();
        baddie.alive = false;
    }

};

