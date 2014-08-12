$(document).ready(function(){
  
  const NUM_LINES = 10;
  const NUM_PLANES = 2;
  var FRAME_RATE = 60;
  var MS_FRAME = 1000/FRAME_RATE

  var testJSONCounter = 0
    
  var k = 0;
  var g = 0;
  
  
  // Load Sound Effects
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
      .addClass(snd);
    $('body').append($a);
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
  
  var render = function(frame, id) {
    if (!frame) {
      setTimeout(function(){$('.end-cover').fadeIn(500)}, 1000);
      $('h4').text('It\'s a TIE!');
      clearInterval(gameTimer);
      $('.bul').remove();
      return
    }
    /*
    if (frame.p1 == 'EXPLODED' || frame.p2 == 'EXPLODED') {
      clearInterval(gameTimer);
      $('.explode-left-v')[0].load();
      $('.explode-left-v')[0].play();
      $('.explode-right-v')[0].load();
      $('.explode-right-v')[0].play();
      $('.bul').remove();
        
      if (frame.p1 == 'EXPLODED') {
        $('.winner-name').text($('.orange').text())
      } else {
        $('.winner-name').text($('.green').text())
      }
      setTimeout(function(){$('.end-cover').fadeIn(500)}, 1000);
      return;
    }
    */
    
    // Move the Planes
    for (var i = 0; i < NUM_PLANES; i++) {
      $('#bot1-' + i).css({'top':(80*frame.p1[i])+20});
      $('#bot2-' + i).css({'top':(80*frame.p2[i])+20});
    }
    // Set the Round Number
    var roundNum = Math.floor(id/24)
    if (roundNum >= 120) {
      roundNum = 'END'
    }
    $('.round-number').text(roundNum);
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
          $('.pew-'+dir+'-v')[0].load();
          $('.pew-'+dir+'-v')[0].play();
        }
        if (frame['action' + i] == 'dud') {
          $('.dud-'+dir+'-v')[0].load();
          $('.dud-'+dir+'-v')[0].play();
        }
        if (frame['action' + i] == 'up') {
          $('.up-'+dir+'-v')[0].load();
          $('.up-'+dir+'-v')[0].play();
        }
        if (frame['action' + i] == 'down') {
          $('.down-'+dir+'-v')[0].load();
          $('.down-'+dir+'-v')[0].play();
        }
        if (frame['action' + i] == 'charge') {
          $('.charge-'+dir+'-v')[0].load();
          $('.charge-'+dir+'-v')[0].play();
          
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
    if (e.keyCode == 32) {
      clearInterval(gameTimer);
    }
  })

  $('.playing-field').css('height', NUM_LINES * 80);
  for (var i = 1; i < NUM_LINES; i++) {
    $('<div class="line"></div>').css('top', 80 * i + 'px').appendTo($('.playing-field'));
  }
  for (var i = 0; i < NUM_PLANES; i++) {
    $('.playing-field').append('<div id="bot1-' + i + '" class="plane p1"></div>');
    $('.playing-field').append('<div id="bot2-' + i + '" class="plane p2"></div>');
  }
});
