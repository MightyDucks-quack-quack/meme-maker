'use strict'

$('.open').on('click', handleClick)

function handleClick(event) {
  let v = this.name
  $(`form[name="${v}"]`).slideToggle('swing')
}
