$(document).ready(function(){
  
  var FRAME_RATE = 60;
  var MS_FRAME = 1000/FRAME_RATE

  var SOUND = false;
  
  var testJSONCounter = 0
    
  var k = 0;
  var g = 0;
  
  
  // background sound potential: http://www.newgrounds.com/audio/listen/553128
  // ORIGINAL SOUND EFFECTS
  
  var soundList = ['charge-left-v',
                   'charge-right-v',
                   'pew-left-v',
                   'pew-right-v',
                   'up-left-v',
                   'up-right-v',
                   'down-left-v',
                   'down-right-v',
                   'explode-left-v',
                   'explode-right-v',
                   'dud-left-v',
                   'dud-right-v'];

  for (i in soundList) {
    snd = soundList[i];
    var $a = $('<audio></audio>')
    $a.attr('src',"assets/" + snd + ".ogg")
      .attr('preload', 'auto')
      .addClass(snd);
    $('body').append($a);
  }
 
  var playSnd = function(type,dir) {
    if (SOUND) {
      $('.'+type+'-'+dir+'-v')[0].load();
      $('.'+type+'-'+dir+'-v')[0].play();
    }
  }
          
  var testJSON = {};
  var id = document.URL.split('?')[1];
  
  $.get("/getgame", {id: id}, function (data) {
    if (data && data !== 'Game id not found.') {
      if (data === 'processing') {
        setTimeout(function(){
          $('.spinner').fadeOut(200, function(){
            $('.match-processing').fadeIn(200);
          });
        }, 200);
      } else {
        window.testJSON = data;
        setTimeout(function(){
          $('.fb-share-box').fadeIn(200);
          // You know, for dramatic effect.
          $('.go-btn').fadeIn(200);
          $('.spinner').fadeOut();
          $('.green').text(data.username1);
          $('.orange').text(data.username2);
        }, 100)
      }
    } else {
      setTimeout(function(){
        $('.spinner').fadeOut(200, function(){
          $('.invalid-id').fadeIn(200);
        });
      }, 200);
    }
  }).fail(function(){
      setTimeout(function(){
        $('.spinner').fadeOut(200, function(){
          $('.invalid-id').fadeIn(200);
        });
      }, 200);
  });
    
  $('.go-btn').on('click', function() {
    $('.cover').fadeOut(100);
    beginGame();
  });
    
  var gameStep = function() {
    render(window.testJSON[testJSONCounter], testJSONCounter);
    testJSONCounter ++;
  }
  
  var createShield = function(dir, planeLocation, t, canvas) {
    for (i = -1; i < 2; i ++) {
      MARGIN = 30;
      $shield = $('<div></div>');
      $shield.addClass('player-shield');
      bgShift = (-i - 1) * 80
      
      var shieldCss = {'top':(80*((planeLocation + i + 5) % 5))};
      shieldCss[dir] = (30 + t * 10) + 'px';
      shieldCss['height'] = 80;
      shieldCss['background-position'] = '0 ' + bgShift + 'px';
      $shield.css(shieldCss);
      
      if (dir == 'right') {
        $shield.addClass('flip');
      }
      
      canvas.append($shield);
    }
  }
    
  var render = function(frame, id) {
    if (!frame) {
      setTimeout(function(){$('.end-cover').fadeIn(500)}, 1000);
      $('h4').text('It\'s a TIE!');
      clearInterval(gameTimer);
      $('.bul').remove();
      return
    }
    if (frame.p1 == 'EXPLODED' || frame.p2 == 'EXPLODED') {
      clearInterval(gameTimer);
      playSnd('explode','left');
      playSnd('explode','right');
      $('.bul').remove();
        

      if (window.testJSON.result == 'DRAW') {
        $('h4').text('It\'s a TIE!');
      } else {
        if (frame.p1 == 'EXPLODED') {
          $('.winner-name').text($('.orange').text())
        } else {
          $('.winner-name').text($('.green').text())
        }
      }

      setTimeout(function(){$('.end-cover').fadeIn(500)}, 1000);
      return;
    }
    
    // Move the Planes
    $('.p1').css({'top':(80*frame.p1)+20});
    $('.p2').css({'top':(80*frame.p2)+20});
    // Set the Round Number
    var roundNum = Math.floor(id/24)
    if (roundNum >= 120) {
      roundNum = 'END'
    }
    $('.round-number').text(roundNum);
    
    // Create shield
    $('.player-shield').remove();
    if (frame.st1 > 0) {
      for (var i = 0; i < frame.st1; i++) {
        createShield('left', frame.p1, i, $('.playing-field'));
      }
    }
    if (frame.st2 > 0) {
      for (var i = 0; i < frame.st2; i++) {
        createShield('right', frame.p2, i, $('.playing-field'));
      }
    }
    
    // Set the Bullet Count
    $('.gb').text(frame.b1);
    $('.ob').text(frame.b2);
    
    // Draw the Bullets
    $('.bul').remove(); 
    for (i in frame.bullets) {
      $bullet = $('<div></div>');
      $bullet.addClass('bul');
      var bulCss = {'left':frame.bullets[i].x, 'top': frame.bullets[i].y * 80 + 40};
      if (frame.bullets[i].t == 's') {
        $bullet.addClass('super-bul');
      }
      $bullet.css(bulCss);
      $('.playing-field').append($bullet);
    }
    // Create the action icon
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
      
      var dirs = ['left','right']
      for (j in dirs) {
        i = parseInt(j)+1;
        var dir = dirs[j];    
        if (frame['action' + i] == 'shoot') {
          playSnd('pew',dir);
        }
        if (frame['action' + i] == 'dud') {
          playSnd('dud',dir);
        }
        if (frame['action' + i] == 'up') {
          playSnd('up',dir);
        }
        if (frame['action' + i] == 'down') {
          playSnd('down',dir);
        }
        if (frame['action' + i] == 'charge') {
          playSnd('charge',dir);
          
          var css = {'top':(80*frame['p' + i])+20}
          css[dir] = '10px'
          $a = $('<div></div>')
              .addClass('glow-overlay')
              .addClass(dir + '-overlay')
              .css(css)
              
          $('.playing-field').append($a);
          
          
          $a.fadeOut();
        }
      }
      
    }
  }
  
  var gameTimer;
  var beginGame = function() {
    gameTimer = setInterval(gameStep, MS_FRAME);
  }
    
  $(document).on('keypress', function(e) {
    if (e.keyCode == 93) {
      clearInterval(gameTimer);
        testJSONCounter = Math.floor((testJSONCounter + 24) / 24) * 24;
        gameStep();
    }
    if (e.keyCode == 91) {
      clearInterval(gameTimer);
        testJSONCounter = Math.floor((testJSONCounter - 24) / 24) * 24;
        gameStep();
    }
    if (e.keyCode == 102) {
        clearInterval(gameTimer);
        MS_FRAME = 1;
        gameTimer = setInterval(gameStep, MS_FRAME);
    }
    if (e.keyCode == 32) {
      console.log(gameTimer);
      if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = '';
      } else {
        gameStep();
        gameTimer = setInterval(gameStep, MS_FRAME);
      }
    }
  })
});
