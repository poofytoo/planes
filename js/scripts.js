/**

INPUT:
enemy plane location
your plane location
bullets available
radar 1
radar 2
radar 3
radar 4
radar 5
radar 6
radar 7
// WARNING, ALERT

OUTPUT:
action
// UP, DOWN, CHARGE, FIRE


PLANES JSON

{

  [Frame Id] : {
    p1: [plane 1 location or EXPLODE],
    p2: [plane 2 location or EXPLODE],
    b1: [plane 1 no. bullets],
    b2: [plane 2 no. bullets],
    bullets: {
      [bullet id]: {
          x: [x value between 0 and 800],
          direction: [1 or -1]
        }
      ...
    }
  }
  ...

}

**/

var michaelbot = function(e, p, b, r1, r2, r3, r4, r5, r6, r7) {
  return 'CHARGE'
}

var victorbot = function(e, p, b, r1, r2, r3, r4, r5, r6, r7) {
  return 'CHARGE'
}

var boardState = {
  p1: 3,
  p2: 4,
  b1: 1,
  b2: 1,
  bullets: {}
}

var gameStep = function() {
  
}

var gameTimer = setInterval(gameStep, 500);