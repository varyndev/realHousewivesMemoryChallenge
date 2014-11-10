/**
 * Created by jf on 12/3/13.
 *
 * This is a rudimentary Animation system.
 * Call init to supply information where the sprites will be used.
 * Then call one of the start* functions to emit a specific set of particle behavior.
 * Then call onEnterFrame in the game loop to update the particle sprites.
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.AnimationHandler = {
    canvas: null,
    stage: null,
    imgSeq: null,
    spriteTemplateParticles: null,
    spriteTemplateStars: null,
    activeCardQueue: null,
    allParticles: null,
    isQuitPending: false,
    maxWidth: 0,
    maxHeight: 0,
    fps: 0,
    frameTime: 0,


    init: function (_canvas, _stage) {
        var spriteDataParticles = {
            images: [MemoryMatch.assetLoader.getResult("particles")],
            frames: MemoryMatch.GameSetup.particleFrames
            },
            spriteSize;

        this.canvas = _canvas;
        this.stage = _stage;
        this.fps = MemoryMatch.fps;
        this.frameTime = MemoryMatch.frameTime;
        this.imgSeq = new Image();
        // set up an animation instance, which we will clone when we need to
        this.spriteTemplateParticles = new createjs.Sprite(new createjs.SpriteSheet(spriteDataParticles));
        this.spriteTemplateStars = new createjs.Sprite(new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames), 'particleStar');
        spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, 'particleStar');
        this.spriteTemplateStars.regX = spriteSize.width * 0.5;
        this.spriteTemplateStars.regY = spriteSize.height * 0.5;
        this.allParticles = [];
        this.activeCardQueue = [];
        this.maxHeight = this.canvas.height;
        this.maxWidth = this.canvas.width;
    },

    quitPending: function (quitFlag) {
        this.isQuitPending = quitFlag;
    },

    destroy: function () {
        // call this if you are finished and want to dealloc the references
        this.clearAllParticles();
        this.clearAllAnimations();
        this.activeCardQueue = null;
        this.allParticles = null;
        this.spriteTemplateParticles = null;
        this.spriteTemplateStars = null;
        this.canvas = null;
        this.stage = null;
        this.imgSeq = null;
    },

    queueSize: function () {
        return (this.activeCardQueue === null ? 0 : this.activeCardQueue.length) + (this.allParticles === null ? 0 : this.allParticles.length);
    },

    addToAnimationQueue: function (actor, delay, duration, removeFromStage, startFunction, endFunction) {
        // actor: display object to animate
        // delay: ms from now to begin animating
        // duration: ms from begin to end animation
        // removeFromStage: true to kill this object when animation is complete
        // startFunction is called on first tick animation begins (after delay)
        // endFunction is called on last tick when animation ends
        var animationObject = null;

        if (actor == null) {
            return; // Nothing to animate!
        }
        if (delay == null) {
            delay = 0;
        }
        if (removeFromStage == null) {
            removeFromStage = false;
        }
        animationObject = {};
        animationObject.actor = actor;
        animationObject.addTime = Date.now();
        animationObject.startTime = animationObject.addTime + delay;
        animationObject.started = false;
        animationObject.markedForRemoval = false;
        if (duration != null) {
            if (duration == 0) {
                animationObject.endTime = 0;
            } else {
                animationObject.endTime = animationObject.startTime + duration;
            }
        } else {
            animationObject.endTime = 0;
        }
        animationObject.removeFromStage = removeFromStage;
        animationObject.startFunction = startFunction;
        animationObject.endFunction = endFunction;
        animationObject.tag = 0;
        this.activeCardQueue.push(animationObject);
        return animationObject;
    },

    updateAnimations: function (deltaTime) {
        // Each object on the queue is expected to be a DisplayObject, Sprite, or Container.
        // Animations Parameters:
        //  .actor        : the display object that is the target of the animation
        //  .tag          : unique identifier so we can find and manipulate this item later
        //  .addTime      : time stamp this animation was added to the queue
        //  .startTime    : time stamp this animation will begin its animation
        //  .removeFromStage : true object will be removed at endTime, false it will remain in display list
        // Optional parameters, when provided they are processed:
        //  .endTime      : time stamp when this object should be removed from animation queue
        //  .vX           : move object with this X velocity
        //  .endX         : X value at endTime (mitigates rounding errors). If vX is not provided will be used to calc vX.
        //  .vY           : move object with this Y velocity
        //  .endY         : Y value at endTime (mitigates rounding errors). If vY is not provided will be used to calc vY.
        //  .vAlpha       : alpha "velocity" amount of alpha to subtract (- to add) over startTime to endTime
        //  .endAlpha     : alpha value at endTime (mitigates rounding errors)
        //  .killOnAlphaZero: stop animating this object if alpha goes to 0
        //  .vRotation    : rotation "velocity" amount of rotation over startTime to endTime
        //  .endRotation  : rotation value at endTime (mitigates rounding errors)
        //  .vXScale      : amount to scale-X each tick
        //  .endXScale    : scale-X value at endTime (mitigates rounding errors)
        //  .vYScale      : amount to scale-Y each tick
        //  .endYScale    : scale-Y value at endTime (mitigates rounding errors)
        //  .vXSkew       : amount to skew-X each tick
        //  .endXSkew     : skew-X value at endTime (mitigates rounding errors)
        //  .vYSkew       : amount to skew-Y each tick
        //  .endYSkew     : skew-Y value at endTime (mitigates rounding errors)
        //  .endFunction  : function to call at endTime
        //  .startFunction: function to call at startTime
        //  .tickFunction : function to call at each tick
        //  .showAtBegin  : true to show at animation begin, false to hide at animation begin, null to do nothing
        //  .showAtEnd    : true to show at animation end, false to hide at animation end, null to do nothing

        var timeNow = Date.now(),
            objectsToRemove = 0,
            animatingObject = null,
            i,
            keepAnimating,
            isAnimating,
            queueLength = this.activeCardQueue.length;

        if (this.isQuitPending) {
            return;
        }
//        MemoryMatch.debugLog("updateAnimations processing " + queueLength + " objects");
        for (i = 0; i < queueLength; i ++) {
            animatingObject = this.activeCardQueue[i];
//            MemoryMatch.debugLog("Animating Actor " + i + "; " + animatingObject.actor.name);
            if (timeNow >= animatingObject.startTime) {
                isAnimating = false;
                if ( ! animatingObject.started) {
                    animatingObject.started = true;
                    isAnimating = true;
                    if (animatingObject.showAtBegin != null) {
                        animatingObject.actor.visible = animatingObject.showAtBegin;
                    }
                    if (animatingObject.startFunction != null) {
                        animatingObject.startFunction(animatingObject);
                    }
                }

                // update x,y velocity and position
                if (animatingObject.vX != null && animatingObject.vX != 0) {
                    isAnimating = true;
                    animatingObject.actor.x += animatingObject.vX;
                    if (animatingObject.endX != null && animatingObject.vX != null && animatingObject.vX != 0) {
                        if (animatingObject.vX > 0 && animatingObject.actor.x >= animatingObject.endX) {
                            animatingObject.actor.x = animatingObject.endX;
                            animatingObject.vX = null;
                            animatingObject.endX = null;
                        } else if (animatingObject.vX < 0 && animatingObject.actor.x <= animatingObject.endX) {
                            animatingObject.actor.x = animatingObject.endX;
                            animatingObject.vX = null;
                            animatingObject.endX = null;
                        }
                    }
                }
                if (animatingObject.vY != null && animatingObject.vY != 0) {
                    isAnimating = true;
                    animatingObject.actor.y += animatingObject.vY;
                    if (animatingObject.endY != null && animatingObject.vY != null && animatingObject.vY != 0) {
                        if (animatingObject.vY > 0 && animatingObject.actor.y >= animatingObject.endY) {
                            animatingObject.actor.y = animatingObject.endY;
                            animatingObject.vY = null;
                            animatingObject.endY = null;
                        } else if (animatingObject.vY < 0 && animatingObject.actor.y <= animatingObject.endY) {
                            animatingObject.actor.y = animatingObject.endY;
                            animatingObject.vY = null;
                            animatingObject.endY = null;
                        }
                    }
                }

                // update x,y scale
                if (animatingObject.vXScale != null && animatingObject.vXScale != 0) {
                    isAnimating = true;
                    animatingObject.actor.scaleX += animatingObject.vXScale;
                    if (animatingObject.endXScale != undefined) {
                        if (animatingObject.vXScale > 0 && animatingObject.actor.scaleX >= animatingObject.endXScale) {
                            animatingObject.actor.scaleX = animatingObject.endXScale;
                            animatingObject.vXScale = null;
                            animatingObject.endXScale = null;
                        } else if (animatingObject.vXScale < 0 && animatingObject.actor.scaleX <= animatingObject.endXScale) {
                            animatingObject.actor.scaleX = animatingObject.endXScale;
                            animatingObject.vXScale = null;
                            animatingObject.endXScale = null;
                        }
                    }
                }
                if (animatingObject.vYScale != null && animatingObject.vYScale != 0) {
                    isAnimating = true;
                    animatingObject.actor.scaleY += animatingObject.vYScale;
                    if (animatingObject.endYScale != undefined) {
                        if (animatingObject.vYScale > 0 && animatingObject.actor.scaleY >= animatingObject.endYScale) {
                            animatingObject.actor.scaleY = animatingObject.endYScale;
                            animatingObject.vYScale = null;
                            animatingObject.endYScale = null;
                        } else if (animatingObject.vYScale < 0 && animatingObject.actor.scaleY <= animatingObject.endYScale) {
                            animatingObject.actor.scaleY = animatingObject.endYScale;
                            animatingObject.vYScale = null;
                            animatingObject.endYScale = null;
                        }
                    }
                }

                // update x,y skew
                if (animatingObject.vYSkew != null && animatingObject.vYSkew != 0) {
                    isAnimating = true;
                    animatingObject.actor.skewY += animatingObject.vYSkew;
                    if (animatingObject.endYSkew != null && animatingObject.vYSkew != null && animatingObject.vYSkew != 0) {
                        if ((animatingObject.vYSkew > 0 && animatingObject.actor.skewY >= animatingObject.endYSkew)
                            || (animatingObject.vYSkew < 0 && animatingObject.actor.skewY <= animatingObject.endYSkew)) {
                            animatingObject.actor.skewY = animatingObject.endYSkew;
                            animatingObject.vYSkew = null;
                            animatingObject.endYSkew = null;
                        }
                    }
                }
                if (animatingObject.vXSkew != null && animatingObject.vXSkew != 0) {
                    isAnimating = true;
                    animatingObject.actor.skewX += animatingObject.vXSkew;
                    if (animatingObject.endXSkew != null && animatingObject.vXSkew != null && animatingObject.vXSkew != 0) {
                        if ((animatingObject.vXSkew > 0 && animatingObject.actor.skewX >= animatingObject.endXSkew)
                            || (animatingObject.vXSkew < 0 && animatingObject.actor.skewX <= animatingObject.endXSkew)) {
                            animatingObject.actor.skewX = animatingObject.endXSkew;
                            animatingObject.vXSkew = null;
                            animatingObject.endXSkew = null;
                        }
                    }
                }

                // update rotation
                if (animatingObject.vRotation != null && animatingObject.vRotation != 0) {
                    isAnimating = true;
                    animatingObject.actor.rotation += animatingObject.vRotation;
                    if (animatingObject.endRotation != null && animatingObject.vRotation != null && animatingObject.vRotation != 0) {
                        if ((animatingObject.vRotation > 0 && animatingObject.actor.rotation >= animatingObject.endRotation)
                            || (animatingObject.vRotation < 0 && animatingObject.actor.rotation <= animatingObject.endRotation)) {
                            animatingObject.actor.rotation = animatingObject.endRotation;
                            animatingObject.vRotation = null;
                            animatingObject.endRotation = null;
                        }
                    }
                }

                // update alpha
                if (animatingObject.vAlpha != null && animatingObject.vAlpha != 0) {
                    isAnimating = true;
                    animatingObject.actor.alpha += animatingObject.vAlpha;
                    if (animatingObject.endAlpha != null && animatingObject.vAlpha != null && animatingObject.vAlpha != 0) {
                        if (animatingObject.vAlpha > 0 && animatingObject.actor.alpha >= animatingObject.endAlpha) {
                            animatingObject.actor.alpha = animatingObject.endAlpha;
                            animatingObject.vAlpha = null;
                            animatingObject.endAlpha = null;
                        } else if (animatingObject.vAlpha < 0 && animatingObject.actor.alpha <= animatingObject.endAlpha) {
                            animatingObject.actor.alpha = animatingObject.endAlpha;
                            animatingObject.vAlpha = null;
                            animatingObject.endAlpha = null;
                        }
                        if (animatingObject.endAlpha == null && animatingObject.killOnAlphaZero) {
                            animatingObject.markedForRemoval = true;
                        }
                    }
                }

                // call tick function
                if (animatingObject.tickFunction != null) {
                    isAnimating = true;
                    keepAnimating = animatingObject.tickFunction(animatingObject);
                    if ( ! keepAnimating) {
                        animatingObject.markedForRemoval = true;
                    }
                }

                // if the endTime has expired, or there is nothing going on with this object, then remove it from the queue
                if ((animatingObject.endTime > 0 && animatingObject.endTime <= timeNow) || ( ! isAnimating && animatingObject.endTime == 0)) {
                    animatingObject.markedForRemoval = true;
                }
                if (animatingObject.markedForRemoval) {
                    objectsToRemove ++;
                    if (animatingObject.endFunction != null) {
                        animatingObject.endFunction(animatingObject.actor);
                    }
                    if (animatingObject.removeFromStage) {
                        if (animatingObject.actor != null && animatingObject.actor.parent != null && animatingObject.actor.parent.removeChild != null) {
                            animatingObject.actor.parent.removeChild(animatingObject.actor);
                        }
                    } else {
                        if (animatingObject.showAtEnd != null) {
                            animatingObject.actor.visible = animatingObject.showAtEnd;
                        }
                    }
                }
            }
        }
        if (objectsToRemove > 0) {
            // go through list backwards and remove objects from activeCardQueue
            for (i = this.activeCardQueue.length - 1; i >= 0; i --) {
                animatingObject = this.activeCardQueue[i];
                if (animatingObject.markedForRemoval) {
                    this.activeCardQueue.splice(i, 1);
                }
            }
        }
        if (isAnimating) {
            MemoryMatch.stageUpdated = true;
        }
    },

    updateParticles: function (event, deltaTime) {
        // loop through all of the active particles

        var i,
            particle,
            numberOfParticles = this.allParticles.length,
            isAnimating = false;

        for (i = numberOfParticles - 1; i >= 0; i --) {
            particle = this.allParticles[i];

            // apply gravity and friction
            if (particle.applyGravity) {
                particle.vY += 0.5;
            } else {
                particle.vY *= particle.friction;
            }
            particle.vX *= particle.friction;
            isAnimating = true;

            // update position, scale, and alpha:
            particle.x += particle.vX * deltaTime;
            particle.y += particle.vY * deltaTime;
            particle.alpha += particle.vA * deltaTime;
            particle.scaleX += particle.vScale * deltaTime;
            particle.scaleY += particle.vScale * deltaTime;
            particle.rotation += particle.vRotation * deltaTime;

            // remove sparkles that are no longer visible or are stalled:
            if (particle.alpha <= 0 || particle.y >= this.maxHeight && particle.vY < 1) {
                this.allParticles.splice(i, 1);
                this.stage.removeChild(particle);
            }

            //bounce sparkles off the bottom
            if (particle.bounce) {
                if (particle.y > this.maxHeight) {
                    particle.vY *= -(Math.random() * 0.4 + 0.4);
                    particle.y -= particle.y % this.maxHeight;
                }
                if (particle.x >= this.maxWidth || particle.x <= 0) {
                    particle.vX *= -1;
                }
            } else {
                if (particle.y < 0 || particle.y > this.maxHeight || particle.x >= this.maxWidth || particle.x <= 0) {
                    particle.vA = 0;
                    particle.alpha = 0;
                }
            }
        }
        if (isAnimating) {
            MemoryMatch.stageUpdated = true;
        }
    },

    onEnterFrame: function (event, deltaTime) {
        if (this.activeCardQueue.length > 0) {
            this.updateAnimations(deltaTime);
        }
        if (this.allParticles.length > 0) {
            this.updateParticles(event, deltaTime);
        }
    },

    startSparklerParticles: function (numberOfParticles, x, y) {
        // create the specified number of particles and send them off in random directions
        var angle = 0,
            v,
            i,
            speed,
            particle;

        if (MemoryMatch.gamePaused) {
            return;
        }
        for (i = 0; i < numberOfParticles; i ++) {
            // clone the original particle, so we don't need to set shared properties:
            particle = this.spriteTemplateParticles.clone();

            // set display properties:
            particle.x = x;
            particle.y = y;
            particle.alpha = Math.random() * 0.5 + 0.5;
            particle.scaleX = particle.scaleY = Math.random() + 0.5;
            particle.vScale = 0.05;
            particle.vRotation = Math.random() * 10 - 5;
            particle.compositeOperation = "lighter";
            particle.bounce = false;
            particle.applyGravity = true;
            particle.friction = 0.95;

            // set up velocities for x, y, and alpha:
            angle = 2 * Math.PI * Math.random();
            speed = 40 / this.frameTime;
            v = (Math.random() - 0.5) * speed;
            particle.vX = Math.cos(angle) * v;
            particle.vY = Math.sin(angle) * v;
            particle.vA = (-Math.random() * 0.05 - 0.01) / this.frameTime;
            if (particle.vX === 0) {
                particle.vX = 0.5;
            }
            if (particle.vY === 0) {
                particle.vY = 0.5;
            }
            if (particle.vA === 0) {
                particle.vA = -0.5;
            }

            // start the animation on a random frame:
            particle.gotoAndPlay(Math.random() * particle.spriteSheet.getNumFrames() | 0);

            // add to the display list:
            this.stage.addChild(particle);
            this.allParticles.push(particle);
        }
        MemoryMatch.stageUpdated = true;
    },

    startSplatterParticles: function (numberOfParticles, x, y) {
        // create the specified number of particles and send them off in random directions
        var angle,
            speed,
            v,
            i,
            particle;

        if (MemoryMatch.gamePaused) {
            return;
        }
        for (i = 0; i < numberOfParticles; i ++) {
            // clone the original particle, so we don't need to set shared properties:
            particle = this.spriteTemplateParticles.clone();

            // set display properties:
            particle.x = x;
            particle.y = y;
            particle.alpha = Math.random() * 0.5 + 0.5;
            particle.scaleX = particle.scaleY = Math.random() + 0.8;
            particle.vScale = 0;
            particle.vRotation = (Math.random() * 10 - 5) / this.frameTime;
            particle.compositeOperation = "lighter";
            particle.bounce = false;
            particle.applyGravity = false;
            particle.friction = 0.89;

            // set up velocities for x, y, and alpha:
            angle = 2 * Math.PI * Math.random();
            speed = 40 / this.frameTime;
            v = (Math.random() - 0.5) * speed;
            particle.vX = Math.cos(angle) * v;
            particle.vY = Math.sin(angle) * v;
            particle.vA = (-Math.random() * 0.05 - 0.01) / this.frameTime;
            if (particle.vX === 0) {
                particle.vX = 0.5;
            }
            if (particle.vY === 0) {
                particle.vY = 0.5;
            }
            if (particle.vA === 0) {
                particle.vA = -0.5;
            }

            // start the animation on a random frame:
            particle.gotoAndPlay(Math.random() * particle.spriteSheet.getNumFrames() | 0);

            // add to the display list:
            this.stage.addChild(particle);
            this.allParticles.push(particle);
        }
        MemoryMatch.stageUpdated = true;
    },

    startSplatterStars: function (numberOfStars, x, y) {
        // create the specified number of particles and send them off in random directions
        var angle,
            speed,
            v,
            i,
            particle;

        if (MemoryMatch.gamePaused) {
            return;
        }
        for (i = 0; i < numberOfStars; i ++) {
            // clone the original star, so we don't need to set shared properties:
            particle = this.spriteTemplateStars.clone();
            particle.framerate = 0;

            // set display properties:
            particle.x = x;
            particle.y = y;
            particle.alpha = Math.random() * 0.5 + 0.5;
            particle.scaleX = particle.scaleY = Math.random() + 0.8;
            particle.vScale = 0;
            particle.vRotation = (Math.random() * 30 - 15) / this.frameTime;
            particle.compositeOperation = "lighter";
            particle.bounce = false;
            particle.applyGravity = false;
            particle.friction = 0.89;

            // set up velocities for x, y, and alpha:
            angle = 2 * Math.PI * Math.random();
            speed = 80 / this.frameTime;
            v = (Math.random() - 0.5) * speed;
            particle.vX = Math.cos(angle) * v;
            particle.vY = Math.sin(angle) * v;
            particle.vA = (-Math.random() * 0.05 - 0.01) / this.frameTime;
            if (particle.vX === 0) {
                particle.vX = 0.5;
            }
            if (particle.vY === 0) {
                particle.vY = 0.5;
            }
            if (particle.vA === 0) {
                particle.vA = -0.5;
            }
            particle.gotoAndStop('particleStar');
            this.stage.addChild(particle);
            this.allParticles.push(particle);
        }
        MemoryMatch.stageUpdated = true;
    },

    startBurstParticles: function (numberOfParticles, x, y) {
        // create the specified number of particles and send them off in a burst
        var angleIncrement = (360 / numberOfParticles) * (Math.PI / 180),
            angle = 0,
            speed,
            v,
            i,
            particle;

        if (MemoryMatch.gamePaused) {
            return;
        }
        for (i = 0; i < numberOfParticles; i ++) {
            // clone the original particle, so we don't need to set shared properties:
            particle = this.spriteTemplateParticles.clone();

            // set display properties:
            particle.x = x;
            particle.y = y;
            particle.alpha = Math.random() * 0.5 + 0.5;
            particle.scaleX = particle.scaleY = Math.random() + 0.9;
            particle.vScale = (0.02 / this.frameTime);
            particle.vRotation = (Math.random() * 10 - 5) / this.frameTime;
            particle.compositeOperation = "lighter";
            particle.bounce = false;
            particle.applyGravity = true;
            particle.friction = 0.89;

            // set up velocities for x, y, and alpha:
            angle += angleIncrement;
            speed = 20 / this.frameTime;
            v = (0.8 + (Math.random() * 0.2)) * speed;
            particle.vX = Math.cos(angle) * v;
            particle.vY = Math.sin(angle) * v;
            particle.vA = -0.01 / this.frameTime;
            if (particle.vX === 0) {
                particle.vX = 0.5;
            }
            if (particle.vY === 0) {
                particle.vY = 0.5;
            }
            if (particle.vA === 0) {
                particle.vA = -0.5;
            }

            // start the animation on a random frame:
            particle.gotoAndPlay(Math.random() * particle.spriteSheet.getNumFrames() | 0);

            // add to the display list:
            this.stage.addChild(particle);
            this.allParticles.push(particle);
        }
        MemoryMatch.stageUpdated = true;
    },

    removeActor: function (actor) {

        // Find any animations for this actor and remove them from the queue.

        var objectsToRemove = 0,
            animatingObject = null,
            i;

        for (i = 0; i < this.activeCardQueue.length; i ++) {
            animatingObject = this.activeCardQueue[i];
//            MemoryMatch.debugLog("Removing Actor " + i + "; " + animatingObject.actor.name);
            if (animatingObject.actor == actor) {
                animatingObject.markedForRemoval = true;
                objectsToRemove ++;
            }
        }
        if (objectsToRemove > 0) {
            // go through list backwards and remove objects from activeCardQueue
            for (i = this.activeCardQueue.length - 1; i >= 0; i --) {
                animatingObject = this.activeCardQueue[i];
                if (animatingObject.markedForRemoval) {
                    this.activeCardQueue.splice(i, 1);
                }
            }
        }
    },

    removeWithTag: function (tag) {

        // Find any animations for this tag and remove them from the queue.

        var objectsToRemove = 0,
            animatingObject = null,
            i;

        for (i = 0; i < this.activeCardQueue.length; i ++) {
            animatingObject = this.activeCardQueue[i];
            MemoryMatch.debugLog("removeWithTag Actor " + i + "; " + animatingObject.actor.name);
            if (animatingObject.tag == tag) {
                animatingObject.markedForRemoval = true;
                if (animatingObject.actor != null && animatingObject.actor.parent != null && animatingObject.actor.parent.removeChild != null) {
                    animatingObject.actor.parent.removeChild(animatingObject.actor);
                }
                objectsToRemove ++;
            }
        }
        if (objectsToRemove > 0) {
            // go through list backwards and remove objects from activeCardQueue
            for (i = this.activeCardQueue.length - 1; i >= 0; i --) {
                animatingObject = this.activeCardQueue[i];
                if (animatingObject.markedForRemoval) {
                    this.activeCardQueue.splice(i, 1);
                }
            }
        }
    },

    clearAll: function () {
        this.clearAllAnimations();
        this.clearAllParticles();
    },

    clearAllAnimations: function () {
        var i,
            sprite,
            numberOfActiveAnimations = this.activeCardQueue.length;

        for (i = numberOfActiveAnimations - 1; i > 0; i --) {
            sprite = this.activeCardQueue[i].actor;
            this.stage.removeChild(sprite);
        }
        this.activeCardQueue = [];
        MemoryMatch.stageUpdated = true;
    },

    clearAllParticles: function () {
        var i,
            particle,
            numberOfActiveParticles = this.allParticles.length;

        for (i = numberOfActiveParticles - 1; i > 0; i --) {
            particle = this.allParticles[i];

            // reset gravity and friction
            particle.vY = 0;
            particle.vX = 0;
            particle.vA = 0;
            particle.vScale = 0;
            particle.vRotation = 0;
            particle.y = -100;
            particle.alpha = 0;
            this.stage.removeChild(particle);
        }
        this.allParticles = [];
        MemoryMatch.stageUpdated = true;
    }
};