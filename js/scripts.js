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
          y: [row number]
          direction: [1 or -1]
        }
      ...
    }
  }
  ...

}

**/


var test = {0 : {
    p1: 0,
    p2: 4,
    b1: 1,
    b2: 0,
    action1: 0,
    action2: 0, // FIRE, SHOOT, 
    bullets: {
      0: {
        x: 0,
        y: 0
      },
      1: {
        x: 160,
        y: 1
      },
      2: {
        x: 320,
        y: 2
      },
      3: {
        x: 480,
        y: 3
      },
      4: {
        x: 640,
        y: 4
      }
    }
  }
}


$(document).ready(function(){

  var FRAME_RATE = 24
  var MS_FRAME = 1000/FRAME_RATE

  var testJSONCounter = 0

  var sound = document.getElementById("sound");    
  var k = 0;
  var g = 0;
  
  var testJSON = {};
  $.ajax({
    url: "js/animateTest.json",
    success: function (data) {
      testJSON = data;
      window.testJSON = testJSON;
    }
  }).fail(function(e, status, error) {
    console.log( e );
    console.log( error );
  })
    
  var gameStep = function() {
  /*
    $('.p1').css({'top':Math.floor(k/80)*80+20});
    $('.p2').css({'bottom':Math.floor(k/80)*80+20});
    k += 4;
    $('.bul').css({'left': g});
    k = k % 400;
    g += 10;
    g = g % 780;
  */
  /*
    test[0].bullets[0].x = test[0].bullets[0].x%780 + 10;
    test[0].bullets[1].x = test[0].bullets[1].x%780 + 10;
    test[0].bullets[2].x = test[0].bullets[2].x%780 + 10;
    test[0].bullets[3].x = test[0].bullets[3].x%780 + 10;
    test[0].bullets[4].x = test[0].bullets[4].x%780 + 10;
    if (test[0].bullets[4].x == 10) {
      sound.load();
      //sound.play();
      
      $('.action-left')
        .attr('class','action-left action')
        .addClass('charge')
        .show()
        .delay(100)
        .fadeOut(400)
      $('.action-right')
        .attr('class','action-right action')
        .addClass('fire')
        .show()
        .delay(100)
        .fadeOut(400)
        
    }
    
  */
    render(testJSON[testJSONCounter]);
    testJSONCounter ++;
  }
  
  var render = function(frame) {
  
    if (frame.p1 == 'EXPLODED' || frame.p2 == 'EXPLODED') {
      clearInterval(gameTimer);
      return;
    }
    
    // Move the Planes
    $('.p1').css({'top':(80*frame.p1)+20});
    $('.p2').css({'top':(80*frame.p2)+20});
    // Set the Bullet Count
    $('.gb').text(frame.b1);
    $('.ob').text(frame.b2);
    // Draw the Bullets
    $('.bul').remove(); 
    for (i in frame.bullets) {
      $bullet = $('<div></div>');
      $bullet.addClass('bul');
      console.log(frame.bullets[i].x, frame.bullets[i])
      $bullet.css({'left':frame.bullets[i].x, 'top': frame.bullets[i].y * 80 + 40});
      $('.playing-field').append($bullet);
    }
    if (frame.action1 !== 'NONE') {
      $('.action-left')
        .attr('class','action-left action')
        .addClass(frame.action1)
        .show()
        .delay(100)
        .fadeOut(400)
      $('.action-right')
        .attr('class','action-right action')
        .addClass(frame.action2)
        .show()
        .delay(100)
        .fadeOut(400)
      if ((frame.action1 == 'shoot' && frame.b1 > 0)|| (frame.action2 == 'shoot' && frame.b2 > 0)) {
      
        sound.load();
        sound.play();
      }
    }
  }
  
  var gameTimer = setInterval(gameStep, MS_FRAME);
  
  $(document).on('keypress', function(e) {
    if (e.keyCode == 32) {
      clearInterval(gameTimer);
    }
  })
});