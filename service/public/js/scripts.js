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
      $(this).parent().animate({left: '-220px'}, 200);
      console.log($('.right-settings').find('.fa'));
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
      console.log(event.originalEvent.dataTransfer.files[0].name);
  });
  
  $('.file-upload').on('change', function(e) {
    if ($(this).get(0).files[0].name != '') {
      $('.upload-box').addClass('drop');
      console.log($(this).get(0).files[0].name);
    }
  });
  
})