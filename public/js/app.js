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
  let clicked = $(this).attr('class');

  console.log(clicked, 'clicked');
  $('.112126428').css("display", "block");

});