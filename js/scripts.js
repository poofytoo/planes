$(document).ready(function(){

  var FRAME_RATE = 48
  var MS_FRAME = 1000/FRAME_RATE

  var testJSONCounter = 0
    
  var k = 0;
  var g = 0;
  
  
  // Load Sound Effects
  var soundList = ['charge-left',
                   'charge-right',
                   'pew-left',
                   'pew-right',
                   'dud-left',
                   'dud-right'];
  for (i in soundList) {
    snd = soundList[i];
    var $a = $('<audio></audio>')
    $a.attr('src',"assets/" + snd + ".ogg")
      .addClass(snd);
    $('body').append($a);
  }
  
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
      $bullet.css({'left':frame.bullets[i].x, 'top': frame.bullets[i].y * 80 + 40});
      $('.playing-field').append($bullet);
    }
    if (frame.action1 !== 'NONE') {
      $('.action-left')
        .attr('class','action-left action')
        .addClass(frame.action1)
        .show()
        .delay(300)
        .fadeOut(50)
      $('.action-right')
        .attr('class','action-right action')
        .addClass(frame.action2)
        .show()
        .delay(300)
        .fadeOut(50)
      console.log(frame.action2, frame.b2)
      if (frame.action1 == 'shoot') {
        $('.pew-left')[0].load();
        $('.pew-left')[0].play();
      }
      if (frame.action2 == 'shoot') {
        $('.pew-right')[0].load();
        $('.pew-right')[0].play();
      }
      if (frame.action1 == 'dud') {
        $('.dud-left')[0].load();
        $('.dud-left')[0].play();
      }
      if (frame.action2 == 'dud') {
        $('.dud-right')[0].load();
        $('.dud-right')[0].play();
      }
      if (frame.action1 == 'charge') {
        $('.charge-left')[0].load();
        $('.charge-left')[0].play();
        $a = $('<div></div>')
            .addClass('charge-gif')
            .css({'top':(80*frame.p1)+20, 'left': '40px'})
        $('.playing-field').append($a);
        $a.fadeOut();
      }
      if (frame.action2 == 'charge') {
        $('.charge-right')[0].load();
        $('.charge-right')[0].play();
        $a = $('<div></div>')
            .addClass('charge-gif')
            .css({'top':(80*frame.p2)+20, 'right': '40px'})
        $('.playing-field').append($a);
        $a.fadeOut();
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
