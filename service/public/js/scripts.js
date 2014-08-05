$(document).ready(function() {

  // Settings
  
  var settingsActivated = false;
  $('.right-settings').on('mouseover', function() {
    if (!settingsActivated) {
      $(this).parent().animate({left: '-10px'}, 90);
    }
  });
  $('.right-settings').on('mouseleave', function() {
    if (!settingsActivated) {
      $('.greeting').animate({left: '0'}, 70);
    }
  });
  $('.right-settings').on('click', function() { 
    if (! settingsActivated) {
      settingsActivated = true;
      $(this).parent().animate({left: '-320px'}, 200);
      $('.right-settings').find('.fa')
        .removeClass('fa-cog')
        .addClass('fa-times');
    } else {
      settingsActivated = false;
      $(this).parent().animate({left: '0'}, 200);
      $('.right-settings').find('.fa')
        .removeClass('fa-times')
        .addClass('fa-cog');
    }
  });
  
  $('.emails').on('click', function() {
    $s = $(this)
    $e = $(this).find('.email-state');
    if ($e.data('state') == 'on') {
      $e.fadeOut(100, function(){
        $e.remove();
        $s.append('<span data-state="off" class="email-state email-off">off</span>'); 
        $.post('/setemails', {state: 'off'})
      }) 
    } else {
      $e.fadeOut(100, function(){
        $e.remove();
        $s.append('<span data-state="on" class="email-state email-on">on</span>'); 
        $.post('/setemails', {state: 'on'})
      })
    }
  });
  
  // File Upload
  
  $('.upload-box').on('dragover', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      $(this).addClass('dragging');
  });
  
  $('.upload-box').on('dragleave', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      $(this).removeClass('dragging');
  });
  
  $('.upload-box').on('drop', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      $(this).removeClass('dragging');
      $(this).addClass('drop');
  });
  
  $('.file-upload').on('change', function(e) {
    if ($(this).get(0).files[0].name != '') {
      var fileName = $('.file-upload').get(0).files[0].name;
      $('.botDesc').val(blabber());
      $('.botName').val(fileName.split('.')[fileName.split('.').length - 2]);
      window.setTimeout(function(){
        $('.upload-box').addClass('drop')
        $('.upload-bot').addClass('no-background')
        $('.form-fill').slideDown(300);
        $('.download-template').fadeOut(200);
      }, 500);
      $('.upload-btn-text').text(fileName);
    }
  });
  
  // Load the Top Challengers
  // This code was written when I was very sleepy
  
  $.get('/getbots', function(data) {
    var chtml = '';
    for (i in data) {
      var bot = data[i];
      $botBox = $('.bot-item-template').clone();
      $botBox.addClass('bot-item').removeClass('bot-item-template');
      $botBox.find('.challengerBot').html(bot.botName);
      $botBox.find('.statsBox').addClass('statsBox'+i);
      $botBox.find('.num').text((parseInt(i)+1));
      $botBox.find('.w').text(bot.wins);
      $botBox.find('.l').text(bot.losses);
      $botBox.find('.r').text(bot.elo);
      $botBox.find('.challengerName').text(bot.user);
      
      $botBox.find('.stats').data('id', i);
      $botBox.find('.challenge').data('id', bot.userId);
      if (bot.user == currentUser) {
        $botBox.find('.challenge').remove();
      }
      
      $('.top-challengers').append($botBox);
    }
  });
  
  $(document).on('click','.challenge', function() {
    var $btn = $(this);
    var id = $btn.data('id');
    if (!$btn.hasClass('challenge-sent')) {
      $.post('/makerequest', {id: id + ''}, function(data) {
        $btn.addClass('challenge-sent');
        $btn.removeAttr('href');
        $btn.text('challenge sent!');
        getPlayedGames();
      })
    }
  })
  
  // Get Played Games
  
  var getPlayedGames = function() {
    $.get('/getgames', function(data) {
      console.log(data)
      
      var chtml = '';
      $('.match-list').html('');
      
      for (i in data) {
        var bot = data[i];
        $botBox = $('.match-item-template').clone();
        $botBox.addClass('bot-item').removeClass('match-item-template');
        $botBox.find('.challengerBot').html(bot.opponentName + ' <span class="match-id">' + bot.gameId + '</span> ');
        $botBox.find('.view').attr('href', '/arena?' + bot.gameId);
        if (bot.status == 'watched') {
          $botBox.find('.view').text('watch again');
          $botBox.find('.view').removeClass('view').addClass('watched');
        } else if (bot.status == 'waiting') {
          $botBox.find('.view').removeAttr('href');
          $botBox.find('.view').text('loading...');
          $botBox.find('.view').removeClass('view').addClass('waiting');
        }
        
        $('.match-list').append($botBox);
      }
    })
  }
  getPlayedGames();
  window.setInterval(function(){
    console.log(windowInFocus)
    if (windowInFocus) {
      getPlayedGames();
    }
  }, 1000 * 60 * 3);
  
  var windowInFocus = true;
  $(window).blur(function(){
    console.log('out of focus')
    windowInFocus = false;  
  });
  $(window).focus(function(){
    getPlayedGames();
    windowInFocus = true;
  });
    
  // Challenger Stats Display 
  
  $(document).on('click','.stats', function() {
    var id = $(this).data('id');
    $(this).parent().parent().find('.statsBox').slideToggle(150);
  })
  
  // This code is supposed to make my blocks the same height
  // I stole it from css-tricks
  // If you want it back, let me know. 
  
  var currentTallest = 0,
     currentRowStart = 0,
     rowDivs = new Array(),
     $el,
     topPosition = 0;

   $('.row').find('.content-box').each(function() {
  
     $el = $(this);
     topPostion = $el.position().top;
     
     if (currentRowStart != topPostion) {
  
       // we just came to a new row.  Set all the heights on the completed row
       for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
         rowDivs[currentDiv].height(currentTallest);
       }
  
       // set the variables for the new row
       rowDivs.length = 0; // empty the array
       currentRowStart = topPostion;
       currentTallest = $el.height();
       rowDivs.push($el);
  
     } else {
  
       // another div on the current row.  Add it to the list and check if it's taller
       rowDivs.push($el);
       currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
  
    }
     
    // do the last row
     for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       rowDivs[currentDiv].height(currentTallest);
     }
     
   });
})
