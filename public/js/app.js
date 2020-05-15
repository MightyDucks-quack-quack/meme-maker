'use strict'
// $(document).ready(function() {
//     $("#butt1").click(function() {
//       console.log('alive')
//       $("#postForm").fadeIn();
//     });
//   });
// console.log('alive');
// $('#caption').on('click', console.log('alive'))

// function clickForm(){
//   console.log('alive');
//   $('#postForm').fadeIn();
// };


$(".button").click(function () {
   $('.capForm').show();
  let capForm = $(capForm).html();
  let caption = $(this.capForm);
  if( caption =! $('.container')){
    capForm.hide();
    $('.capForm').show();
  }
});