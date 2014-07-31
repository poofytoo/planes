$(document).ready(function() {
  $('.uploadBox').on('dragover', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      $(this).addClass('dragging');
  });
  
  $('.uploadBox').on('dragleave', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      $(this).removeClass('dragging');
  });
  
  $('.uploadBox').on('drop', function(event) {
      event.preventDefault();  
      event.stopPropagation();
      console.log(event.originalEvent.dataTransfer.files[0].name);
  });
  
  $('.fileUpload').on('change', function(e) {
    console.log($(this).get(0).files[0].name)
  });
})