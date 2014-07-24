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

test = {0 : {
    p1: 0,
    p2: 4,
    b1: 0,
    b2: 0,
    bullets: {}
  }
}

$(document).ready(function(){
  var k = 20;
  var gameStep = function() {
    $('.p1').css({'top':k});
    $('.p2').css({'bottom':k});
    k += 80;
    k = k % 400;
  }
  var gameTimer = setInterval(gameStep, 164);
});